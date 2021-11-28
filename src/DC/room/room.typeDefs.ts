import { gql } from "apollo-server-express";

export default gql`
    type Query{
        seeRoomOne(roomId: Int! offset:Int!): [Chat!]!
        seeRoomMany(offset:Int): [ChatRoom!]! 
    }
`;
