import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { StreamState } from '../../shared/models/media-state';
import { VideoRatio } from '../../shared/models/type';
import { timeToString } from '../../shared/utils/utils';

@Injectable({
  providedIn: 'root',
})
export class VideoPlayerService {
  private state: StreamState = {
    playing: false,
    paused: false,
    ended: false,
    currentTime: 0,
    readableCurrentTime: '00:00:00',
    readableDuration: '00:00:00',
    error: false,
    duration: 0,
    isVideoLooping: false,
    isFileSelected: false,
    thumbnails: [],
    volume: 1,
    muted: true,
  };

  private videoEvents = [
    'ended',
    'playing',
    'pause',
    'timeupdate',
    'loadmetadata',
    'canplay',
  ];

  private destroy$ = new Subject<void>();
  private aspectRatio$ = new Subject<VideoRatio>();
  private stateChange: BehaviorSubject<StreamState> = new BehaviorSubject(
    this.state
  );
  private video: HTMLVideoElement | null = null;

  public initializeVideo(videoElement: HTMLVideoElement): void {
    this.video = videoElement;
    this.video.volume = 1;
    this.video.preload = 'metadata';
    this.video.muted = true;
  }

  private getVideoElement(): HTMLVideoElement {
    if (!this.video) {
      throw new Error('Video element not initialized');
    }
    return this.video;
  }

  public changeRatio(ratio: VideoRatio): void {
    this.aspectRatio$.next(ratio);
  }

  public getAspectRatio(): Observable<VideoRatio> {
    return this.aspectRatio$.asObservable();
  }

  private streamObservable(url: string): Observable<Event> {
    return new Observable((observer) => {
      const video = this.getVideoElement();

      video.src = url;

      video.load();

      this.updateState({ isFileSelected: true, muted: true, playing: false });

      const handler = (event: Event) => {
        this.updateStateEvents(event);
        observer.next(event);
      };

      this.addEvents(handler);

      return () => {
        this.removeEvents(handler);
        video.pause();
        video.currentTime = 0;
      };
    });
  }

  public playStream(url: string): Observable<Event> {
    return this.streamObservable(url).pipe(takeUntil(this.destroy$));
  }

  private addEvents(handler: EventListener): void {
    const video = this.getVideoElement();
    this.videoEvents.forEach((event) => {
      video.addEventListener(event, handler);
    });
  }

  private removeEvents(handler: EventListener): void {
    const video = this.getVideoElement();
    this.videoEvents.forEach((event) => {
      video.removeEventListener(event, handler);
    });
  }

  public play(): void {
    const video = this.getVideoElement();
    if (!video.src) return;
    video.play();
  }

  public mute(muted: boolean): void {
    const video = this.getVideoElement();
    if (!video.src) return;
    video.muted = muted;
    this.updateState({ muted: muted });
  }

  public setVolume(volumeNumber: number): void {
    const video = this.getVideoElement();
    const volume = Math.max(0, Math.min(1, volumeNumber));
    video.volume = volume;
    this.updateState({ volume });
  }

  public pause(): void {
    const video = this.getVideoElement();
    if (!video.src) return;
    video.pause();
    this.updateState({ paused: true, playing: false });
  }

  public seekTo(time: number): void {
    const video = this.getVideoElement();
    if (!video.src) return;

    const safeTime = Math.max(0, Math.min(time, video.duration || 0));
    this.updateState({
      currentTime: safeTime,
      readableCurrentTime: timeToString(safeTime),
    });
  }

  setThumbails(thumbnails: string[]): void {
    this.updateState({ thumbnails });
  }

  setLoading(isLoading: boolean): void {
    this.updateState({ isFileSelected: isLoading });
  }

  public destroy(): void {
    this.cleanUp();
    this.destroy$.next();
    this.destroy$.complete();
    this.aspectRatio$.complete();
  }

  public cleanUp(): void {
    const video = this.getVideoElement();

    video.pause();
    video.currentTime = 0;

    if (video.src) {
      URL.revokeObjectURL(video.src);
    }

    video.src = '';
    video.load();

    this.resetState();
  }

  private updateStateEvents(event: Event): void {
    const video = this.getVideoElement();

    switch (event.type) {
      case 'canplay':
        this.updateState({ duration: video.duration });
        break;
      case 'playing':
        this.updateState({ playing: true, paused: false, ended: false });
        break;
      case 'pause':
        this.updateState({ playing: false, paused: true, ended: false });
        break;
      case 'timeupdate':
        this.updateState({
          currentTime: video.currentTime,
          readableCurrentTime: timeToString(video.currentTime),
        });
        break;
      case 'ended':
        this.updateState({ ended: true });
        break;
      case 'error':
        this.updateState({ error: true });
        break;
    }
  }

  public getState(): Observable<StreamState> {
    return this.stateChange.asObservable();
  }

  private updateState(partialState: Partial<StreamState>) {
    this.state = { ...this.state, ...partialState };
    this.stateChange.next(this.state);
  }

  private resetState() {
    this.state = {
      playing: false,
      paused: false,
      ended: false,
      currentTime: 0,
      readableCurrentTime: '00:00:00',
      readableDuration: '00:00:00',
      error: false,
      duration: 0,
      isVideoLooping: false,
      isFileSelected: false,
      thumbnails: [],
      muted: true,
      volume: 1,
    };

    this.stateChange.next(this.state);
  }

  ngOnDestroy(): void {
    this.destroy();
  }
}
