import bcrypt from "bcrypt";
import { createWriteStream } from "fs";
import { FileUpload } from "graphql-upload";
import { Resolver, Resolvers, ResultToken } from "types";
import { Profile, User } from "User/interface";
import { ifLogin } from "User/user.utils";

const fn = async (avatar: FileUpload) => {
    const { filename, createReadStream } = await avatar; // await는 함수를 불러오는데에 필요
    const readStream = createReadStream();
    const newFilename = `${Date.now()}-${filename}`;
    const writeStream = createWriteStream(process.cwd() + "/src/uploads/" + newFilename);
    readStream.pipe(writeStream);
    return `http://localhost:4000/static/${newFilename}`
}

const editProfile: Resolver = async (_, { username, password, avatar, bio }: { username?: string, avatar?: FileUpload, bio?: string, password: string }, { client, loggedInUser }): Promise<ResultToken> => {
    try {
        const myPassword = (await client.user.findUnique({ where: { account: loggedInUser }, select: { password: true } }))?.password;
        const auth = myPassword ? await bcrypt.compare(password, myPassword) : false;
        if (auth) {
            await client.user.update({ where: { account: loggedInUser }, data: { username, bio, ...(avatar && { avatarUrl: await fn(avatar) }) } });
            return { ok: true };
        }
    } catch { }
    return { ok: false, error: "Fail to update profile." }
};

const resolvers: Resolvers = {
    Query: {
        searchUsers: async (_, { key }: { key: string }, { client }): Promise<User[]> => client.user.findMany({
            where: { OR: [{ username: key }, { account: key }] },
            take: 50,
            select: { username: true, account: true, avatarUrl: true }
        }),
        seeProfile: async (_, { account }: { account: string }, { client, loggedInUser }): Promise<Profile | null> => {
            try {
                const prisma = client.user.findUnique({ where: { account } });
                const user = await prisma;
                if (user === null) {
                    return null;
                }
                const follow = (account === loggedInUser) || user.select.find(elem => elem === "follow");
                const post = (account === loggedInUser) || user.select.find(elem => elem === "post");
                return {
                    username: user.username,
                    account: user.account,
                    avatarUrl: user.avatarUrl,
                    bio: user.bio,
                    ...(follow && { numOfFollowing: user.numOfFollowing, numOfFollower: user.numOfFollower }),
                    ...(post && { post: await prisma.post({ where: { account }, take: 24, select: { account: true, text: true }, orderBy: { createdAt: "asc" } }) }), //수정 필요
                };
            } catch { }
            return null;
        }
    },
    Mutation: {
        editProfile: ifLogin(editProfile)
    }
};

export default resolvers;