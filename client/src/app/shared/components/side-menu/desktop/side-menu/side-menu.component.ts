import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { DEFAULT_ASPECT_RATIO } from '@app/shared/constants/const';
import { VideoPlayerService } from '../../../../../core/services/video-player.service';
import { VideoRatio } from '../../../../models/type';

@Component({
  selector: 'app-side-menu',
  imports: [CommonModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css',
})
export class SideMenuComponent {
  public formDisabled = false;
  readonly panelState = signal(false);
  public videoRatio: string = DEFAULT_ASPECT_RATIO;

  constructor(private videoPlayerService: VideoPlayerService) {}

  public togglePanel() {
    this.panelState.update((state) => !state);
  }

  public onSelectedFile(event: Event) {}

  public onCheckboxChange(event: any) {}

  public changeVideoAspectRatio(aspect: VideoRatio) {
    this.videoPlayerService.changeRatio(aspect);
    this.videoRatio = aspect;
  }
}
