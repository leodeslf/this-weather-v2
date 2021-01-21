import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-home',
  templateUrl: './confirm-home.component.html',
  styleUrls: ['./confirm-home.component.scss']
})
export class ConfirmHomeComponent implements OnInit {
  @Input() home: string;
  @Output() confirmHomeEvent = new EventEmitter();
  @Output() askHomeByGPSEvent = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  rightHomeLocation(): void {
    this.confirmHomeEvent.emit();
  }

  wrongHomeLocation(): void {
    this.askHomeByGPSEvent.emit();
  }
}
