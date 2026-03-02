import { Request, Response } from "express";
import { postService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { UserRole } from "../../middleware/authMiddleware";

// Create Posts
const createPost = async (req: Request, res: Response) => {
  try {
    // user
    const user = req.user;
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized!",
      });
    }

    const result = await postService.createPost(req.body, user?.id);
    res.status(201).json(result);
  } catch (e) {
    console.log(e);
  }
};

// GET all Posts
const getAllPost = async (req: Request, res: Response) => {
  try {
    // Search implement
    const search = req.query.search;
    const searchString = typeof search === "string" ? search : undefined;

    // filter by tags
    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];

    // filter by isFeatured Boolean value
    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === "true"
        ? true
        : req.query.isFeatured === "false"
          ? false
          : undefined
      : undefined;

    // filter by status
    const status = req.query.status as PostStatus | undefined;

    // filter by authorId
    const authorId = req.query.authorId as string | undefined;

    // Pagination and sorting Helper
    const options = paginationSortingHelper(req.query);

    const { page, limit, skip, sortBy, sortOrder } = options;
    const result = await postService.getAllPost({
      search: searchString,
      tags,
      isFeatured,
      status,
      authorId,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });

    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({
      details: "getPost Failed",
      error: e,
    });
  }
};

// GET post by id
const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      throw new Error("PostId Required");
    }
    const result = await postService.getPostById(postId as string);

    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({
      details: "getPost by id Failed",
      error: e,
    });
  }
};

// GET My Posts
const getMyPosts = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    console.log(user);
    if (!user) {
      throw new Error("Your are Unauthorized!");
    }

    const result = await postService.getMyPosts(user.id);
    res.status(200).json(result);
  } catch (e: any) {
    console.log(e);
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

// Update my post
const updateMyPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      throw new Error("You are unauthorized!");
    }

    const { postId } = req.params;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!user) {
      throw new Error("You are unauthorized!");
    }

    const result = await postService.updateMyPost(
      postId as string,
      user.id,
      req.body,
      isAdmin,
    );
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

// delete post by user and admin
const deletePost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("You are unauthorized!");
    }

    const { postId } = req.params;
    const isAdmin = user.role === UserRole.ADMIN;

    const result = await postService.deletePost(
      user?.id as string,
      postId as string,
      isAdmin as boolean,
    );
    res.status(200).json(result);
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

// GEt all States
const getStates = async (req: Request, res: Response) => {
  try {
    const result = await postService.getStates();
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({
      success: false,
      message: "States Fetched Failed",
    });
  }
};

export const postController = {
  createPost,
  getAllPost,
  getPostById,
  getMyPosts,
  updateMyPost,
  deletePost,
  getStates,
};
