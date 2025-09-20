import { Component, Input } from '@angular/core';

@Component({
  selector: 'pb-article',
  standalone: true,
  imports: [],
  templateUrl: './article.html',
  styleUrl: './article.scss'
})
export class Article {

  @Input() title = 'Title';
  @Input() content = 'Content';

}
