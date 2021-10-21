import { PrismaClient } from ".prisma/client";
import { GraphQLScalarType } from "graphql";

interface Context {
    loggedInUser: string;
    client: PrismaClient;
}
export interface ResultToken {
    ok: boolean;
    error?: string;
}
export interface Resolver { (root: any, args: any, context: Context, info: any): any }

export interface Resolvers {
    [key: string]: GraphQLScalarType | {
        [key: string]: Resolver
    }
}