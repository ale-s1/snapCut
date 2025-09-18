import Ffmpeg from "fluent-ffmpeg";
import { CropOptions } from "../../types/types";
import { toTimeString } from "../../utils/utils";
import { VideoMetadata } from "./video.types";

export function getVideoMetadata(filePath: string): Promise<VideoMetadata> {
	return new Promise((resolve, reject) => {
		Ffmpeg(filePath).ffprobe(0, (err, metadata) => {
			if (err) {
				reject(err);
			}
			const { width, height } = metadata.streams[0];
			const meta: VideoMetadata = {
				duration: metadata.format.duration || 0,
				format: metadata.format.format_name,
				width: width,
				height: height,
			};
			resolve(meta);
		});
	});
}

export async function generateThumbnails(filePath: string, duration: number) {
	const maxNumberImages = 15;
	const numberOfFrames = Math.min(duration, maxNumberImages);
	const offset = duration === maxNumberImages ? 1 : duration / numberOfFrames;
	const thumbnails: string[] = [];

	for (let i = 0; i < numberOfFrames; i++) {
		const startTimeInSecs = toTimeString(Math.round(i * offset));
		const base64Image = await getThumbnailInMemory(filePath, startTimeInSecs);
		thumbnails.push(base64Image);
	}
	return thumbnails;
}

export async function getThumbnailInMemory(
	filePath: string,
	startTimeInSecs: string
): Promise<string> {
	return new Promise((resolve, reject) => {
		const buffers: Buffer[] = [];

		const command = Ffmpeg(filePath)
			.seekInput(startTimeInSecs)
			.frames(1)
			.outputFormat("image2pipe")
			.videoCodec("mjpeg")
			.on("progress", (progress) => {
				if (progress.percent) {
					console.log(`Processing: ${Math.floor(progress.percent)}% done`);
				}
			})
			.on("error", reject)
			.on("end", () => {
				const imageBuffer = Buffer.concat(buffers);
				const base64Image = imageBuffer.toString("base64");
				resolve(`data:image/jpeg;base64,${base64Image}`);
			});
		const stream = command.pipe();
		stream.on("data", (chunk: Buffer) => buffers.push(chunk));
	});
}

export async function getExtractedAudio(
	filePath: string
): Promise<ArrayBuffer> {
	return new Promise((resolve, reject) => {
		const buffers: Buffer[] = [];
		const command = Ffmpeg(filePath)
			.noVideo()
			.format("mp3")
			.on("progress", (progress) => {
				if (progress.percent) {
					console.log(`Processing: ${Math.floor(progress.percent)}% done`);
				}
			})
			.on("error", reject)
			.on("end", () => {
				const audioBuffer = Buffer.concat(buffers);
				resolve(audioBuffer);
			});
		const stream = command.pipe();
		stream.on("data", (chunk: Buffer) => buffers.push(chunk));
	});
}

async function videoCropCenter(
	pathVideo: string,
	w: number,
	h: number,
	tempFile: string
): Promise<string> {
	return new Promise((resolve, reject) => {
		Ffmpeg()
			.input(pathVideo)
			.videoFilters([
				{
					filter: "crop",
					options: {
						w,
						h,
					},
				},
			])
			.output(tempFile)
			.on("start", function (commandLine) {
				console.log("FFmpeg with command: " + commandLine);
			})
			.on("progress", function (progress) {
				if (progress.percent) {
					console.log(`Processing: ${Math.floor(progress.percent)}% done`);
				}
			})
			.on("error", function (err) {
				console.log("Problem performing ffmpeg function");
				reject(err);
			})
			.on("end", function () {
				console.log("End videoCropCenterFFmpeg:", tempFile);
				resolve(tempFile);
			})
			.run();
	});
}

async function resizeVideo(
	filePath: string,
	w: number,
	h: number,
	tempFile: string,
	cropOptions: CropOptions
): Promise<ArrayBuffer> {
	return new Promise((resolve, reject) => {
		const buffers: Buffer[] = [];
		const command = Ffmpeg(filePath)
			.size(`${w}x${h}`)
			.autoPad(true, cropOptions.padColor ?? "black")
			.outputOptions("-movflags frag_keyframe+empty_moov")
			.format("mp4")
			.on("start", function (commandLine) {
				console.log("FFmpeg with command: " + commandLine);
			})
			.on("progress", function (progress) {
				console.log(progress);
			})
			.on("error", function (err) {
				console.log("Problem in resizeVideo");
				console.log(err);
				reject(err);
			})
			.on("end", function () {
				console.log("End resizingFFmpeg:", tempFile);
				const audioBuffer = Buffer.concat(buffers);
				resolve(audioBuffer);
			});
		const stream = command.pipe();
		stream.on("data", (chunk: Buffer) => buffers.push(chunk));
	});
}

export async function videoScale(
	filePath: string,
	originalWidth: number,
	originalHeight: number,
	newWidth: number,
	newHeight: number,
	cropOptions: CropOptions
): Promise<ArrayBuffer> {
	const output = "scaledOutput.mp4";
	let resized = await resizeVideo(
		filePath,
		newWidth,
		newHeight,
		output,
		cropOptions
	);
	return resized;
}

/* 
	if (cropOptions.cropPresents == Crop.Fit) {
	} else if (cropOptions.cropPresents == Crop.Fill) {
		const x = originalWidth - (newWidth / newHeight) * originalHeight;
		const cropping = "tempCropped" + new Date().getSeconds() + ".mp4";
		let cropped = await videoCropCenter(
			filePath,
			originalWidth - x,
			originalHeight,
			cropping
		);
		return cropped;
	} else {
		return await resizeVideo(
			filePath,
			newWidth,
			newHeight,
			output,
			cropOptions
		);
	}

*/
