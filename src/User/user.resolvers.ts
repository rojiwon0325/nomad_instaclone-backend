import { Resolvers } from "types";
import { User } from "User/interface";

const resolvers: Resolvers = {
    Query: {
        searchUsers: async (_, { key }: { key: string }, { client }): Promise<User[]> => {
            try {
                return client.user.findMany({
                    where: { OR: [{ username: { contains: key } }, { account: { contains: key } }] },
                    take: 50,
                    select: { username: true, account: true, avatarUrl: true }
                });
            } catch { }
            return [];

        },
    }
};

export default resolvers;