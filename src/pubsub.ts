import { PubSub } from 'graphql-subscriptions';

export const NEW_CHAT = "NEW_CHAT";


const pubsub = new PubSub();

export default pubsub;
