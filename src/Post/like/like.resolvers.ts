import { Prisma } from ".prisma/client";
import { ifPermitted } from "Post/post.utils";
import client from "prismaClient";
import { Resolver, Resolvers, ResultToken } from "types";
import { User } from "User/interface";
import { ifLogin, mapUser } from "User/user.utils";

const clickLike = async (postId: number, account: string, type: boolean): Promise<ResultToken & { type?: boolean }> => {
    try {
        if (type) {
            await client.like.create({ data: { account, postId } });
        } else {
            await client.like.delete({ where: { account_postId: { account, postId } } });
        }
        return { ok: true, type };
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if ((e.code === "P2002" && type) || (e.code === "P2025" && !type)) {
                return { ok: false, error: e.code, type };
            }
        }
        console.log(e);
    }
    return { ok: false, error: "좋아요 정보를 업데이트하지 못했습니다." };
};

const doLike: Resolver = async (_, { id }: { id: number }, { loggedInUser: account }) =>
    clickLike(id, account, true);

const doUnLike: Resolver = async (_, { id }: { id: number }, { loggedInUser: account }) =>
    clickLike(id, account, false);

const seeLike: Resolver = async (_, { id, offset: skip = 0 }: { id: number, offset: number }, { loggedInUser: account }): Promise<User[]> => {
    try {
        const like = await client.like.findMany({
            where: { postId: id },
            take: 15,
            skip,
            select: {
                user: {
                    select: {
                        account: true,
                        username: true,
                        avatarUrl: true,
                        follower: { where: { account }, select: { account: true } },
                        followReqToMe: { where: { account }, select: { account: true } },
                    }
                }
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
