import { gql } from "apollo-server-express";

export default gql`
    type Query{
        seeFeed(account:String! offset:Int): [Post]
    }
`;