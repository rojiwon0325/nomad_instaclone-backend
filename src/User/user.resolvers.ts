import client from "prismaClient";
import { Resolvers } from "types";
import { User } from "User/interface";
import { mapUser } from "./user.utils";

const resolvers: Resolvers = {
    Query: {
        searchUsers: async (_, { key }: { key: string }, { loggedInUser }): Promise<User[]> => {
            try {
                return mapUser(await client.user.findMany({
                    where: { NOT: { account: loggedInUser }, OR: [{ username: { contains: key } }, { account: { contains: key } }] },
                    take: 50,
                    select: {
                        username: true, account: true, avatarUrl: true,
                        follower: { where: { account: loggedInUser }, select: { account: true } },
                        followReqToMe: { where: { account: loggedInUser }, select: { account: true } },
                        followReqToOther: { where: { account: loggedInUser }, select: { account: true } },
                    }
                }), loggedInUser);

            } catch { }
            return [];

        },
    }
};

export default resolvers;