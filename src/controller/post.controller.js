import * as postService from '../services/post.services.js';

export async function createPost(req, res) {
    try {
        const userId = req.user.id; // From authenticate middleware
        const postData = req.body;

        const newPost = await postService.createPost(userId, postData);

        res.status(201).json({
            message: "Post created successfully",
            post: newPost
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to create post", error: error.message });
    }
}

export async function getAllPosts(req, res) {
    try {
        const posts = await postService.getAllPosts();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch posts", error: error.message });
    }
}

export async function updatePost(req, res) {
    try {
        const userId = req.user.id;
        const postId = parseInt(req.params.postId, 10);
        const postData = req.body;

        const updatedPost = await postService.updatePost(postId, userId, postData);
        res.json({ message: "Post updated successfully", post: updatedPost });
    } catch (err) {
        const status = err.message.includes("only edit") ? 403 : 500;
        res.status(status).json({ message: err.message });
    }
}

export async function deletePost(req, res) {
    try {
        const userId = req.user.id;
        const postId = parseInt(req.params.postId, 10);

        await postService.deletePost(postId, userId);
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        const status = err.message.includes("only delete") ? 403 : 500;
        res.status(status).json({ message: err.message });
    }
}
