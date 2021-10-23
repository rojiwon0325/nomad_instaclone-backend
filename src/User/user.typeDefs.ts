import { gql } from "apollo-server-express";

export default gql`
    type User{
        username:       String!
        account:        String!
        avatarUrl:      String!
    }
    type Profile{
        account:        String!
        username:       String!
        bio:            String!
        avatarUrl:      String!
        isFollowing:    Boolean!
        isMe:           Boolean!
        
        numOfPost:      Int
        numOfFollower:  Int
        numOfFollowing: Int
    }
`;
