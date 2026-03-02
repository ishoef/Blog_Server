import { Request, Response } from "express";
import { commentService } from "./comment.service";

const createComment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    req.body.authorId = user?.id;
    const result = await commentService.createComment(req.body);
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({
      success: false,
      message: "Comment Creation Failed",
    });
  }
};

// Get comment by id
const getCommentById = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const result = await commentService.getCommentById(commentId as string);
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({
      success: false,
      message: "Get Comment by id Failed",
    });
  }
};

// get comment by author
const getCommentByAuthor = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.params;
    console.log(authorId);
    const result = await commentService.getCommentByAuthor(authorId as string);
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({
      success: false,
      message: "Get comments by author Failed",
    });
  }
};

// Deleteing comment by id
const deleteComment = async (req: Request, res: Response) => {
  try {
    console.log();
    const { commentId } = req.params;
    const user = req.user;
    const result = await commentService.deleteComment(
      commentId as string,
      user?.id as string,
    );
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: "Delete comment is failed",
      error: e.message,
    });
  }
};

// updating comment by id
const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const user = req.user;
    const result = await commentService.updateComment(
      commentId as string,
      req.body,
      user?.id as string,
    );
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: "Delete comment is failed",
      error: e.message,
    });
  }
};

// updating comment by admin
const moderateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const result = await commentService.moderateComment(
      commentId as string,
      req.body,
    );
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

export const commentController = {
  createComment,
  getCommentById,
  getCommentByAuthor,
  deleteComment,
  updateComment,
  moderateComment,
};
