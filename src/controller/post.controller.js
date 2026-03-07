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
