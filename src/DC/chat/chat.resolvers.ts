import client from "prismaClient";
import pubsub, { NEW_CHAT } from "pubsub";
import { Resolvers, ResultToken } from "types";

const findOrCreateRoomId = async (userA: string | undefined, userB: string | undefined): Promise<number> => {
    if (userA === undefined || userB === undefined) {
        throw new Error("params have to string, not undefined");
    }
    const rooms = await client.user.findUnique({ where: { account: userA } }).chatRoom({ where: { user: { some: { account: userB } } }, select: { id: true } });
    return rooms.length > 0 ? rooms[0].id : (await client.chatRoom.create({ data: { user: { connect: [{ account: userA }, { account: userB }] } }, select: { id: true } })).id;
};

const resolvers: Resolvers = {
    Mutation: {
        readChat: (_, { chatId }: { chatId: number }, { loggedInUser: account }) => { },
        sendChat: async (_, { text, roomId: id, receiver }: { text: string, roomId: number | undefined, receiver: string | undefined }, { loggedInUser: account }): Promise<ResultToken> => {
            try {
                const roomId = id ?? await findOrCreateRoomId(account, receiver);
                const chat = await client.chat.create({ data: { text, roomId, account, } });
                pubsub.publish(NEW_CHAT, { roomUpdate: chat });
            } catch { }
            return { ok: false, error: "Fail to send Chat" };
        },
    },
    Subscription: {
        roomUpdate: {
            subscribe: (_, __, ___) => {
                console.log(___);
                return pubsub.asyncIterator(NEW_CHAT);
            },
        }
    }
};

export default resolvers;