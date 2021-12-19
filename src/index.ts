require('dotenv').config();
import express from "express";
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { ApolloServer } from "apollo-server-express";
import { graphqlUploadExpress } from "graphql-upload";
import { SubscriptionServer } from "subscriptions-transport-ws";
import schema from "schema";
import { getAccount } from "User/user.utils";

async function startServer() {
    const app = express();
    const httpServer = createServer(app);
    const server = new ApolloServer({
        schema,
        context: async (context) => {
            const { headers } = context.req;
            const token = headers.jwt;
            const loggedInUser = await getAccount(token);
            return { loggedInUser }
        },
        plugins: [{
            async serverWillStart() {
                return {
                    async drainServer() {
                        subscriptionServer.close();
                    }
                };
            }
        }],
    });

    const subscriptionServer = SubscriptionServer.create(
        {
            schema, execute, subscribe,
            async onConnect({ jwt }: { jwt: any }) {
                if (jwt === undefined) {
                    throw new Error("jwt is required");
                }
                const loggedInUser = await getAccount(jwt);
                return { loggedInUser }
            },
            async onDisconnect() {

            }
        },
        { server: httpServer, path: server.graphqlPath }
    );

    await server.start();

    // This middleware should be added before calling `applyMiddleware`.
    app.use(graphqlUploadExpress());

    server.applyMiddleware({ app });
    app.use("/static", express.static("src/uploads"));

    const PORT = process.env.PORT;
    httpServer.listen({ port: PORT }, () => console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`));
}

startServer();

