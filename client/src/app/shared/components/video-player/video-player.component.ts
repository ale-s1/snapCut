import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { AudioService } from '@app/core/services/audio.service';
import { MediaProcessingService } from '@app/core/services/media-processing.service';
import { VideoPlayerService } from '@app/core/services/video-player.service';
import { finalize, forkJoin, Subject, takeUntil } from 'rxjs';

import {
  DEFAULT_ASPECT_RATIO,
  DEFAULT_VIDEO_HEIGHT,
} from '@app/shared/constants/const';
import { VideoRatio } from '@app/shared/models/type';

@Component({
  selector: 'app-video-player',
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.css',
})
export class VideoPlayerComponent implements AfterViewInit, OnDestroy {
  public videoHeight: number = DEFAULT_VIDEO_HEIGHT;
  public videoRatio: VideoRatio = DEFAULT_ASPECT_RATIO;
  public isVideoLoaded: boolean = false;

  private destroy$ = new Subject<void>();

  @ViewChild('videoContainer', { static: false })
  videoContainer!: ElementRef<HTMLElement>;
  @ViewChild('videoPlayer', { static: false })
  videoPlayer!: ElementRef<HTMLVideoElement>;

  constructor(
    private videoPlayerService: VideoPlayerService,
    private mediaProcessingService: MediaProcessingService,
    private audioService: AudioService
  ) {
    this.handleSubscriptions();
  }

  private handleSubscriptions(): void {
    this.videoPlayerService.getAspectRatio().subscribe((aspect) => {
      this.videoRatio = aspect;
    });
  }

  public selectedFile(event: Event): void {
    const fileList = (event.target as HTMLInputElement).files;
    if (!fileList) {
      return;
    }
    const file = fileList[0];
    if (!this.isValidFile(file)) {
      return;
    }
    this.loadVideo(file);
  }

  private loadVideo(file: File): void {
    const videoEl = this.videoPlayer.nativeElement;
    if (videoEl.src) {
      URL.revokeObjectURL(videoEl.src);
      videoEl.src = '';
    }
    const newUrl = URL.createObjectURL(file);
    this.videoPlayerService.setLoading(true);

    this.playStreamVideo(newUrl);
    this.generateVideoAssets(file);
  }

  private isValidFile(file: File): boolean {
    const allowedTypes = ['video/mp4', 'video/quicktime'];
    return allowedTypes.includes(file.type);
  }

  private playStreamVideo(url: string) {
    this.videoPlayerService
      .playStream(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {},
        error: (err) => {
          URL.revokeObjectURL(url);
        },
      });
  }

  private generateVideoAssets(file: File): void {
    forkJoin({
      imagen: this.mediaProcessingService.getVideoThumbnails(file),
      audio: this.mediaProcessingService.extractAudio(file),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.videoPlayerService.setLoading(false);
        })
      )
      .subscribe({
        next: (res) => {
          this.videoPlayerService.setThumbails(res.imagen);
          this.audioService.loadAudio(res.audio);
          this.isVideoLoaded = true;
        },
        error: (err) => {
          this.videoPlayerService.cleanUp();
          this.isVideoLoaded = false;
        },
      });
  }

  ngAfterViewInit(): void {
    this.videoPlayerService.initializeVideo(this.videoPlayer.nativeElement);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
