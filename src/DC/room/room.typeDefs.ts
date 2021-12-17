import { gql } from "apollo-server-express";

export default gql`
    type Query{
        seeRoom(roomId:Int! cursor:Int): ChatRoom
        findOrCreateRoom(account:String!): Int
        seeRoomList(cursor:Int): [ChatRoom!]! 
    }
`;
