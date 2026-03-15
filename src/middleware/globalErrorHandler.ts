import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";

function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let statusCode = 500;
  let errorMesseage = "Internal server error!";
  let errorDetails = err;

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMesseage = "You provide incorrect field type or missing fields!";
  }

  res.status(statusCode);
  res.json({
    success: false,
    message: errorMesseage,
    error: errorDetails,
  });
}

export default globalErrorHandler;
