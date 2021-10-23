import { gql } from "apollo-server-express";

export default gql`
    type FeedResult{
        ok:Boolean!
        error:String
        feed:[Post]
    }
    type Query{
        seeFeed(account:String! offset:Int):FeedResult!
    }
`;