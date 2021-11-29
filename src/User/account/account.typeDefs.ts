import { gql } from "apollo-server-express";

export default gql`
    type LoginToken{
        ok:    Boolean!
        token: String
        error: String
    }
    type Query{
        getMe: String
    }
    type Mutation{
        newAccount(username:String! account:String! password:String!): ResultToken!
        deleteAccount(password:String!): ResultToken!
        login(account:String! password:String!): LoginToken!
    }
`;
