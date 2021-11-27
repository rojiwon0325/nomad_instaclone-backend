import { GraphQLScalarType } from "graphql";

export interface ResultToken {
    ok: boolean;
    error?: string;
}
export interface Resolver {
    (root: any, args: any, context: { loggedInUser: string }, info: any): any
}

export interface Resolvers {
    [key: string]: {
        [key: string]: Resolver | {
            [key: string]: Resolver,
        }
    }
}
