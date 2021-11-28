import { gql } from "apollo-server-express";

export default gql`
    type LikeResult{
        ok: Boolean!
        error: String
        postId: Int
    }
    type Query{
        seeLike(id:Int! offset:Int!): [User!]!
    }
    type Mutation {
        doLike(id:Int!): LikeResult!
        doUnLike(id:Int!): LikeResult!
    }
`;
