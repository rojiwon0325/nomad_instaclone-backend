import { gql } from "apollo-server-express";

export default gql`
    type Post{
        account:   String
        text:      String
    }
    
`;
