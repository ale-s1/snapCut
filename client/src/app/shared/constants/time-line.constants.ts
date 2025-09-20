import { BtnAction, BtnControl } from '../models/time-line.model';

export const enum STATUS {
  off = 0,
  resize = 1,
}
export const DEFAULT_TIMELINE_BOX_HEIGHT = 341;

export const BTN_VIDEO_PLAYER: BtnControl[] = [
  {
    title: 'prev',
    url: 'img/player-control/skip-previous.svg',
    class: 'text-white',
    action: BtnAction.goBack,
  },
  {
    title: 'toggle play',
    url: 'img/player-control/play.svg',
    class: 'text-white',
    action: BtnAction.togglePlay,
  },
  {
    title: 'skip',
    url: 'img/player-control/skip.svg',
    class: 'text-white',
    action: BtnAction.skip,
  },
];
