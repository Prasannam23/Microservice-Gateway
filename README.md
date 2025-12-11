# GraphQL Gateway

A production-ready GraphQL API Gateway that aggregates data from multiple microservices. This service implements the Gateway Aggregation pattern to reduce chattiness between clients and backend services.

## Architecture

```
Client (GraphQL Query)
    ↓
GraphQL Gateway (Aggregation & Resolution)
    ↓
Follow Service (REST API)
    ↓
PostgreSQL Database
```

The GraphQL Gateway:
- Accepts GraphQL queries and mutations from clients
- Resolves them by making REST calls to the Follow Service
- Aggregates responses and transforms them to match the GraphQL schema
- Provides unified error handling and validation
- Acts as a single entry point for clients

## Gateway Aggregation Pattern

This service implements Microsoft's Gateway Aggregation Pattern to:

1. **Reduce Chattiness**: Clients make a single GraphQL request instead of multiple REST calls
2. **Unified API**: Single interface for multiple backend services
3. **Abstraction**: Backend service changes don't affect clients
4. **Error Handling**: Centralized error management and transformation
5. **Scalability**: Stateless design allows horizontal scaling

## Technology Stack

**Language**: TypeScript/Node.js

**GraphQL Framework**: Apollo Server with Express

**HTTP Client**: node-fetch

**Why These Choices?**

1. **Apollo Server**:
   - Industry-standard GraphQL implementation
   - Excellent error handling and validation
   - Built-in support for middleware and plugins
   - Great tooling and ecosystem

2. **Express.js**:
   - Lightweight and fast
   - Perfect for middleware composition
   - Works seamlessly with Apollo

3. **TypeScript**:
   - Type safety for resolver functions
   - Better IDE support and autocompletion
   - Catches bugs at compile time

4. **node-fetch**:
   - Simple HTTP client for calling Follow Service
   - Promise-based for async operations

## GraphQL Schema

### Types

```graphql
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
```

### Queries

```graphql
type Query {
  health: String!
  users: [User!]!
  followers(userId: ID!, limit: Int = 20, offset: Int = 0): FollowersPage!
  following(userId: ID!, limit: Int = 20, offset: Int = 0): FollowingPage!
  followCounts(userId: ID!): FollowCount!
  isFollowing(followerId: ID!, followeeId: ID!): IsFollowingResult!
}
```

### Mutations

```graphql
type Mutation {
  follow(followerId: ID!, followeeId: ID!): Boolean!
  unfollow(followerId: ID!, followeeId: ID!): Boolean!
}
```

## Sample GraphQL Queries & Mutations

### Get All Users

```graphql
query GetAllUsers {
  users {
    id
    username
    displayName
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "users": [
      {
        "id": "11111111-1111-1111-1111-111111111111",
        "username": "alice",
        "displayName": "Alice"
      },
      {
        "id": "22222222-2222-2222-2222-222222222222",
        "username": "bob",
        "displayName": "Bob"
      }
    ]
  }
}
```

### Follow a User

```graphql
mutation FollowUser {
  follow(
    followerId: "11111111-1111-1111-1111-111111111111"
    followeeId: "22222222-2222-2222-2222-222222222222"
  )
}
```

**Expected Response:**
```json
{
  "data": {
    "follow": true
  }
}
```

**Error Response (Self-follow):**
```json
{
  "errors": [
    {
      "message": "Cannot follow yourself",
      "extensions": {
        "code": "SELF_FOLLOW"
      }
    }
  ]
}
```

**Error Response (Duplicate):**
```json
{
  "errors": [
    {
      "message": "Already following this user",
      "extensions": {
        "code": "DUPLICATE_FOLLOW"
      }
    }
  ]
}
```

### Unfollow a User

```graphql
mutation UnfollowUser {
  unfollow(
    followerId: "11111111-1111-1111-1111-111111111111"
    followeeId: "22222222-2222-2222-2222-222222222222"
  )
}
```

**Expected Response:**
```json
{
  "data": {
    "unfollow": true
  }
}
```

### Get Followers

```graphql
query GetFollowers {
  followers(userId: "22222222-2222-2222-2222-222222222222", limit: 10, offset: 0) {
    total
    limit
    offset
    items {
      id
      username
      displayName
    }
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "followers": {
      "total": 3,
      "limit": 10,
      "offset": 0,
      "items": [
        {
          "id": "11111111-1111-1111-1111-111111111111",
          "username": "alice",
          "displayName": "Alice"
        }
      ]
    }
  }
}
```

### Get Following

```graphql
query GetFollowing {
  following(userId: "11111111-1111-1111-1111-111111111111", limit: 10, offset: 0) {
    total
    limit
    offset
    items {
      id
      username
      displayName
    }
  }
}
```

### Get Follow Counts

```graphql
query GetFollowCounts {
  followCounts(userId: "11111111-1111-1111-1111-111111111111") {
    followersCount
    followingCount
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "followCounts": {
      "followersCount": 2,
      "followingCount": 3
    }
  }
}
```

### Check If Following

```graphql
query CheckFollowing {
  isFollowing(
    followerId: "11111111-1111-1111-1111-111111111111"
    followeeId: "22222222-2222-2222-2222-222222222222"
  ) {
    isFollowing
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "isFollowing": {
      "isFollowing": true
    }
  }
}
```

### Complex Query - Full User Profile

