import { gql } from "apollo-server-express";

export default gql`
    type Post_count{
        like: Int!
        comment: Int!
        reComment: Int!
    }
    type Post_detail{
        comments: [Comment!]! 
        caption:    String!
        account:    String!
        avatarUrl:  String!
        createdAt:  String!

        isMine:     Boolean!
        isLiked:    Boolean!
    }
    type Post{
        id:         Int!
        photo:      [String!]!
        _count: Post_count
        detail: Post_detail
    }
    type Query{
        seePost(id:Int offset:Int account:String): [Post!]
    }
    type Mutation{
        newPost(photo:[Upload!]! caption:String!): ResultToken!
        editPost(id:Int! caption:String!): ResultToken!
        deletePost(id:Int!): ResultToken!
    }
`;
