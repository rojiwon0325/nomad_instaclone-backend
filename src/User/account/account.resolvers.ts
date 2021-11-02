import { Resolver, Resolvers, ResultToken } from "types";
import bcrypt from "bcrypt";
import privateKey from "privateKey";
import { SignJWT } from "jose";
import client from "prismaClient";
import { ifLogin } from "User/user.utils";

const deleteAccount: Resolver = async (_, { password }: { password: string }, { loggedInUser: account }): Promise<ResultToken> => {
    try {
        const user = await client.user.findUnique({ where: { account }, select: { password: true } }) ?? { password: "" };
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            await client.user.delete({ where: { account } });
            //강제 로그아웃 동작 추가 필요
            return { ok: true };
        } else {
            return { ok: false, error: "The password is incorrect" };
        }
    } catch { }
    return { ok: false, error: "Fail to delete account" };
};


const resolvers: Resolvers = {
    Mutation: {
        newAccount: async (_, { username, account, password }: { username: string, account: string, password: string }): Promise<ResultToken> => {
            try {
                const user = await client.user.findUnique({ where: { account } });
                if (user) {
                    return { ok: false, error: "This account is already used." };
                }
                const newPassword = await bcrypt.hash(password, 10);
                await client.user.create({
                    data: { username, account, password: newPassword }
                })
                return { ok: true };
            } catch {
                return { ok: false, error: "Fail to create new account." }
            }
        },
        deleteAccount: ifLogin(deleteAccount),
        login: async (_, { account, password }: { account: string, password: string }): Promise<ResultToken & { token?: string }> => {
            try {
                const user = await client.user.findUnique({ where: { account } });
                if (!user) {
                    return { ok: false, error: "Account Not Fount." };
                }
                const auth = await bcrypt.compare(password, user.password);
                if (!auth) {
                    return { ok: false, error: "Incorrect Password." };
                }
                const token = await new SignJWT({ account })
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