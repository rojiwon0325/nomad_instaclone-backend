import { JWTPayload, jwtVerify } from "jose";
import client from "prismaClient";
import privateKey from "privateKey";
import { Resolver } from "types";
import { User } from "User/interface";

interface Payload extends JWTPayload {
    account?: string
}
/**
 * check user LogIn  
 * return a Resolver function that return resolver or token
 */
export function ifLogin(resolver: Resolver): Resolver {

    return (root, args, context, info) =>
        context.loggedInUser
            ? resolver(root, args, { ...context, loggedInUser: context.loggedInUser }, info)
            : { ok: false, error: "Please Log In." };

}

export const getAccount = async (token: any): Promise<string> => {
    try {
        if (typeof token !== "string") {
            return "";
        }
        const { payload } = await jwtVerify(token, await privateKey);
        const { account }: Payload = payload;
        if (account && await client.user.findUnique({ where: { account } }) !== null) {
            return account;
        }
    } catch { }
    return "";
}

export const mapUser = (array: { username: string, account: string, avatarUrl: string, follower: { account: string }[] }[], myAccount: string) =>
    array.map(({ username, account, avatarUrl, follower }) => {
        return {
            username, account, avatarUrl,
            isMe: account === myAccount,
            isFollowing: follower.length > 0,
        }
    });