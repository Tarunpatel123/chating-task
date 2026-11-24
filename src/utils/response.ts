import { Response } from "express";

export const ok = (res: Response, message: string, data: object = {}, status = 200) =>
  res.status(status).json({ success: true, message, data });

export const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

export const validationFail = (res: Response, message: string) => fail(res, message, 422);

export const notFound = (res: Response, message: string) => fail(res, message, 404);

export const serverError = (res: Response) => fail(res, "Something went wrong", 500);
