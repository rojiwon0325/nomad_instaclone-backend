import bcrypt from "bcrypt";
import { FileUpload } from "graphql-upload";
import client from "prismaClient";
import { deleteToS3, uploadToS3 } from "Shared/shared.utils";
import { Resolver, Resolvers, ResultToken } from "types";
import { User } from "User/interface";
import { ifLogin } from "User/user.utils";

const editProfile: Resolver = async (_, { username, password, avatar, bio, isPublic }: { username?: string, avatar?: FileUpload, bio?: string, password: string, isPublic?: boolean }, { loggedInUser: account }): Promise<ResultToken & { data?: { username: string, avatarUrl: string, isPublic: boolean, bio: string } }> => {
    try {
        const { password: myPassword, avatarUrl } = await client.user.findUnique({ where: { account }, select: { password: true, avatarUrl: true } }) ?? { mypassword: "", avatarUrl: "" };
        const auth = myPassword ? await bcrypt.compare(password, myPassword) : false;
        if (auth) {
            if (avatar) {
                deleteToS3(avatarUrl);
            }
            const data = await client.user.update({
                where: { account },
                data: {
                    username,
                    bio,
                    isPublic,
                    ...(avatar && { avatarUrl: await uploadToS3(avatar, account, "avatar") })
                },
                select: {
                    username: true,
                    avatarUrl: true,
                    isPublic: true,
                    bio: true,
                }
            });
            return { ok: true, data };
        }
    } catch { }
    return { ok: false, error: "Fail to update profile." }
};

const resolvers: Resolvers = {
    Query: {
        seeProfile: async (_, { account }: { account: string }, { loggedInUser }): Promise<User | null> => {
            try {
                const prisma = client.user.findUnique({
                    where: { account },
                    select: {
                        account: true,
                        username: true,
                        avatarUrl: true,

                        bio: true,
                        isPublic: true,

                        _count: {
                            select: {
                                post: true,
                                follower: true,
                                following: true,
                            }
                        }
                    }
                });
                const [user, follower] = await Promise.all([prisma, prisma.follower({ where: { account: loggedInUser } })]);
                if (user === null) return null;
                else {
                    const { account, username, avatarUrl, bio, isPublic, _count } = user;
                    const isFollowing = follower.length > 0;
                    const isMe = account === loggedInUser;
                    return { account, username, avatarUrl, isMe, isFollowing, profile: { bio, isPublic, _count } };
                }
            } catch { }
            return null;
        }
    },
    Mutation: {
        editProfile: ifLogin(editProfile)
    }
};

export default resolvers;