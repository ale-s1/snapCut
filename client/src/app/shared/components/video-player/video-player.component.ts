import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';

export const DEFAULT_VIDEO_HEIGHT = 622;
export const DEFAULT_ASPECT_RATIO = '16:9';

@Component({
  selector: 'app-video-player',
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.css',
})
export class VideoPlayerComponent {
  public videoHeight: number = DEFAULT_VIDEO_HEIGHT;
  public videoRatio: string = DEFAULT_ASPECT_RATIO;
  public isVideoLoaded = false;

  @ViewChild('videoContainer') videoContainer!: ElementRef<HTMLElement>;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  changeVideoAspectRatio(ratio: string) {
    this.videoRatio = ratio;
  }

  selectedFile(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    if (!fileList) {
      return;
    }
    const file = fileList[0];
    if (file.type != 'video/mp4') {
      return;
    }
    this.loadVideo(file);
  }

  loadVideo(file: File) {
    const videoEl = this.videoPlayer.nativeElement;
    if (videoEl.src) {
      URL.revokeObjectURL(videoEl.src);
    }
    const newUrl = URL.createObjectURL(file);
    videoEl.src = newUrl;
    videoEl.load();

    videoEl.onloadedmetadata = () => {
      videoEl.play();
      this.isVideoLoaded = true;
    };
  }
}
