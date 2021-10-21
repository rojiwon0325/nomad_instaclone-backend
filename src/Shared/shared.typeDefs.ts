import { gql } from "apollo-server-express";

export default gql`
    scalar Upload
    type ResultToken{
        ok:    Boolean!
        error: String
    }
`;