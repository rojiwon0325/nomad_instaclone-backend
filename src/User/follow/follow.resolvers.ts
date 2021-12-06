import client from "prismaClient";
import { Resolver, Resolvers, ResultToken } from "types";
import { User } from "User/interface";
import { ifLogin, mapUser } from "User/user.utils";

const requestFollow: Resolver = async (_, { account }: { account: string }, { loggedInUser }): Promise<ResultToken> => {
    try {
        if (loggedInUser === account) {
            return { ok: false, error: "Can't follow myself" };
        }
        const where = { account: loggedInUser };
        const { following, followReqToOther } = await client.user.findUnique({
            where, select: {
                following: { where: { account } },
                followReqToOther: { where: { account } }
            }
        }) ?? { following: [], followReqToOther: [] };
        if (following.length > 0 || followReqToOther.length > 0) {
            return { ok: true, error: "Fail to send request" };
        }
        await client.user.update({
            where, data: {
                followReqToOther: { connect: { account } }
            }
        });
        return { ok: true };
    } catch (e) {
        console.log(e);
        return { ok: false, error: "Fail to follow" };
    }
};
const responseFollow: Resolver = async (_, { account, accept }: { account: string, accept: boolean }, { loggedInUser }): Promise<ResultToken> => {
    try {
        await client.user.update({
            where: { account: loggedInUser },
            data: {
                followReqToMe: { disconnect: { account } },
                ...(accept && { follower: { connect: { account } } }),
            }
        });
        return { ok: true };
    } catch {
        return { ok: false, error: "Fail to response follow" }
    }
};
const deleteFollower: Resolver = async (_, { account }: { account: string }, { loggedInUser }): Promise<ResultToken> => {
    try {
        await client.user.update({
            where: { account: loggedInUser },
            data: {
                follower: { disconnect: { account } }
            }
        })
        return { ok: true };
    } catch {
        return { ok: false, error: "Fail to delete follower" }
    }
};
const deleteFollowing: Resolver = async (_, { account }: { account: string }, { loggedInUser }): Promise<ResultToken> => {
    try {
        await client.user.update({
            where: { account: loggedInUser },
            data: {
                following: { disconnect: { account } }
            }
        })
        return { ok: true };
    } catch {
        return { ok: false, error: "Fail to delete follow" }
    }
};

const resolvers: Resolvers = {
    Query: {
        seeFollower: async (_, { account, offset: skip = 0 }: { account: string, offset: number }, { loggedInUser }): Promise<User[]> => {
            try {
                const select = { username: true, account: true, avatarUrl: true, follower: { where: { account: loggedInUser }, select: { account: true } }, followReqToMe: { where: { account: loggedInUser }, select: { account: true } } };
                const { follower } = await client.user.findFirst({
                    where: {
                        account,
                        OR: [{ isPublic: true }, { follower: { some: { account: loggedInUser } } }],
                    },
                    select: {
                        follower: {
                            take: 25, skip, select
                        },
                    },
                }) ?? { follower: [] };
                return mapUser(follower, loggedInUser);
            } catch { }
            return [];
        },
        seeFollowing: async (_, { account, offset: skip = 0 }: { account: string, offset: number }, { loggedInUser }): Promise<User[]> => {
            try {
                const select = { username: true, account: true, avatarUrl: true, follower: { where: { account: loggedInUser }, select: { account: true } }, followReqToMe: { where: { account: loggedInUser }, select: { account: true } } };
                const { following } = await client.user.findFirst({
                    where: {
                        account,
                        OR: [{ isPublic: true }, { follower: { some: { account: loggedInUser } } }],
                    },
                    select: {
                        following: { take: 25, skip, select, },
                    },
                }) ?? { following: [] };
                return mapUser(following, loggedInUser);
            } catch { }
            return [];
        },
    },
    Mutation: {
        requestFollow: ifLogin(requestFollow),
        responseFollow: ifLogin(responseFollow),
        deleteFollower: ifLogin(deleteFollower),
        deleteFollowing: ifLogin(deleteFollowing),
    }
};

export default resolvers;