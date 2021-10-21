import { gql } from "apollo-server-express";

export default gql`
    type Query{
        searchUsers(key:String!): [User]!
        seeProfile(account: String!): Profile
    }
    type Mutation{
        editProfile(username:String email:String avatar:Upload bio:String password:String!): ResultToken!
    }
`;
