import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-side-menu',
  imports: [CommonModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css',
})
export class SideMenuComponent implements OnInit {
  formDisabled = false;
  readonly panelState = signal(false);
  @Input() videoEl!: HTMLVideoElement | null;
  @Output() videoAspect = new EventEmitter<string>();
  @Output() selectedVideoFile = new EventEmitter<Event>();

  togglePanel() {
    this.panelState.update((state) => !state);
  }

  onSelectedFile(event: Event) {
    this.selectedVideoFile.emit(event);
  }

  onCheckboxChange(event: any) {}

  changeVideoAspectRatio(aspect: string) {
    this.videoAspect.emit(aspect);
  }

  ngOnInit() {
    if (this.videoEl) {
      this.formDisabled = false;
    }
  }
}
