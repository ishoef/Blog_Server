import { Router } from "express";
import { postController } from "./post.controller";
import authMiddleware, { UserRole } from "../../middleware/authMiddleware";

const router = Router();

router.post(
  "/",
  authMiddleware(UserRole.USER, UserRole.ADMIN),
  postController.createPost,
);
router.get("/", postController.getAllPost);
router.get(
  "/my-posts",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  postController.getMyPosts,
);

router.get("/states", authMiddleware(UserRole.ADMIN), postController.getStates);

router.get("/:postId", postController.getPostById);
router.patch(
  "/:postId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  postController.updateMyPost,
);
router.delete(
  "/:postId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  postController.deletePost,
);
export const postRouter: Router = router;
