import { gql } from "apollo-server-express";

export default gql`
    type Query{
        seeFollower(account:String! offset:Int): [User]!
        seeFollowing(account:String! offset:Int): [User]!
    }
    type Mutation{
        requestFollow(account:String!): ResultToken!
        responseFollow(account:String! accept:Boolean!): ResultToken!
        deleteFollower(account:String!): ResultToken!
        deleteFollowing(account:String!): ResultToken!
    }
`;
