export function timeToString(secs: number) {
  secs = Math.floor(secs);
  let hours = Math.floor(secs / 3600);
  let minutes = Math.floor((secs % 3600) / 60);
  let seconds = secs % 60;

  return [hours, minutes, seconds].map((v) => (v < 10 ? '0' + v : v)).join(':');
}
