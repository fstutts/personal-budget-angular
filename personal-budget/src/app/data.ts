import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface BudgetItem {
  title: string;
  budget: number;
}

export interface BudgetData {
  myBudget: BudgetItem[];
}

@Injectable({
  providedIn: 'root'
})
export class Data {
  private apiUrl = 'http://localhost:3000/budget';

  // Private variable to store the budget data
  private budgetData: BudgetData | null = null;

  // BehaviorSubject to make the data reactive (components can subscribe to changes)
  private budgetSubject = new BehaviorSubject<BudgetData | null>(null);

  // Public observable that components can subscribe to
  public budget$ = this.budgetSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Method to fetch budget data from backend
  getBudgetData(): Observable<BudgetData> {
    return this.http.get<BudgetData>(this.apiUrl);
  }

  // Method to fetch and store budget data in the service
  loadBudgetData(): void {
    // Only make HTTP call if data doesn't exist yet
    if (this.budgetData === null) {
    this.getBudgetData().subscribe({
      next: (data: BudgetData) => {
        this.budgetData = data;
        this.budgetSubject.next(data); // Notify all subscribers
      },
      error: (error) => {
        console.error('Error fetching budget data:', error);
        this.budgetSubject.next(null);
      }
    });
  } else {
    //  Data already exists, just emit the existing data
    this.budgetSubject.next(this.budgetData);
    }
  }

  // Method to get the current stored budget data (synchronous)
  getCurrentBudgetData(): BudgetData | null {
    return this.budgetData;
  }

  // Method to get a specific budget item by title
  getBudgetItem(title: string): BudgetItem | undefined {
    return this.budgetData?.myBudget.find(item => item.title === title);
  }

  // Method to get the total budget
  getTotalBudget(): number {
    if (!this.budgetData) return 0;
    return this.budgetData.myBudget.reduce((total, item) => total + item.budget, 0);
  }

  // Method to check if data is already loaded
  isDataLoaded(): boolean {
    return this.budgetData !== null;
  }

  // Method to force refresh data from backend (ignores cache)
  refreshBudgetData(): void {
    this.budgetData = null; // Clear existing data
    this.loadBudgetData(); // Load fresh data
  }
}
