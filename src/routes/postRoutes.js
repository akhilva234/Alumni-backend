import express from 'express';
import { authenticate } from '../middleware/authMiddleWare.js';
import * as postController from '../controller/post.controller.js';

const router = express.Router();

router.post('/create', authenticate, postController.createPost);
router.get('/', authenticate, postController.getAllPosts);
router.put('/:postId', authenticate, postController.updatePost);
router.delete('/:postId', authenticate, postController.deletePost);

export default router;
