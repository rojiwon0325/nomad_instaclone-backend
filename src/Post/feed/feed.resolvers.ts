import { Resolvers } from "types";

const resolvers: Resolvers = {
    Query: {
        seeFeed: async (_, { account, offset = 0 }: { account: string, offset: number }, { client, loggedInUser }) => {
            try {
                const user = await client.user.findUnique({ where: { account } });
                if (user === null) return { ok: false, error: "User not Found" };
                const access = account === loggedInUser || user.select.find(elem => elem === "post");
                if (access === undefined) return { ok: false, error: "This feed is private" };
                const feed = await client.post.findMany({
                    take: 25,
                    skip: offset > 0 ? offset * 25 : 0,
                    where: { account },
                    orderBy: { createdAt: "asc" }
                });
                return { ok: true, feed };
            } catch { }
            return { ok: false, error: "Fail to load feed" };
        }
    }
};

export default resolvers;