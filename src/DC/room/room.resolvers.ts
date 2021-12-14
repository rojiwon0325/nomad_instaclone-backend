import { Chat, ChatRoom } from "DC/interface";
import client from "prismaClient";
import { Resolvers } from "types";

const resolvers: Resolvers = {
    Query: {
        seeRoom: async (_, { roomId: id, offset: skip = 0 }: { roomId: number, offset: number }, { loggedInUser: account }): Promise<ChatRoom | null> => {
            try {
                if (account === "") {
                    return null;
                }
                const room = await client.chatRoom.findUnique({
                    where: { id }, select: {
                        id: true,
                        updatedAt: true,
                        user: { where: { NOT: { account } }, select: { account: true, username: true, avatarUrl: true } },
                        chat: { where: { viewer: { some: { account } } }, take: 10, skip, orderBy: { createdAt: "asc" } },
                    }
                });
                return room;
            } catch { }
            return null;
        },
        findOrCreateRoom: async (_, { accounts }: { accounts: string[] }, { loggedInUser }): Promise<number | null> => {
            try {
                if (loggedInUser === "") {
                    return null;
                }
                const users = accounts.includes(loggedInUser) ? accounts : [...accounts, loggedInUser];
                const rooms = (await client.chatRoom.findMany({
                    where: { AND: users.map(account => ({ user: { some: { account } } })) },
                    select: {
                        id: true,
                        updatedAt: true,
                        user: { where: { NOT: { account: loggedInUser } }, select: { account: true, username: true, avatarUrl: true } },
                        _count: { select: { user: true } }
                    }
                })).filter(({ _count: { user } }) => user === users.length);
                if (rooms.length > 0) {
                    return rooms[0].id;
                } else {
                    const { id } = await client.chatRoom.create({ data: { user: { connect: users.map(account => ({ account })) } }, select: { id: true } });
                    return id;
                }
            } catch { }
            return null;
        },
        seeRoomList: async (_, { offset: skip = 0 }: { offset: number }, { loggedInUser: account }): Promise<ChatRoom[]> => {
            try {
                if (account === "") {
                    return [];
                }
                const rooms = await client.chatRoom.findMany({
                    where: { user: { some: { account } }, chat: { some: { viewer: { some: { account } } } } },
                    orderBy: { updatedAt: "asc" },
                    take: 10, skip,
                    select: {
                        id: true, updatedAt: true,
                        user: { where: { NOT: { account } }, select: { account: true, username: true, avatarUrl: true } },
                        chat: { where: { viewer: { some: { account } } }, take: 3, orderBy: { createdAt: "asc" } },
                    }
                });
                return rooms.filter(room => room.chat.length > 0);
            } catch { }
            return [];
        },
    }
};

export default resolvers;