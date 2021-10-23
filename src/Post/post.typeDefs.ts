import { gql } from "apollo-server-express";

export default gql`
    type Post{
        id:         Int!
        account:    String!
        photo:      [String]!
        caption:    String!
    }
    type PostResult{
        ok: Boolean!
        error: String
        post: Post
    }
    type Mutation{
        newPost(photo:[Upload] caption:String!): PostResult!
        editPost(id:Int! caption:String!): PostResult!
        deletePost(id:Int!): PostResult!
    }
`;
