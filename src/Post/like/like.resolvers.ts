import { ifPermitted } from "Post/post.utils";
import client from "prismaClient";
import { Resolver, Resolvers, ResultToken } from "types";
import { User } from "User/interface";
import { ifLogin, mapUser } from "User/user.utils";

const clickLike: Resolver = async (_, { id }: { id: number }, { loggedInUser: account }): Promise<ResultToken & { type?: string, postId?: number }> => {
    try {
        const post = await client.post.findFirst({ where: { id, like: { some: { account } } } });
        const [type, likePost] = post ? ["unlike", { disconnect: { id } }] : ["like", { connect: { id } }];
        await client.user.update({
            where: { account },
            data: {
                likePost,
            }
        });
        return { ok: true, type, postId: id };
    } catch { }
    return { ok: false, error: "Fail to like or unlike" };
};

const seeLike: Resolver = async (_, { id, offset: skip }: { id: number, offset: number }, { loggedInUser: account }): Promise<User[]> => {
    try {
        const like = await client.post.findUnique({ where: { id } }).like({
            take: 15, skip, select: {
                account: true,
                username: true,
                avatarUrl: true,
                follower: { where: { account } }
            }
        });
        return mapUser(like, account);
    } catch { }
    return [];
};

const resolvers: Resolvers = {
    Query: {
        seeLike: ifPermitted(seeLike),
    },
    Mutation: {
        clickLike: ifLogin(clickLike),
    }
};

export default resolvers;
