import client from "prismaClient";
import pubsub, { NEW_CHAT } from "pubsub";
import { Resolvers, ResultToken } from "types";

const findOrCreateRoom = async (userA: string | undefined, userB: string | undefined): Promise<{ id: number, user: { account: string }[] }> => {
    if (userA === undefined || userB === undefined) {
        throw new Error("params have to string, not undefined");
    }
    const rooms = await client.chatRoom.findMany({
        where: {
            AND: [{ user: { some: { account: userA } } }, { user: { some: { account: userB } } }],
        },
        select: {
            id: true,
            user: {
                select: {
                    account: true
                }
            },
            _count: {
                select: {
                    user: true
                }
            }
        }
    });
    rooms.forEach(({ id, user, _count }) => {
        if (_count.user === 2) {
            return { id, user };
        }
    });
    const room = await client.chatRoom.create({
        data: {
            user: {
                connect: [{ account: userA }, { account: userB }]
            }
        },
        select: {
            id: true,
            user: {
                select: { account: true }
            }
        }
    });
    return room;
};

const resolvers: Resolvers = {
    Mutation: {
        readChat: (_, { chatId }: { chatId: number }, { loggedInUser: account }) => { },
        sendChat: async (_, { text, roomId: id, receiver }: { text: string, roomId: number | undefined, receiver: string | undefined }, { loggedInUser: account }): Promise<ResultToken> => {
            try {
                const room = (await client.chatRoom.findUnique({ where: { id }, select: { id: true, user: { select: { account: true } } } })) ?? await findOrCreateRoom(account, receiver);
                const chat = await client.chat.create({ data: { text, roomId: room.id, account } });
                const newChat = await client.chat.update({
                    where: { id: chat.id },
                    data: { viewer: { connect: room.user } }
                });
                pubsub.publish(NEW_CHAT, { roomUpdate: newChat });
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