import { gql } from "apollo-server-express";

export default gql`
    type Query{
        seeRoom(roomId:Int! offset:Int): ChatRoom
        findOrCreateRoom(accounts:[string!]!) Int
        seeRoomList(offset: Int): [ChatRoom!]! 
    }
`;
