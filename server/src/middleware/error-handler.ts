import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "express-oauth2-jwt-bearer";

export default function errorHandler(
	error: any,
	req: Request,
	res: Response,
	next: NextFunction
) {
	if (error instanceof UnauthorizedError) {
		res.status(error.statusCode).json({
			error: {
				sucesss: false,
				message: error.message,
				code: "code" in error ? error.code : "ERR_AUTH",
			},
		});
	} else {
		const errStatus = error.statusCode || 500;
		const errMsg = error.message || "Something went wrong";
		res.status(errStatus).json({
			success: false,
			status: errStatus,
			message: errMsg,
			stack: process.env.NODE_ENV === "development" ? error.stack : {},
		});
	}
}
