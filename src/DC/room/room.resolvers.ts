import { Chat, ChatRoom } from "DC/interface";
import client from "prismaClient";
import { Resolvers } from "types";

const resolvers: Resolvers = {
    Query: {
        seeRoomOne: async (_, { roomId: id, offset: skip }: { roomId: number, offset: number }, { loggedInUser: account }): Promise<Chat[]> => {
            try {
                if (account === "") {
                    return [];
                }
                return await client.chatRoom.findFirst({ where: { id, user: { some: { account } } } }).chat({ where: { viewer: { some: { account } } }, take: 10, skip, orderBy: { createdAt: "asc" } });
            } catch { }
            return [];
        },
        seeRoomMany: async (_, { offset: skip = 0 }: { offset: number }, { loggedInUser: account }): Promise<ChatRoom[]> => {
            try {
                if (account === "") {
                    return [];
                }
                return await client.chatRoom.findMany({
                    where: { user: { some: { account } }, chat: { some: { viewer: { some: { account } } } } },
                    orderBy: { updatedAt: "asc" },
                    take: 10, skip,
                    select: {
                        id: true, updatedAt: true,
                        user: { where: { NOT: { account } }, select: { account: true, username: true, avatarUrl: true } },
                        chat: { where: { viewer: { some: { account } } }, take: 10, orderBy: { createdAt: "asc" } },
                    }
                });
            } catch { }
            return [];
        },
    }
};

export default resolvers;