import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Card } from '../app.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() data: Card;
  @Input() isHome: Card;
  @Output() deleteCardEvent = new EventEmitter<number>();
  loading: boolean = true;

  constructor() { }

  ngOnInit(): void {
    this.loading = false;
  }

  deleteCard(): void {
    this.deleteCardEvent.emit(this.data.id);
  }
}
