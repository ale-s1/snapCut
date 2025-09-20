import { CommonModule, NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { AudioService } from '@app/core/services/audio.service';
import { VideoPlayerService } from '@app/core/services/video-player.service';
import {
  BTN_VIDEO_PLAYER,
  DEFAULT_TIMELINE_BOX_HEIGHT,
  STATUS,
} from '@app/shared/constants/time-line.constants';
import { AudioState, StreamState } from '@app/shared/models/media-state';
import { BtnAction, BtnControl } from '@app/shared/models/time-line.model';
import { SvgIconComponent } from 'angular-svg-icon';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-time-line',
  imports: [CommonModule, NgClass, SvgIconComponent],
  templateUrl: './time-line.component.html',
  styleUrl: './time-line.component.css',
})
export class TimeLineComponent implements AfterViewInit, OnDestroy {
  @ViewChild('timeLine') timeLineElement!: ElementRef<HTMLElement>;
  @ViewChild('audioContainer') audioContainer!: ElementRef<HTMLElement>;
  @ViewChild('playhead') playheadElement!: ElementRef<HTMLElement>;
  @ViewChild('overlayTimeLine') overlayTimeLine!: ElementRef<HTMLElement>;

  public status: STATUS = STATUS.off;
  public btnPlayerControls: BtnControl[] = BTN_VIDEO_PLAYER;
  public videoPlayerState: StreamState | null = null;
  public audioState: AudioState | null = null;
  public thumbnails: string[] = [];
  public dragging: boolean = false;
  public finalTimeLineElementHeight: number = DEFAULT_TIMELINE_BOX_HEIGHT;
  public playing: boolean = false;

  private startTimeLineElementY: number = 0;
  private startTimeLineElementHeight: number = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private videoPlayerService: VideoPlayerService,
    private audioService: AudioService
  ) {
    this.handleState();
  }

  private handleState(): void {
    this.videoPlayerService
      .getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.videoPlayerState = state;
        this.playing = state.playing;
        this.thumbnails = state.thumbnails;
        this.onVideoUpdate(state.currentTime);
      });
    this.audioService
      .getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.audioState = state;
      });
  }

  public setStatus(event: MouseEvent, statusNumber: number): void {
    this.status = statusNumber;

    if (statusNumber === STATUS.resize) {
      this.startTimeLineElementY = event.clientY;
      this.startTimeLineElementHeight = this.finalTimeLineElementHeight;
      event.preventDefault();
    }
  }

  private resize(event: MouseEvent): void {
    const deltaY = event.clientY - this.startTimeLineElementY;
    let newHeight = this.startTimeLineElementHeight - deltaY;

    newHeight = Math.max(42, Math.min(newHeight, 531));
    this.finalTimeLineElementHeight = newHeight;
  }

  @HostListener('document:mousemove', ['$event'])
  public onMouseMove(event: MouseEvent): void {
    if (this.status === STATUS.resize) {
      this.resize(event);
    }
  }

  @HostListener('document:mouseup', ['$event'])
  public onMouseUp(event: MouseEvent): void {
    if (this.status === STATUS.resize) {
      this.status = STATUS.off;
    }
  }

  public handlePlayerControlAction(action: string): void {
    switch (action) {
      case BtnAction.togglePlay:
        this.togglePlay();
        this.playing = !this.playing;
        break;
      case BtnAction.goBack:
        this.seek(true);
        break;
      case BtnAction.skip:
        this.seek(false);
        break;
      default:
        console.log('Unknown action');
    }
  }

  private togglePlay() {
    if (this.playing) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
  }

  public getImage(control: BtnControl): string {
    if (control.action === BtnAction.togglePlay) {
      return this.playing
        ? 'img/player-control/pause.svg'
        : 'img/player-control/play.svg';
    }

    return control.url;
  }
  private playVideo(): void {
    this.videoPlayerService.play();
    this.audioService.play();
  }
  private pauseVideo(): void {
    this.videoPlayerService.pause();
    this.audioService.pause();
  }

  private seek(goback: boolean = false): void {
    if (!this.videoPlayerState) return;

    const current = this.videoPlayerState.currentTime;
    const goTo = goback ? current - 10 : current + 10;
    this.videoPlayerService.seekTo(goTo);
    this.audioService.seekTo(goTo);
  }

  public onPointerDown(event: PointerEvent): void {
    this.dragging = true;
    this.seekAt(event.clientX);
    (event.target as Element).setPointerCapture(event.pointerId);
  }

  private seekAt(clientX: number): void {
    if (!this.videoPlayerState || !this.audioState) return;

    const timeLineBox =
      this.timeLineElement.nativeElement.getBoundingClientRect();
    const x = Math.min(
      Math.max(clientX - timeLineBox.left, 10),
      timeLineBox.width
    );

    const pct = x / timeLineBox.width;

    const audio = timeLineBox.width;
    const video = timeLineBox.width;

    const duration =
      this.videoPlayerState.duration || this.audioState.duration || 1;
    const newTime = pct * Number(duration);

    this.audioService.seekTo(newTime);
    this.videoPlayerService.seekTo(newTime);

    this.playheadElement.nativeElement.style.left = `${pct * 100}%`;
  }

  public onVideoUpdate(time: number): void {
    if (!this.audioContainer || !this.audioState) return;

    const duration = this.audioState.duration || 1;
    const t = this.audioState.currentTime;
    const pct = (t / duration) * 100;
    this.playheadElement.nativeElement.style.left = `${pct}%`;
  }

  public onPointerUp(event: PointerEvent): void {
    const target = event.target as Element;
    target.releasePointerCapture(event.pointerId);
    this.dragging = false;
    this.seekAt(event.clientX);
  }

  public onPointerMove(event: PointerEvent): void {
    if (!this.dragging) return;
    this.seekAt(event.clientX);
  }

  public onPointerLeave(event: PointerEvent): void {
    this.dragging = false;
  }

  ngAfterViewInit(): void {
    if (this.audioContainer?.nativeElement) {
      this.audioService.initializeWaveSurfer(this.audioContainer.nativeElement);
    } else {
      console.log('Audio container not found');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