```graphql
query GetUserProfile {
  user: users {
    id
    username
    displayName
  }
  
  followers(userId: "11111111-1111-1111-1111-111111111111", limit: 5) {
    total
    items {
      username
    }
  }
  
  following(userId: "11111111-1111-1111-1111-111111111111", limit: 5) {
    total
    items {
      username
    }
  }
  
  counts: followCounts(userId: "11111111-1111-1111-1111-111111111111") {
    followersCount
    followingCount
  }
}
```

## Error Handling

All errors are returned in GraphQL format with error codes:

| Error Code | Description |
|-----------|-------------|
| SELF_FOLLOW | User trying to follow themselves |
| DUPLICATE_FOLLOW | User already following the target |
| USER_NOT_FOUND | User does not exist |
| NOT_FOUND | Resource not found |
| FOLLOW_SERVICE_ERROR | Error from Follow Service |
| INTERNAL_SERVER_ERROR | Unexpected error |

## Local Development

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (for full stack)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
cd graphql-gateway
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Start full stack with Docker Compose**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Follow Service (port 3000)
- GraphQL Gateway (port 4000)

5. **Access GraphQL Playground**
Open browser to: `http://localhost:4000/graphql`

### Manual Development (without Docker)

1. **Start Follow Service first** (in separate terminal)
```bash
cd ../follow-service
npm install
npm run dev
```

2. **Start GraphQL Gateway**
```bash
npm run dev
```

Access at: `http://localhost:4000/graphql`

## Testing

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

## Production Deployment

### Using Docker Compose (Full Stack)

```bash
docker-compose up -d
```

This starts all three services (Postgres, Follow Service, GraphQL Gateway) connected on a shared network.

### Manual Docker Deployment

1. **Build image**
```bash
docker build -t graphql-gateway:latest .
```

2. **Run container**
```bash
docker run -d \
  --name graphql-gateway \
  -p 4000:4000 \
  -e FOLLOW_SERVICE_URL=http://follow-service:3000/api/v1 \
  --network microservices \
  graphql-gateway:latest
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment | development/production |
| PORT | Server port | 4000 |
| FOLLOW_SERVICE_URL | Follow Service URL | http://follow-service:3000/api/v1 |

### Production Considerations

1. **Security**
   - Add authentication middleware (JWT validation)
   - Implement authorization checks per resolver
   - Use HTTPS/TLS
   - Add rate limiting

2. **Performance**
   - Implement DataLoader for batch requests
   - Add response caching (Redis)
   - Use persistent HTTP connections
   - Implement query complexity analysis

3. **Reliability**
   - Implement circuit breaker for Follow Service calls
   - Add retry logic with exponential backoff
   - Set timeouts for all HTTP requests
   - Log all errors with correlation IDs

4. **Monitoring**
   - Log all GraphQL queries
   - Track resolver execution times
   - Monitor Follow Service latency
   - Set up alerts for error rates

## Architecture Decisions

### 1. Gateway Aggregation Pattern
Instead of clients directly calling Follow Service, they go through the Gateway to:
- Reduce network requests
- Provide a unified API
- Handle service complexity at the gateway level
- Enable caching and optimization at the gateway

### 2. REST to GraphQL Translation
Follow Service provides REST API, Gateway translates to GraphQL because:
- GraphQL provides better client experience
- Clients can request exactly what they need
- Easier to add new fields without breaking clients
- Industry standard for API gateways

### 3. Error Translation
We translate Follow Service errors to GraphQL errors with custom codes for:
- Better client error handling
- Consistent error format
- Easier debugging
- Type-safe error responses

### 4. Stateless Design
Gateway doesn't store state because:
- Easy to scale horizontally
- No session management complexity
- Better failover capabilities
- Simpler deployment

### 5. Direct HTTP Calls (No SDK)
We call Follow Service via HTTP instead of SDK because:
- Loose coupling between services
- Easy to change Follow Service independently
- Works with any language implementation
- Simpler dependency management

## Integration Points

### Follow Service Integration

The gateway calls these Follow Service endpoints:

```
POST   /api/v1/follows              - Follow user
DELETE /api/v1/follows              - Unfollow user
GET    /api/v1/follows/check        - Check if following
GET    /api/v1/users                - Get all users
GET    /api/v1/users/:id/followers  - Get followers
GET    /api/v1/users/:id/following  - Get following
GET    /api/v1/users/:id/followers/count  - Get follower count
GET    /api/v1/users/:id/following/count  - Get following count
```

See Follow Service README for detailed endpoint documentation.

## Scaling Considerations

### Current Bottlenecks
1. Gateway becomes bottleneck if not scaled
2. Follow Service database becomes bottleneck with many users
3. N+1 queries problem if not careful with resolver design

### Solutions
1. **Gateway Scaling**: Deploy multiple Gateway instances behind load balancer
2. **Database**: Use read replicas, connection pooling, caching
3. **Resolvers**: Use DataLoader to batch queries to Follow Service
4. **Caching**: Add Redis for follower count caching

## Future Enhancements

1. **Authentication**: Add JWT validation middleware
2. **Subscriptions**: Add WebSocket support for real-time updates
3. **Mutations**: Add batch operations
4. **Caching**: Implement Apollo Client cache directives
5. **Tracing**: Add distributed tracing with correlation IDs
6. **Rate Limiting**: Add per-user or per-IP rate limits

## License

ISC

## Support

For issues or questions, refer to the main repository's issue tracker.
