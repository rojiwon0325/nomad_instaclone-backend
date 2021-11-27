import { ifPermitted } from "Post/post.utils";
import client from "prismaClient";
import { Resolver, Resolvers, ResultToken } from "types";
import { User } from "User/interface";
import { ifLogin, mapUser } from "User/user.utils";

const clickLike = async (id: number, account: string, like: boolean): Promise<ResultToken & { postId?: number }> => {
    const likePost = like ? { connect: { id } } : { disconnect: { id } };
    try {
        await client.user.update({ where: { account }, data: { likePost } });
        return { ok: true, postId: id };
    } catch { }
    return { ok: false, error: "좋아요 정보를 업데이트하지 못했습니다." };
};

const doLike: Resolver = async (_, { id }: { id: number }, { loggedInUser: account }) =>
    clickLike(id, account, true);

const doUnLike: Resolver = async (_, { id }: { id: number }, { loggedInUser: account }) =>
    clickLike(id, account, false);

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
        doLike: ifLogin(doLike),
        doUnLike: ifLogin(doUnLike),
    }
};

export default resolvers;
