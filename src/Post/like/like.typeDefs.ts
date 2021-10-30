import { gql } from "apollo-server-express";

export default gql`
    type LikeResult{
        ok: Boolean!
        error: String
        type: String
        postId: Int
    }
    type Query{
        seeLike(id:Int! offset:Int!): [User]!
    }
    type Mutation {
        clickLike(id:Int!): LikeResult
    }
`;
