import { Hashtag } from "Post/interface";
import client from "prismaClient";
import { Resolvers } from "types";

const resolvers: Resolvers = {
    Query: {
        searchTag: async (_, { tag, offset: skip = 0 }: { tag: string, offset: number }): Promise<Hashtag[]> => {
            try {
                const tags = await client.hashtag.findMany({
                    take: 15, skip,
                    where: { name: { contains: tag } },
                    select: {
                        name: true,
                        _count: {
                            select: {
                                post: true,
                            }
                        }
                    },
                });
                return tags;
            } catch { }
            return [];
        }
    }
};

export default resolvers;