import { Resolver, Resolvers, ResultToken } from "types";
import { User } from "User/interface";
import { ifLogin, mapUser } from "User/user.utils";

const requestFollow: Resolver = async (_, { account }: { account: string }, { client, loggedInUser }): Promise<ResultToken> => {
    try {
        if (loggedInUser === account) {
            return { ok: false, error: "Can't follow myself" };
        }
        const where = { account: loggedInUser };
        const { follower, followReqToOther } = await client.user.findUnique({
            where, select: {
                follower: { where: { account } },
                followReqToOther: { where: { account } }
            }
        }) ?? { follower: [], followReqToOther: [] };
        if (follower.length > 0 || followReqToOther.length > 0) {
            return { ok: false, error: "Fail to send request" };
        }
        await client.user.update({
            where, data: {
                followReqToOther: { connect: { account } }
            }
        });
        return { ok: true };
    } catch {
        return { ok: false, error: "Fail to follow" };
    }
};
const responseFollow: Resolver = async (_, { account, accept }: { account: string, accept: boolean }, { client, loggedInUser }): Promise<ResultToken> => {
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
const deleteFollower: Resolver = async (_, { account }: { account: string }, { client, loggedInUser }): Promise<ResultToken> => {
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
const deleteFollowing: Resolver = async (_, { account }: { account: string }, { client, loggedInUser }): Promise<ResultToken> => {
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
        seeFollower: async (_, { account, offset = 0 }: { account: string, offset: number }, { client, loggedInUser }): Promise<User[]> => {
            try {
                const select = { username: true, account: true, avatarUrl: true, follower: { where: { account: loggedInUser }, select: { account: true } } };
                const { follower } = await client.user.findFirst({
                    where: {
                        account,
                        OR: [{ isPublic: true }, { follower: { some: { account: loggedInUser } } }],
                    },
                    select: {
                        follower: {
                            take: 25,
                            skip: offset,
                            select,
                        },
                    },
                }) ?? { follower: [] };
                return mapUser(follower, loggedInUser);
            } catch { }
            return [];
        },
        seeFollowing: async (_, { account, offset = 0 }: { account: string, offset: number }, { client, loggedInUser }): Promise<User[]> => {
            try {
                const select = { username: true, account: true, avatarUrl: true, follower: { where: { account: loggedInUser }, select: { account: true } } };
                const { following } = await client.user.findFirst({
                    where: {
                        account,
                        OR: [{ isPublic: true }, { follower: { some: { account: loggedInUser } } }],
                    },
                    select: {
                        following: {
                            take: 25,
                            skip: offset,
                            select,
                        },
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