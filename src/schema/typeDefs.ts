export const typeDefs = `
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
  """
  Health check endpoint
  """
  health: String!

  """
  Get all users in the system
  """
  users: [User!]!

  """
  Get followers of a specific user with pagination
  """
  followers(
    userId: ID!
    limit: Int = 20
    offset: Int = 0
  ): FollowersPage!

  """
  Get users that a specific user is following with pagination
  """
  following(
    userId: ID!
    limit: Int = 20
    offset: Int = 0
  ): FollowingPage!

  """
  Get follower and following counts for a user
  """
  followCounts(userId: ID!): FollowCount!

  """
  Check if user A is following user B
  """
  isFollowing(followerId: ID!, followeeId: ID!): IsFollowingResult!
}

type Mutation {
  """
  Follow another user
  """
  follow(followerId: ID!, followeeId: ID!): Boolean!

  """
  Unfollow a user
  """
  unfollow(followerId: ID!, followeeId: ID!): Boolean!
}
`;
