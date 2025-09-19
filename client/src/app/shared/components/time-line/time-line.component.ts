import { CommonModule, NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Output,
  ViewChild,
} from '@angular/core';

export const enum STATUS {
  off = 0,
  resize = 1,
}

export const DEFAULT_TIMELINE_BOX_HEIGHT = 341;

@Component({
  selector: 'app-time-line',
  imports: [CommonModule, NgClass],
  templateUrl: './time-line.component.html',
  styleUrl: './time-line.component.css',
})
export class TimeLineComponent {
  @ViewChild('timeLine') timeLineElement!: ElementRef<HTMLElement>;
  @Output() status: STATUS = STATUS.off;

  private startTimeLineElementY: number = 0;
  private startTimeLineElementHeight: number = 0;
  public finalTimeLineElementHeight: number = DEFAULT_TIMELINE_BOX_HEIGHT;

  setStatus(event: MouseEvent, statusNumber: number) {
    this.status = statusNumber;

    if (statusNumber === STATUS.resize) {
      this.startTimeLineElementY = event.clientY;
      this.startTimeLineElementHeight = this.finalTimeLineElementHeight;
      event.preventDefault();
    }
  }

  resize(event: MouseEvent) {
    const deltaY = event.clientY - this.startTimeLineElementY;
    let newHeight = this.startTimeLineElementHeight - deltaY;

    newHeight = Math.max(42, Math.min(newHeight, 531));
    this.finalTimeLineElementHeight = newHeight;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.status === STATUS.resize) {
      this.resize(event);
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.status === STATUS.resize) {
      this.status = STATUS.off;
    }
  }
}
