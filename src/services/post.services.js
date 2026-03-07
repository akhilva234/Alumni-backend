import prisma from '../../prismaClient.js';

export async function createPost(userId, postData) {
    const { content, image_url, post_type } = postData;

    if (!content) {
        throw new Error("Post content is required");
    }

    const newPost = await prisma.post.create({
        data: {
            user_id: userId,
            content,
            image_url: image_url || null,
            post_type: post_type || 'GENERAL',
        },
        include: {
            user: {
                select: {
                    first_name: true,
                    last_name: true,
                    user_photo: true,
                    role: true,
                }
            }
        }
    });

    return newPost;
}

export async function getAllPosts() {
    const posts = await prisma.post.findMany({
        orderBy: {
            created_at: 'desc'
        },
        include: {
            user: {
                select: {
                    first_name: true,
                    last_name: true,
                    user_photo: true,
                    role: true,
                }
            },
            // Optionally include comments and likes counts or data if needed later
            _count: {
                select: { likes: true, comments: true }
            }
        }
    });

    return posts;
}
