require('dotenv').config();
import { ApolloServer } from "apollo-server-express";
import client from "prismaClient";
import { resolvers, typeDefs } from "schema";
import express from "express";
import { graphqlUploadExpress } from "graphql-upload";
import { getAccount } from "User/user.utils";

async function startServer() {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({ req }) => {
            const token = req.headers.jwt;
            const account = await getAccount(token);
            return { client, loggedInUser: account }
        },
    });
    await server.start();

    const app = express();

    // This middleware should be added before calling `applyMiddleware`.
    app.use(graphqlUploadExpress());

    server.applyMiddleware({ app });
    app.use("/static", express.static("src/uploads"));

    const PORT = process.env.PORT;
    app.listen({ port: PORT }, () => console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`));
}

startServer();

