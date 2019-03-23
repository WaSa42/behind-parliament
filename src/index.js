require('dotenv').config();

import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import https from 'https';
import http from 'http';

import { ApolloServer } from 'apollo-server-express';

import scheduler from './schedulers';
import typeDefs from './graphql/schema';
import { resolvers } from './graphql/resolvers';

const configurations = {
  // Note: You may need sudo to run on port 443
  production: {
    ssl: true,
    port: 443,
    hostname: process.env.PROD_HOST,
    database: `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}`
  },
  development: {
    ssl: false,
    port: process.env.DEV_PORT,
    hostname: process.env.DEV_HOST,
    database: process.env.DB_DEV_PATH
  },
};

const environment = process.env.NODE_ENV || 'development';
export const config = configurations[environment];

// Database Connection
mongoose.connect(config.database, { useNewUrlParser: true });

const apollo = new ApolloServer({ typeDefs, resolvers });

const app = express();
apollo.applyMiddleware({ app });

// Create the HTTPS or HTTP server, per configuration
let server;
if (config.ssl) {
  // Assumes certificates are in .ssl folder from package root. Make sure the files
  // are secured.
  server = https.createServer(
    {
      key: fs.readFileSync(`./ssl/${environment}/server.key`),
      cert: fs.readFileSync(`./ssl/${environment}/server.crt`),
    },
    app
  );
} else {
  server = http.createServer(app);
}

// Add subscription support
apollo.installSubscriptionHandlers(server);

server.listen({ port: config.port }, () =>
  console.log(
    `🚀 ${environment} server ready at`,
    `http${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${apollo.graphqlPath}`
  )
);

scheduler.schedule();
