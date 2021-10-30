import { gql } from "apollo-server-express";

export default gql`
    type editProfile_data{
        username:   String
        avatarUrl:  String
        bio:        String
    }
    type editProfileResult{
        ok:     Boolean!
        error:  String
        data:   editProfile_data
    }
    type Query{
        seeProfile(account: String!): User
    }
    type Mutation{
        editProfile(username:String avatar:Upload bio:String password:String!): editProfileResult!
    }
`;
