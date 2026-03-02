import {
  CommentStatus,
  Post,
  PostStatus,
} from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middleware/authMiddleware";

// Create a Post
const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "UpdatedAt" | "authorId">,
  userId: string,
) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });

  return result;
};

// GET a post with filtering and sericing and sorting
const getAllPost = async ({
  search,
  tags,
  isFeatured,
  status,
  authorId,
  page,
  limit,
  skip,
  sortBy,
  sortOrder,
}: {
  search: string | undefined;
  tags: string[] | [];
  isFeatured: boolean | undefined;
  status: PostStatus | undefined;
  authorId: string | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const addConditions: PostWhereInput[] = [];

  // serach
  if (search) {
    addConditions.push({
      OR: [
        {
          title: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: search as string,
          },
        },
      ],
    });
  }

  // filter by tags
  if (tags.length > 0) {
    addConditions.push({
      tags: {
        hasEvery: tags,
      },
    });
  }

  // filter by isFeatured
  if (typeof isFeatured === "boolean") {
    addConditions.push({
      isFeatured: isFeatured,
    });
  }

  // filter by status
  if (status) {
    addConditions.push({
      status: status,
    });
  }

  // filter by authorId
  if (authorId) {
    addConditions.push({
      authorId: authorId,
    });
  }

  const allPost = await prisma.post.findMany({
    take: limit,
    skip: skip,
    where: {
      AND: addConditions,
    },
    orderBy: { [sortBy]: sortOrder },
    include: {
      _count: {
        select: { comments: true },
      },
    },
  });

  const totalData = await prisma.post.count({
    where: {
      AND: addConditions,
    },
  });

  return {
    data: allPost,
    pagination: {
      totalData,
      page,
      limit,
      totalPages: Math.ceil(totalData / limit),
    },
  };
};

// get Post by id
const getPostById = async (postId: string) => {
  const result = await prisma.$transaction(async (tx) => {
    await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const postData = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        comments: {
          where: {
            parentId: null,
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            replies: {
              where: {
                status: CommentStatus.APPROVED,
              },
              orderBy: {
                createdAt: "asc",
              },
              include: {
                replies: {
                  where: {
                    status: CommentStatus.APPROVED,
                  },
                  orderBy: {
                    createdAt: "asc",
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    return postData;
  });

  return result;
};

// GET all posts for 1 User
const getMyPosts = async (authorId: string) => {
  // Checking User is ACTIVE or not
  await prisma.user.findUniqueOrThrow({
    where: {
      id: authorId,
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });

  const result = await prisma.post.findMany({
    where: {
      authorId: authorId,
    },

    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  const totalPost = await prisma.post.count({
    where: {
      authorId: authorId,
    },
  });

  return {
    totalPost,
    data: result,
  };
};

// update my post
const updateMyPost = async (
  postId: string,
  authorId: string,
  data: Partial<Post>,
  isAdmin: Boolean,
) => {
  const psotData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!isAdmin && psotData.authorId !== authorId) {
    throw new Error("Your are not owner or creator of this post");
  }

  if (!isAdmin) {
    delete data.isFeatured;
  }

  const result = await prisma.post.update({
    where: {
      id: psotData.id,
    },
    data,
  });

  return result;
};

// delete post by own author and admin
const deletePost = async (
  authorId: string,
  postId: string,
  isAdmin: boolean,
) => {
  const postData = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!postData) {
    throw new Error("Thispost is no longer available");
  }

  if (!isAdmin && postData.authorId !== authorId) {
    throw new Error(
      "This post is not created by you, and your are not a admin ",
    );
  }

  const result = await prisma.post.delete({
    where: {
      id: postId,
    },
  });

  return result;
};

// get states
const getStates = async () => {
  // postCount, publisedPosts, draftPosts, totlacomments, totalviews
  return await prisma.$transaction(async (tx) => {
    const [
      totalUser,
      adminCount,
      userCount,
      totalPosts,
      publisedPosts,
      draftPosts,
      archivedPosts,
      totlacomments,
      approvedComments,
      rejectComments,
      totalviews,
    ] = await Promise.all([
      await tx.user.count(),
      await tx.user.count({ where: { role: UserRole.ADMIN } }),
      await tx.user.count({ where: { role: UserRole.USER } }),
      await tx.post.count(),
      await tx.post.count({ where: { status: PostStatus.PUBLISHED } }),
      await tx.post.count({ where: { status: PostStatus.DRAFT } }),
      await tx.post.count({ where: { status: PostStatus.ARCHIVED } }),
      await tx.comment.count(),
      await tx.comment.count({ where: { status: CommentStatus.APPROVED } }),
      await tx.comment.count({ where: { status: CommentStatus.REJECT } }),
      await tx.post.aggregate({ _sum: { views: true } }),
    ]);

    return {
      totalUser,
      adminCount,
      userCount,
      totalPosts,
      publisedPosts,
      draftPosts,
      archivedPosts,
      totlacomments,
      approvedComments,
      rejectComments,
      totalviews: totalviews._sum.views,
    };
  });
};

export const postService = {
  createPost,
  getAllPost,
  getPostById,
  getMyPosts,
  updateMyPost,
  deletePost,
  getStates,
};
