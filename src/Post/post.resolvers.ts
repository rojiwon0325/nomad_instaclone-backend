import { Resolver, Resolvers, ResultToken } from "types";
import { ifLogin } from "User/user.utils";
import { FileUpload } from "graphql-upload";
import { deleteToS3, uploadToS3 } from "Shared/shared.utils";
import { extractTags } from "Post/post.utils";
import { Post } from "Post/interface";
import client from "prismaClient";

const newPost: Resolver = async (_, { photo, caption }: { photo: [FileUpload], caption: string }, { loggedInUser: account }): Promise<ResultToken> => {
    try {
        const photos = await Promise.all(photo.map(elem => uploadToS3(elem, account, `post/${account}`)));
        const hashtags = extractTags(caption);
        await client.post.create({
            data: {
                user: { connect: { account } },
                photo: photos,
                caption,
                hashtag: {
                    connectOrCreate: hashtags
                }
            }
        });
        return { ok: true };
    } catch { }
    return { ok: false, error: "Fail to new post" };
};
const editPost: Resolver = async (_, { id, caption }: { id: number, caption: string }, { loggedInUser: account }): Promise<ResultToken> => {
    try {
        const post = await client.post.findFirst({
            where: { id, account },
            select: {
                hashtag: true
            }
        });
        if (post === null) {
            return { ok: false, error: "Post not Found" };
        }
        await client.post.update({
            where: { id },
            data: {
                caption,
                hashtag: {
                    disconnect: post.hashtag,
                    connectOrCreate: extractTags(caption)
                }
            }
        });
        return { ok: true };
    } catch { }
    return { ok: false, error: "Fail to edit post" };
};
const deletePost: Resolver = async (_, { id }: { id: number }, { loggedInUser: account }): Promise<ResultToken> => {
    try {
        const post = await client.post.findFirst({ where: { id, account }, select: { photo: true } });
        if (post === null) return { ok: false, error: "Post not Found" };
        post.photo.forEach(url => deleteToS3(url));
        await client.reComment.deleteMany({ where: { postId: id } });
        await client.comment.deleteMany({ where: { postId: id } });
        await client.post.delete({ where: { id } });
        return { ok: true };
    } catch { }
    return { ok: false, error: "Fail to delete post" };
};

const resolvers: Resolvers = {
    Query: {
        seePost: async (_, { id, offset: skip = 0 }: { id: number | undefined, offset: number }, { loggedInUser }): Promise<Post[] | null> => {
            try {
                if (id) {
                    const post = await client.post.findFirst({
                        where: {
                            id,
                            OR: [{
                                account: loggedInUser
                            },
                            {
                                user: {
                                    follower: {
                                        some: { account: loggedInUser }
                                    }
                                }
                            },
                            { public: true }]
                        },
                        select: {
                            id: true,
                            photo: true,
                            account: true,
                            caption: true,
                            createdAt: true,
                            _count: { select: { like: true, comment: true, reComment: true } },
                            like: { where: { account: loggedInUser } }
                        },
                    });

                    if (post === null) { return null; }
                    else {
                        const { id: ID, photo, account, caption, createdAt, _count, like } = post;
                        return [{ id: ID, photo, _count, detail: { account, caption, createdAt, isMine: account === loggedInUser, isLiked: like.length > 0 } }];
                    }
                } else {
                    const post = await client.post.findMany({
                        take: 10,
                        skip,
                        where: {
                            OR: [{
                                account: loggedInUser
                            }, {
                                user: {
                                    follower: {
                                        some: { account: loggedInUser }
                                    }
                                }
                            },
                            { public: true }]
                        },
                        orderBy: {
                            createdAt: "desc"
                        },
                        select: {
                            id: true,
                            photo: true,
                            account: true,
                            caption: true,
                            createdAt: true,
                            _count: { select: { like: true, comment: true, reComment: true } },
                            like: { where: { account: loggedInUser } }
                        },
                    });
                    return post.map(({ id: ID, photo, account, caption, createdAt, _count, like }) => {
                        return { id: ID, photo, _count, detail: { account, caption, createdAt, isMine: account === loggedInUser, isLiked: like.length > 0 } };
                    });
                }
            } catch (e) { console.log(e) }
            return null
        },
    },
    Mutation: {
        newPost: ifLogin(newPost),
        editPost: ifLogin(editPost),
        deletePost: ifLogin(deletePost)
    }
};

export default resolvers;