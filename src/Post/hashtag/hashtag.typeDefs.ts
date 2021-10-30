import { gql } from "apollo-server-express";

export default gql`
    type Hashtag_count {
        post: Int!
    }
    type Hashtag{
        name: String!
        _count: Hashtag_count
    } 
    type Query{
        searchTag(tag:String! offset:Int):[Hashtag]!
    }
`;
