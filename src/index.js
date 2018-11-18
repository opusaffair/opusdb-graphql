import express from "express";
import serverless from "serverless-http";
import graphiql from "graphql-playground-middleware-express";
import { ApolloServer, makeExecutableSchema } from "apollo-server-express";
import { v1 as neo4j } from "neo4j-driver";
import typeDefs from "./schema/typeDefs";
import resolvers from "./schema/resolvers";

const app = express();

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
});

const server = new ApolloServer({
  schema,
  path: "/graphql",
  engine: {
    apiKey: process.env.APOLLO_ENGINE_KEY
  },
  context: ({ req }) => {
    return {
      headers: req.headers,
      driver
    };
  }
});
server.applyMiddleware({ app });
app.get("/playground", graphiql({ endpoint: "/graphql" }));
console.log(process.env.DEMO);
const handler = serverless(app);
export { handler };
