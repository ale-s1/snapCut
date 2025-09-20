export interface StreamState {
  playing: boolean;
  paused: boolean;
  ended: boolean;
  currentTime: number;
  readableCurrentTime: string;
  readableDuration: string;
  duration: number;
  error: boolean;
  isVideoLooping: boolean;
  isFileSelected: boolean;
  thumbnails: string[];
  volume: number;
  muted: boolean;
}

export interface AudioState {
  playing: boolean;
  currentTime: number;
  readableCurrentTime: string;
  readableDuration: string;
  duration: number;
  active: boolean;
}
