import { gql } from "apollo-server-express";

export default gql`
    type Comment_count{
        reComment: Int!
    }
    type Comment{
        id: Int!
        text: [String!]!
        rootId: String
        account: String!
        createdAt: String!

        _count: Comment_count

        isMine: Boolean!
    }
    type CommentResult{
        ok: Boolean!
        error: String
        comment: Comment
    }
    type Query{
        seeComment(postId:Int! rootId:Int offset:Int, take:Int): [Comment!]!
    }
    type Mutation{
        newComment(postId:Int! text:String! rootId:Int): CommentResult!
        deleteComment(id:Int!): ResultToken!
    }
`;
