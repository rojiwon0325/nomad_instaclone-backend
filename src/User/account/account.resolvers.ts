import { Resolvers, ResultToken } from "types";
import bcrypt from "bcrypt";
import privateKey from "privateKey";
import { SignJWT } from "jose";

interface LoginToken extends ResultToken {
    token?: string;
}

interface Account_args {
    username: string
    account: string
    password: string
}

const resolvers: Resolvers = {
    Mutation: {
        newAccount: async (_, { username, account, password }: Account_args, { client }): Promise<ResultToken> => {
            try {
                const user = await client.user.findUnique({ where: { account } });
                if (user) {
                    return { ok: false, error: "This account is already used." };
                }
                const newPassword = await bcrypt.hash(password, 10);
                await client.user.create({
                    data: { username, account, password: newPassword, select: ["follow", "post"] }
                })
                return { ok: true };
            } catch {
                return { ok: false, error: "Fail to create new account." }
            }
        },
        login: async (_, { account, password }, { client }): Promise<LoginToken> => {
            try {
                const user = await client.user.findUnique({ where: { account } });
                if (!user) {
                    return { ok: false, error: "Account Not Fount." };
                }
                const auth = await bcrypt.compare(password, user.password);
                if (!auth) {
                    return { ok: false, error: "Incorrect Password." };
                }
                const token = await new SignJWT({ account: user.account })
                    .setProtectedHeader({ alg: 'ES256' })
                    .setExpirationTime('2h')
                    .sign(await privateKey);

                return { ok: true, token };
            } catch {
                return { ok: false, error: "Fail to login" };
            }
        }
    },
};

export default resolvers;