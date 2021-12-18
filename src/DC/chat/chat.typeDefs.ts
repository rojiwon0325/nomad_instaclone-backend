import { gql } from "apollo-server-express";

export default gql`
    type Mutation{
        readChat(chatId:Int!): ResultToken!
        sendChat(text:String! roomId:Int receiver: String): ResultToken!
    }
    type Subscription{
        roomUpdate(roomId: Int!): Chat!
    }
`;
