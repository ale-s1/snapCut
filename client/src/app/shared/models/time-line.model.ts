export const enum BtnAction {
  goBack = 'go-back',
  togglePlay = 'toggle-play',
  skip = 'skip',
}

export interface BtnControl {
  title: string;
  url: string;
  class: string;
  action: BtnAction;
}
