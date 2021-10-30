import { Post } from "Post/interface";
import { Resolvers, ResultToken } from "types";

const resolvers: Resolvers = {
    Query: {
        // User가 없거나 private이면 null 그 외에는 array반환
        seeFeed: async (_, { account, offset = 0 }: { account: string, offset: number }, { client, loggedInUser }): Promise<Post[] | null> => {
            try {
                const { post } = await client.user.findFirst({
                    where: {
                        account,
                        OR: [
                            { isPublic: true },
                            { account: loggedInUser },
                            { follower: { some: { account: loggedInUser } } },
                        ]
                    },
                    select: {
                        post: {
                            take: 25,
                            skip: offset,
                            orderBy: { createdAt: "desc" },
                            select: {
                                id: true,
                                photo: true,
                                _count: {
                                    select: {
                                        like: true,
                                        comment: true,
                                        reComment: true,
                                    }
                                }
                            },
                        }
                    }
                }) ?? { post: null };
                return post;
            } catch { }
            return []; // error시 빈 배열 반환
        }
    }
};

export default resolvers;