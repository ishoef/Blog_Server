import { Router } from "express";
import { commentController } from "./comment.controller";
import authMiddleware, { UserRole } from "../../middleware/authMiddleware";
const router = Router();

router.get("/:commentId", commentController.getCommentById);
router.get("/author/:authorId", commentController.getCommentByAuthor);
router.delete(
  "/:commentId",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  commentController.deleteComment,
);
router.patch(
  "/:commentId",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  commentController.updateComment,
);

router.patch(
  "/:commentId/moderate",
  authMiddleware(UserRole.ADMIN),
  commentController.moderateComment,
);

// create a comment
router.post(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  commentController.createComment,
);

export const commentRouter: Router = router;
