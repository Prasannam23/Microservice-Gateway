import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { resolvers } from '../resolvers/resolvers';

const typeDefs = readFileSync(resolve(__dirname, '../schema/typeDefs.ts'), 'utf-8')
  .split('export const typeDefs = `')[1]
  .split('`;')[0];

export async function createApolloServer(): Promise<ApolloServer> {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (formattedError) => {
      console.error('GraphQL Error:', formattedError);
      return formattedError;
    }
  });

  await server.start();

  return server;
}

export function createExpressMiddleware(
  server: ApolloServer
): ReturnType<typeof expressMiddleware> {
  return expressMiddleware(server, {
    context: async ({ req }) => ({
      authorization: req.headers.authorization
    })
  });
}
