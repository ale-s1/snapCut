import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenuComponent } from './shared/components/side-menu/desktop/side-menu/side-menu.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, SideMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'snapCut';
  videoHeight: number = 120;
  videoRatio: string = '16:9';

  @ViewChild('videoContainer') videoContainer!: ElementRef;
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
    const video: HTMLVideoElement = this.videoPlayer.nativeElement;
    video.src = newUrl;
    video.load();
    video.play();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const containerHeight = this.videoContainer.nativeElement.offsetHeight;
      this.videoHeight = containerHeight;
    });
  }
}
