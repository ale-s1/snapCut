export function toTimeString(sec: number, showMilliSeconds = true) {
	sec = Number(sec);
	var h = Math.floor(sec / 3600);
	var m = Math.floor((sec % 3600) / 60);
	var s = Math.floor((sec % 3600) % 60);

	var hDisplay = h < 10 ? "0" + h : h;
	var mDisplay = m < 10 ? "0" + m : m;
	var sDisplay = s < 10 ? "0" + s : s;

	return hDisplay + ":" + mDisplay + ":" + sDisplay;
}
