import { Component, NO_ERRORS_SCHEMA, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Article } from '../article/article';
import {Breadcrumbs} from '../breadcrumbs/breadcrumbs';
import { Data, BudgetData } from '../data';
import { Chart, registerables } from 'chart.js';
import * as d3 from 'd3';

@Component({
  selector: 'pb-homepage',
  standalone: true,
  imports: [Article, Breadcrumbs],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss'
})
export class Homepage implements OnInit {

  public dataSource: any = {
            datasets: [
                {
                    data: [],
                    backgroundColor: [
                        '#ffcd56',
                        '#ff6384',
                        '#36a2eb',
                        '#fd6b19'
                    ]
                }
            ],
            labels: []
        };

  constructor(private dataService: Data, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      Chart.register(...registerables);
    }
  }

  ngOnInit(): void {
    this.dataService.budget$.subscribe((budgetData: BudgetData | null) => {
      if (budgetData && budgetData.myBudget) {
        for (let i = 0; i < budgetData.myBudget.length; i++) {
            this.dataSource.datasets[0].data[i] = budgetData.myBudget[i].budget;
            this.dataSource.labels[i] = budgetData.myBudget[i].title;
        }
        // Only create charts in the browser
        if (isPlatformBrowser(this.platformId)) {
          this.createChart();
          this.createD3Chart(budgetData.myBudget);
        }
      }
    });
    this.dataService.loadBudgetData();
  }

  createChart() {
    // Only run in browser environment
    if (isPlatformBrowser(this.platformId)) {
      const canvas = document.getElementById("myChart") as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          new Chart(ctx, {
            type: 'pie',
            data: this.dataSource
          });
        }
      }
    }
  }

  createD3Chart(data: any[]) {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Clear any existing chart
    d3.select("#d3Chart").selectAll("*").remove();

    const svg = d3.select("#d3Chart")
      .append("svg")
      .attr("width", 960)
      .attr("height", 450)
      .append("g")
      .attr("transform", "translate(480,225)");

    const radius = Math.min(960, 450) / 2;

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.title))
      .range(["#ffcd56", "#ff6384", "#36a2eb", "#fd6b19"]);

    const pie = d3.pie<any>()
      .sort(null)
      .value(d => d.budget);

    const arc = d3.arc<any>()
      .outerRadius(radius * 0.8)
      .innerRadius(radius * 0.4);

    const outerArc = d3.arc<any>()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    // Create pie slices
    const slice = svg.selectAll(".slice")
      .data(pie(data))
      .enter().append("path")
      .attr("class", "slice")
      .attr("d", arc)
      .style("fill", (d: any) => color(d.data.title) as string);

    // Add labels
    const text = svg.selectAll(".label")
      .data(pie(data))
      .enter().append("text")
      .attr("class", "label")
      .attr("dy", ".35em")
      .text((d: any) => `${d.data.title}: $${d.data.budget}`)
      .attr("transform", (d: any) => {
        const pos = outerArc.centroid(d);
        pos[0] = radius * (this.midAngle(d) < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style("text-anchor", (d: any) => this.midAngle(d) < Math.PI ? "start" : "end")
      .style("font-size", "14px")
      .style("fill", "#333");

    // Add polylines
    const polyline = svg.selectAll(".line")
      .data(pie(data))
      .enter().append("polyline")
      .attr("class", "line")
      .attr("points", (d: any) => {
        const pos = outerArc.centroid(d);
        pos[0] = radius * 0.95 * (this.midAngle(d) < Math.PI ? 1 : -1);
        const points = [arc.centroid(d), outerArc.centroid(d), pos];
        return points.map(point => point.join(",")).join(" ");
      })
      .style("fill", "none")
      .style("stroke", "black")
      .style("stroke-width", "2px")
      .style("opacity", 0.3);
  }

  private midAngle(d: any): number {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }



}
