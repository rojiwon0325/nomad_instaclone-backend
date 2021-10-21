import { gql } from "apollo-server-express";

export default gql`
    type LoginToken{
        ok:    Boolean!
        token: String
        error: String
    }
    type Mutation{
        createAccount(username:String! account:String! password:String!): ResultToken!
        login(account:String! password:String!): LoginToken!
    }
`;
