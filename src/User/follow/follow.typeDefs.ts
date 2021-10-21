import { gql } from "apollo-server-express";

export default gql`
    type FollowResult{
        ok: Boolean!
        error: String
        list: [User]
    }
    type Query{
        seeFollow(account:String! type:String! page:Int): FollowResult!
    }
    type Mutation{
        requestFollow(account:String!): ResultToken!
        responseFollow(account:String! accept:Boolean!): ResultToken!
        deleteFollow(account:String! type:String!): ResultToken!
    }
`;
