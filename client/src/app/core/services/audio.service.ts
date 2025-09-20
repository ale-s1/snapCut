import { Injectable, OnDestroy } from '@angular/core';
import { timeToString } from '@app/shared/utils/utils';
import { BehaviorSubject, Observable } from 'rxjs';
import WaveSurfer, { WaveSurferEvents } from 'wavesurfer.js';
import { AudioState } from '../../shared/models/media-state';
import { VideoPlayerService } from './video-player.service';

const DEFAULT_STATE = {
  playing: false,
  currentTime: 0,
  readableCurrentTime: '00:00:00',
  readableDuration: '00:00:00',
  duration: 0,
  active: false,
};

const OPTIONS_WAVE = {
  container: '',
  waveColor: 'violet',
  progressColor: 'violet',
  cursorColor: 'red',
  barWidth: 2,
  barRadius: 2,
  cursorWidth: 0,
};

@Injectable({
  providedIn: 'root',
})
export class AudioService implements OnDestroy {
  private state: AudioState = DEFAULT_STATE;

  private waveForm: WaveSurfer | null = null;
  private stateChange: BehaviorSubject<AudioState> = new BehaviorSubject(
    this.state
  );
  private isInitialized: boolean = false;

  constructor(private videoPlayerService: VideoPlayerService) {}

  public getState(): Observable<AudioState> {
    return this.stateChange.asObservable();
  }

  public initializeWaveSurfer(container: HTMLElement) {
    this.waveForm = WaveSurfer.create({ ...OPTIONS_WAVE, container });
    this.isInitialized = true;
    this.setupWaveSurferEvents();
  }

  private waveFormHandlers?: {
    interaction: () => void;
    play: () => void;
    pause: () => void;
    timeupdate: () => void;
    ready: () => void;
  };

  private setupWaveSurferEvents(): void {
    if (!this.waveForm) return;

    const interactionHandlerWave = () => this.onInteraction();
    const playHandlerWave = () => this.onPlay();
    const pauseHandlerWave = () => this.onPauseAudio();
    const timeUpdateHandlerWave = () => this.onTimeUpdate();
    const readyHandlerWave = () => this.onReady();

    this.waveForm.on('interaction', interactionHandlerWave);
    this.waveForm.on('play', playHandlerWave);
    this.waveForm.on('pause', pauseHandlerWave);
    this.waveForm.on('timeupdate', timeUpdateHandlerWave);
    this.waveForm.on('ready', readyHandlerWave);

    this.waveFormHandlers = {
      interaction: interactionHandlerWave,
      play: playHandlerWave,
      pause: pauseHandlerWave,
      timeupdate: timeUpdateHandlerWave,
      ready: readyHandlerWave,
    };
  }

  private onInteraction(): void {
    if (!this.waveForm) return;
    this.videoPlayerService.seekTo(this.waveForm.getCurrentTime());
    this.updateState({ playing: true });
    this.play();
  }

  private onPlay(): void {
    if (!this.waveForm) return;
    this.updateState({ playing: true });
  }

  private onPauseAudio(): void {
    if (!this.waveForm) return;
    this.updateState({ playing: false });
  }

  private onTimeUpdate(): void {
    if (!this.waveForm) return;

    const currentTime = this.waveForm.getCurrentTime();
    this.updateState({
      currentTime,
      readableCurrentTime: timeToString(currentTime),
    });
  }

  private onReady(): void {
    if (!this.waveForm) return;

    const duration = this.waveForm.getDuration();
    const currentTime = this.waveForm.getCurrentTime();
    this.updateState({ duration, currentTime });
  }

  public play(): void {
    if (!this.waveForm || !this.isInitialized) return;

    this.waveForm.play();
    this.updateState({ playing: true });
  }

  public pause(): void {
    if (!this.waveForm || !this.isInitialized) return;

    this.waveForm.pause();
    this.updateState({ playing: false });
  }

  public toggleShowAudio(): void {
    if (!this.waveForm || !this.isInitialized) return;

    const active = !this.state.active;
    this.updateState({ active });
  }

  public seekTo(goTo: number): void {
    if (!this.waveForm || !this.isInitialized) return;

    const duration = this.waveForm.getDuration();
    const progress = goTo / duration;
    this.waveForm.seekTo(progress);
  }

  public removeAudio(): void {
    if (!this.waveForm || !this.isInitialized) return;

    this.waveForm.empty();
    this.resetState();
  }

  private resetState(): void {
    this.updateState(DEFAULT_STATE);
  }

  public async loadAudio(audioUrl: Blob) {
    if (!this.isInitialized || !this.waveForm) return;

    try {
      await this.waveForm.loadBlob(audioUrl);
    } catch (error) {}
  }

  private updateState(partialState: Partial<AudioState>): void {
    this.state = { ...this.state, ...partialState };
    this.stateChange.next(this.state);
  }

  public destroy(): void {
    this.cleanupWaveSurfer();
    this.stateChange.complete();
  }

  private cleanupWaveSurfer(): void {
    if (!this.waveForm) return;

    if (this.waveFormHandlers) {
      Object.entries(this.waveFormHandlers).forEach(([event, handler]) => {
        const eventName = event as keyof WaveSurferEvents;
        this.waveForm?.un(eventName, handler);
      });
    }

    this.waveForm.destroy();
    this.waveForm = null;
    this.isInitialized = false;
  }

  ngOnDestroy(): void {
    this.destroy();
  }
}
