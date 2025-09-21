// src/utils/response.ts
import { Response } from "express";

export const prettyJson = (res: Response, data: any, status = 200) => {
  res.status(status).send(JSON.stringify(data, null, 2));
};
