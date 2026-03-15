import express, { Application } from "express";
import { postRouter } from "./modules/post/post.router";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import { commentRouter } from "./modules/comment/comment.router";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app: Application = express();
app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

app.all("/api/auth/*splat", toNodeHandler(auth));

// Posts
app.use("/posts", postRouter);

// Comments
app.use("/comments", commentRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(globalErrorHandler);

export default app;
