import { CommentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createComment = async (payload: {
  content: string;
  authorId: string;
  postId: string;
  parentId?: string;
}) => {
  const result = await prisma.comment.create({
    data: payload,
  });

  return result;
};

// GET comment by id
const getCommentById = async (commentId: string) => {
  return await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
        },
      },
      replies: {
        include: {
          replies: true,
        },
      },
    },
  });
};

// GET comment for author
const getCommentByAuthor = async (authorId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: authorId,
    },
  });

  if (!user) {
    throw new Error("No user Found on this id");
  }

  const comments = await prisma.comment.findMany({
    where: {
      authorId: authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return {
    user,
    comments,
  };
};

// DELETE Comment by id
const deleteComment = async (commentId: string, authorId: string) => {
  const commentData = await prisma.comment.findFirst({
    where: {
      id: commentId,
      authorId,
    },
    select: {
      id: true,
    },
  });

  if (!commentData) {
    throw new Error("Your comment is no longer available");
  }

  return await prisma.comment.delete({
    where: {
      id: commentData.id,
    },
  });
};

// UPDATE comment by id
const updateComment = async (
  commentId: string,
  data: { content?: string; status?: CommentStatus },
  authorId: string,
) => {
  const commentData = await prisma.comment.findFirst({
    where: {
      id: commentId,
      authorId,
    },
    select: {
      id: true,
    },
  });

  if (!commentData) {
    throw new Error("Your This comment is no longer availbale");
  }

  const updateComment = await prisma.comment.update({
    where: {
      id: commentData.id,
      authorId,
    },
    data,
  });

  return updateComment;
};

// update comment by admin
const moderateComment = async (
  commentId: string,
  data: { status: CommentStatus },
) => {
  const commentData = await prisma.comment.findUniqueOrThrow({
    where: {
      id: commentId,
    },
  });

  if (commentData.status === data.status) {
    throw new Error(
      `Your Provided status (${data.status}) is already up to date`,
    );
  }

  const moderatedData = await prisma.comment.update({
    where: {
      id: commentData.id,
    },

    data,
  });

  return moderatedData;
};

export const commentService = {
  createComment,
  getCommentById,
  getCommentByAuthor,
  deleteComment,
  updateComment,
  moderateComment,
};
