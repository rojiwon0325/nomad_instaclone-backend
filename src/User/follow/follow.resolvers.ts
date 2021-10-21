import { Resolver, Resolvers, ResultToken } from "types";
import { User } from "User/interface";
import { ifLogin } from "User/user.utils";

interface FollowResult extends ResultToken {
    list?: User[]
}

const requestFollow: Resolver = async (_, { account }: { account: string }, { client, loggedInUser }): Promise<ResultToken> => {
    try {
        if (loggedInUser === account) {
            return { ok: false, error: "Can't follow myself" };
        }
        const where = { account: loggedInUser };
        const user = client.user.findUnique({ where });
        const res = await Promise.all([user.following({ where: { account } }), user.followReqToOther({ where: { account } })]);
        if (res[0].length > 0 || res[1].length > 0) {
            return { ok: false, error: "Fail to send request" };
        }
        await client.user.update({
            where, data: {
                followReqToOther: {
                    connect: { account }
                }
            }
        });
        return { ok: true };
    } catch {
        return { ok: false, error: "Fail to follow" };
    }
};
const responseFollow: Resolver = async (_, { account, accept }: { account: string, accept: boolean }, { client, loggedInUser }): Promise<ResultToken> => {
    try {
        const where = { account: loggedInUser };
        const user = client.user.findUnique({ where });
        const req = await user.followReqToMe({ where: { account } });
        if (req.length === 0) {
            return { ok: false, error: "You don't receive the request." };
        }
        if (accept) {
            await Promise.all([
                client.user.update({
                    where, data: {
                        followReqToMe: { disconnect: { account } },
                        follower: { connect: { account } },
                        numOfFollower: { increment: 1 }
                    }
                }),
                client.user.update({
                    where: { account }, data: {
                        numOfFollowing: { increment: 1 }
                    }
                })]);
        } else {
            await client.user.update({
                where, data: { followReqToMe: { disconnect: { account } } }
            });
        }
        return { ok: true };
    } catch {
        return { ok: false, error: "Fail to response follow" }
    }
};
const deleteFollow: Resolver = async (_, { account, type }: { account: string, type: "follower" | "following" }, { client, loggedInUser }): Promise<ResultToken> => {
    try {
        const where = { account: loggedInUser };
        const user = client.user.findUnique({ where });
        switch (type) {
            case "follower":
                const follower = await user.follower({ where: { account } });
                if (follower.length === 0) {
                    return { ok: false, error: "Already not follow" };
                }
                await client.user.update({
                    where, data: {
                        follower: { disconnect: { account } }, numOfFollower: { decrement: 1 }
                    }
                })
                break;
            case "following":
                const following = await user.following({ where: { account } });
                if (following.length === 0) {
                    return { ok: false, error: "Already not follow" };
                }
                await client.user.update({
                    where, data: {
                        following: { disconnect: { account } }, numOfFollowing: { decrement: 1 }
                    }
                })
                break;
            default:
                return { ok: false, error: "Type is not correct, Type is 'follower' or 'following'" };
        }
        return { ok: true };
    } catch {
        return { ok: false, error: "Fail to delete follow" }
    }
};

const resolvers: Resolvers = {
    Query: {
        seeFollow: async (_, { account, type, page = 1 }: { account: string, type: "follower" | "following", page: number }, { client }): Promise<FollowResult> => {
            try {
                const select = { username: true, account: true, avatarUrl: true };
                const prisma = client.user.findUnique({ where: { account } });
                const user = await prisma;
                if (user === null) {
                    return { ok: false, error: "User Not Found" };
                }
                if (user.select.find(elem => elem === "follow")) {
                    switch (type) {
                        case "follower":
                            return { ok: true, list: await prisma.follower({ take: 12, skip: (page - 1) * 12, select }) };
                        case "following":
                            return { ok: true, list: await prisma.following({ take: 12, skip: (page - 1) * 12, select }) };
                        default:
                            return { ok: false, error: "Type is not correct, Type is 'follower' or 'following'" };
                    }
                }
                return { ok: false, error: "It's private" }
            } catch {
                return { ok: false, error: "Fail to request" }
            }
        }
    },
    Mutation: {
        requestFollow: ifLogin(requestFollow), // follow 신청보내기
        responseFollow: ifLogin(responseFollow), // follow 요청 응답 
        deleteFollow: ifLogin(deleteFollow), // follow follower 취소하기
    }
};

export default resolvers;