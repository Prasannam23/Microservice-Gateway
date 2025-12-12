import express, { Express } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { resolvers } from './resolvers/resolvers';

const typeDefs = `
type User {
  id: ID!
  username: String!
  displayName: String
}

type FollowersPage {
  total: Int!
  items: [User!]!
  limit: Int!
  offset: Int!
}

type FollowingPage {
  total: Int!
  items: [User!]!
  limit: Int!
  offset: Int!
}

type FollowCount {
  followersCount: Int!
  followingCount: Int!
}

type IsFollowingResult {
  isFollowing: Boolean!
}

type Query {
  health: String!
  users: [User!]!
  followers(userId: ID!, limit: Int = 20, offset: Int = 0): FollowersPage!
  following(userId: ID!, limit: Int = 20, offset: Int = 0): FollowingPage!
  followCounts(userId: ID!): FollowCount!
  isFollowing(followerId: ID!, followeeId: ID!): IsFollowingResult!
}

type Mutation {
  follow(followerId: ID!, followeeId: ID!): Boolean!
  unfollow(followerId: ID!, followeeId: ID!): Boolean!
}
`;

export async function createApp(): Promise<Express> {
  const app = express();

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use(express.json());

  try {
    console.log('Initializing Apollo Server...');

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: true,
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return error;
      }
    });

    console.log('Starting Apollo Server...');
    await server.start();
    console.log('Apollo Server started successfully');

    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: async ({ req }) => {
          return {
            authorization: req.headers.authorization || null
          };
        }
      })
    );

    console.log('Apollo middleware registered');
  } catch (err) {
    console.error('Error while bootstrapping GraphQL server', err);
    throw err;
  }

  return app;
}

export { resolvers };
