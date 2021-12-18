import { ChatRoom } from "DC/interface";
import client from "prismaClient";
import { Resolvers } from "types";

const resolvers: Resolvers = {
    Query: {
        seeRoom: async (_, { roomId: id, cursor }: { roomId: number, cursor?: number }, { loggedInUser: account }): Promise<ChatRoom | null> => {
            try {
                if (account === "") {
                    return null;
                }
                const room = await client.chatRoom.findUnique({
                    where: { id }, select: {
                        id: true,
                        updatedAt: true,
                        user: { where: { NOT: { account } }, select: { account: true, username: true, avatarUrl: true } },
                        chat: { where: { viewer: { some: { account } } }, take: 10, ...(cursor && { cursor: { id: cursor }, skip: 1 }), orderBy: { createdAt: "desc" } },
                    }
                });
                return room;
            } catch { }
            return null;
        },
        findOrCreateRoom: async (_, { account }: { account: string }, { loggedInUser }): Promise<number | null> => {
            try {
                if (loggedInUser === "") {
                    return null;
                }

                const { id } = await client.chatRoom.findFirst({
                    where: { user: { some: { account } } },
                    select: { id: true }
                }) ?? { id: undefined };
                if (id) {
                    return id;
                } else {
                    const { id } = await client.chatRoom.create({ data: { user: { connect: [{ account }, { account: loggedInUser }] } }, select: { id: true } });
                    return id;
                }
            } catch { }
            return null;
        },
        seeRoomList: async (_, { cursor }: { cursor?: number }, { loggedInUser: account }): Promise<ChatRoom[]> => {
            try {
                if (account === "") {
                    return [];
                }
                const rooms = await client.chatRoom.findMany({
                    where: {
                        user: { some: { account } },
                        chat: { some: { viewer: { some: { account } } } }
                    },
                    orderBy: { updatedAt: "asc" },
                    take: 10,
                    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
                    select: {
                        id: true, updatedAt: true,
                        user: { where: { NOT: { account } }, select: { account: true, username: true, avatarUrl: true } },
                        chat: { where: { viewer: { some: { account } } }, take: 3, orderBy: { createdAt: "desc" } },
                    }
                });
                return rooms.filter(room => room.chat.length > 0);
            } catch { }
            return [];
        },
    }
};

export default resolvers;