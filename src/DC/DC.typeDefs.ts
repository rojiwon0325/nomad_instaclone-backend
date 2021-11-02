import { gql } from "apollo-server-express";

export default gql`
    type Chat {
        id:Int!
        text: String!
        read: Boolean!
        roomId: Int!
        account: String!
        createdAt: String!
    }
    type ChatRoom {
        id: Int!
        user: [User]!
        chat: [Chat]!
        updatedAt: String!
    }
`;
