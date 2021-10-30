import { Hashtag } from "Post/interface";
import { Resolvers } from "types";

const resolvers: Resolvers = {
    Query: {
        searchTag: async (_, { tag, offset = 0 }: { tag: string, offset: number }, { client }): Promise<Hashtag[]> => {
            try {
                const tags = await client.hashtag.findMany({
                    take: 15,
                    skip: offset,
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