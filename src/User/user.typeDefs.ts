import { gql } from "apollo-server-express";

export default gql`
    type Profile_count{
        post:       Int!
        follower:   Int!
        following:  Int!        
    }
    type Profile{
        isPublic:   Boolean!
        bio:        [String!]!
        
        _count:     Profile_count
    }
    type User{
        username:       String!
        account:        String!
        avatarUrl:      String!

        isMe:           Boolean
        isFollowing:    Boolean
        isRequesting:   Boolean
        isRequested:    Boolean
        profile:        Profile
    }
    type Query{
        searchUsers(key:String!): [User!]!
    }
`;
