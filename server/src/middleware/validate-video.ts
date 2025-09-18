import { NextFunction, Request, Response } from "express";
import path from "path";

const allowerdFormats = ["mp4", "mov", "avi", "mkv"];

export async function validateVideo(
	req: Request,
	res: Response,
	next: NextFunction
) {
	if (!req.file) {
		return next(new Error("No file uploaded"));
	}
	const fileType = path
		.extname(req.file.originalname)
		.toLowerCase()
		.replace(".", "");

	if (!allowerdFormats.includes(fileType)) {
		return next(new Error("file is not allowed"));
	}

	next();
}
