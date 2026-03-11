import express from 'express';
import { authenticate } from '../middleware/authMiddleWare.js';
import * as postController from '../controller/post.controller.js';

import { validate } from '../middleware/validate.js';
import { createPostSchema, updatePostSchema } from '../validations/post.schema.js';

const router = express.Router();

router.post('/create', authenticate, validate(createPostSchema), postController.createPost);
router.get('/', authenticate, postController.getAllPosts);
router.put('/:postId', authenticate, validate(updatePostSchema), postController.updatePost);
router.delete('/:postId', authenticate, postController.deletePost);

export default router;
