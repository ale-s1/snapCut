import { NextFunction, Request, Response } from "express";
import fs from "node:fs";
import {
	generateThumbnails,
	getExtractedAudio,
	getVideoMetadata,
	videoScale,
} from "../services/videoService/video-service";
import { CropOptions } from "../types/types";

export async function thumbnailsController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> {
	try {
		const file = req.file;
		if (!file) {
			return res.status(400).send("Please upload a video file");
		}
		const meta = await getVideoMetadata(file.path);
		const thumbnails = await generateThumbnails(file.path, meta.duration);
		fs.unlinkSync(file.path);
		res.json(thumbnails);
	} catch (error) {
		next(error);
	}
}

export async function extractAudioController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> {
	try {
		const file = req.file;
		if (!file) {
			return res.status(400).send("Please upload a video file");
		}
		const audio = await getExtractedAudio(file.path);
		fs.unlinkSync(file.path);
		res.send(audio);
	} catch (error) {
		next(error);
	}
}

export async function resizingVideoController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> {
	try {
		const file = req.file;
		if (!file) {
			return res.status(400).send("Please upload a video file");
		}
		const aspect = req.body.aspect.split(":");
		const cropOptions: CropOptions = req.body.cropOptions ?? [
			{
				cropPresents: "fit",
				padColor: "black",
			},
		];

		const { width, height } = await getVideoMetadata(file.path);
		const newWidth = (aspect[0] / aspect[1]) * (width ?? 1080);
		const newHeight = (aspect[1] / aspect[0]) * (height ?? 1920);
		const video = await videoScale(
			file.path,
			width ?? 1080,
			height ?? 1920,
			newWidth,
			newHeight,
			cropOptions
		);
		console.log(video);
		res.send(video);
	} catch (error) {
		next(error);
	}
}
