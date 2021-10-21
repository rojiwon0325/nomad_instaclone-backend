import { Resolvers } from "types";

const resolvers: Resolvers = {
    Profile: {
        isMe: ({ account }: { account: string }, _, { loggedInUser }) => account === loggedInUser,
        isFollowing: async ({ account }, _, { client, loggedInUser }) => {
            const exist = loggedInUser
                ? await client.user.count({ where: { account: loggedInUser, following: { every: { account } } } })
                : 0;
            return 1 === exist
        },

    }
};

export default resolvers;