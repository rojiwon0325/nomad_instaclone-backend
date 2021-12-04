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
                caption: caption.split(/\n|\r/),
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
                caption: caption.split("\n"),
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
        seePost: async (_, { id, offset: skip = 0, account }: { id: number | undefined, offset: number, account?: string }, { loggedInUser }): Promise<Post[] | null> => {
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
                            user: {
                                select: {
                                    avatarUrl: true,
                                }
                            },
                            _count: { select: { like: true, comment: true, reComment: true } },
                            like: { where: { account: loggedInUser } }
                        },
                    });

                    if (post === null) { return null; }
                    else {
                        const { id: ID, photo, account, caption, createdAt, _count, like, user: { avatarUrl } } = post;
                        return [{ id: ID, photo, _count, detail: { avatarUrl, comments: [], account, caption, createdAt, isMine: account === loggedInUser, isLiked: like.length > 0 } }];
                    }
                } else {
                    const content = {
                        take: 10,
                        skip,
                        select: {
                            id: true,
                            photo: true,
                            account: true,
                            caption: true,
                            createdAt: true,
                            user: {
                                select: {
                                    avatarUrl: true,
                                }
                            },
                            _count: { select: { like: true, comment: true, reComment: true } },
                            like: { where: { account: loggedInUser } }
                        },
                    };
                    const post = account ?
                        await client.user.findFirst({ where: { account, OR: [{ isPublic: true }, { follower: { some: { account: loggedInUser } } }] } })
                            .post({ ...content, orderBy: { createdAt: "desc" }, })
                        : await client.post.findMany({
                            where: {
                                OR: [{ account: loggedInUser }, { user: { follower: { some: { account: loggedInUser } } } }]
                            },
                            ...content,
                            orderBy: { createdAt: "desc" },
                        });
                    return post.map(({ id: ID, photo, account, caption, createdAt, _count, like, user: { avatarUrl } }) => {
                        return { id: ID, photo, _count, detail: { avatarUrl, comments: [], account, caption, createdAt, isMine: account === loggedInUser, isLiked: like.length > 0 } };
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