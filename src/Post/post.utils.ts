import { Resolver } from "types";

export const extractTags = (caption: string): { where: { name: string }, create: { name: string } }[] => {
    const hashtags = caption.match(/#[\d|A-Z|a-z|ㄱ-ㅎ|ㅏ-ㅣ|가-힣]+/g) || [];
    return hashtags.map((hashtag) => ({
        where: { name: hashtag },
        create: { name: hashtag },
    }));
};

export function ifPermitted(resolver: Resolver): Resolver {
    return async (root, args, context, info) => {
        const { postId }: { postId: number } = args;
        const { client, loggedInUser: account } = context;
        const post = await client.post.findFirst({
            where: {
                id: postId,
                OR: [{ account },
                { user: { follower: { some: { account } } } },
                { public: true }]
            }, select: {}
        });
        return post ? resolver(root, args, context, info) : [];
    }
};