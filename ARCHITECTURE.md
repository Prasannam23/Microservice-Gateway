# GraphQL Gateway - Architecture & Design

## System Overview

The GraphQL Gateway is an API aggregation layer that provides a unified GraphQL interface to clients while internally calling REST microservices. It implements Microsoft's Gateway Aggregation Pattern to reduce chattiness and provide a seamless client experience.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    Client Applications                    │
│              (Web, Mobile, Third-party APIs)              │
└────────────────────────────┬─────────────────────────────┘
                             │
                    GraphQL Query/Mutation
                             │
┌────────────────────────────▼──────────────────────────────┐
│              GraphQL Gateway (Apollo Server)              │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │   GraphQL Schema & Type Definitions                │  │
│  │   - User, Query, Mutation types                    │  │
│  │   - Schema stitching from resolvers                │  │
│  └────────────────────────────────────────────────────┘  │
│                        │                                  │
│  ┌────────────────────▼────────────────────────────────┐  │
│  │   Resolver Functions                               │  │
│  │   - Query resolvers (users, followers, etc.)       │  │
│  │   - Mutation resolvers (follow, unfollow)          │  │
│  │   - Error transformation                            │  │
│  └────────────────────┬────────────────────────────────┘  │
│                       │                                   │
│  ┌────────────────────▼────────────────────────────────┐  │
│  │   Data Sources / HTTP Client                       │  │
│  │   (node-fetch to call Follow Service REST APIs)    │  │
│  └────────────────────┬────────────────────────────────┘  │
│                       │                                   │
│  ┌────────────────────▼────────────────────────────────┐  │
│  │   Error Handler & Formatter                        │  │
│  │   - REST error → GraphQL error                     │  │
│  │   - Status codes → GraphQL error extensions        │  │
│  └────────────────────┬────────────────────────────────┘  │
│                       │                                   │
└───────────────────────┼────────────────────────────────────┘
                        │
                        │ HTTP Calls
                        │ (REST API)
        ┌───────────────▼───────────────┐
        │                               │
        ▼                               ▼
   ┌──────────────┐          ┌──────────────┐
   │Follow Service│          │Other Services│
   │(REST API)    │          │(Future)      │
   │Port 3000     │          │              │
   └──────────────┘          └──────────────┘
        │
        ▼
   ┌──────────────────┐
   │PostgreSQL        │
   │Database          │
   └──────────────────┘
```

## Layered Architecture

### 1. **Presentation Layer (GraphQL API)**
- **Files**: `src/schema/typeDefs.ts`, `src/app.ts`
- **Responsibility**: Define GraphQL schema and expose GraphQL endpoint
- **Operations**:
  - Type definitions (User, Query, Mutation)
  - Schema validation
  - Request parsing and formatting
  - Response serialization

### 2. **Resolution Layer (Resolvers)**
- **File**: `src/resolvers/resolvers.ts`
- **Responsibility**: Implement GraphQL field resolution logic
- **Operations**:
  - Map GraphQL fields to data source calls
  - Transform data to match schema
  - Aggregate data from multiple sources
  - Error transformation

### 3. **Data Fetching Layer (Data Sources)**
- **File**: `src/dataSources/followAPI.ts`
- **Responsibility**: Call external REST APIs
- **Operations**:
  - HTTP requests to Follow Service
  - Request building and response parsing
  - Error propagation
  - Connection management

### 4. **Cross-Cutting Concerns**
- **Error Handling**: `src/utils/errors.ts` - Transform REST errors to GraphQL errors
- **Middleware**: `src/middleware/apollo.ts` - Apollo Server configuration
- **Configuration**: Environment variables for service URLs

## Technology Stack

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 20+ | JavaScript runtime |
| **Language** | TypeScript | 5.3+ | Type-safe JavaScript |
| **GraphQL Framework** | Apollo Server | 4.10+ | GraphQL server implementation |
| **Web Framework** | Express.js | 4.18+ | HTTP server and middleware |
| **HTTP Client** | node-fetch | 2.7+ | REST API calls |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| ts-node-dev | 2.0+ | Development server with hot reload |
| Jest | 29.7+ | Unit testing framework |
| ts-jest | 29.1+ | Jest TypeScript support |
| ESLint | 8.56+ | Code linting |
| TypeScript ESLint | 6.16+ | TypeScript linting |

## Design Patterns

### 1. **Gateway Aggregation Pattern**
The gateway aggregates data from multiple microservices and presents a unified interface.

```typescript
// Query resolver aggregates data from multiple endpoints
followers: async (_, { userId, limit, offset }) => {
  // Call Follow Service for followers list
  const data = await followAPI.getFollowers(userId, limit, offset);
  return {
    total: data.total,
    items: data.items,
    limit,
    offset
  };
}
```

### 2. **Adapter Pattern**
The `followAPI` data source acts as an adapter between GraphQL world and REST world.

```typescript
// Adapter transforms REST responses to GraphQL format
export class FollowServiceAPI {
  async getFollowers(userId, limit, offset) {
    // Internal REST call
    const response = await fetch(...);
    // Transform to GraphQL format
    return {
      total: response.data.total,
      items: response.data.items
    };
  }
}
```

### 3. **Error Translation Pattern**
REST errors are translated to GraphQL-compatible format.

```typescript
export const handleAPIError = (error) => {
  if (error.message.includes('Cannot follow yourself')) {
    throw new APIError('Cannot follow yourself', error, 'SELF_FOLLOW');
  }
  // ... more error mappings
};
```

### 4. **Singleton Pattern**
Single instance of data source used throughout resolvers.

```typescript
export const followAPI = new FollowServiceAPI(FOLLOW_SERVICE_URL);

// Used in all resolvers
export const resolvers = {
  Query: {
    users: async () => followAPI.getUsers(),
    // ...
  }
};
```

## Data Flow

### Query Resolution Flow
```
Client GraphQL Query
  ↓
Apollo Server receives query
  ↓
Validates against schema (typeDefs)
  ↓
Executes resolver function for Query.users
  ↓
Resolver calls followAPI.getUsers()
  ↓
Data source makes HTTP request to Follow Service
  ↓
Follow Service returns REST JSON response
  ↓
Data source transforms to GraphQL format
  ↓
Resolver returns data
  ↓
Apollo formats as GraphQL response
  ↓
Client receives response
```

### Example: Followers Query
```
query {
  followers(userId: "...", limit: 10, offset: 0) {
    total
    items {
      id
      username
      displayName
    }
    limit
    offset
  }
}

↓

Resolver calls followAPI.getFollowers(userId, 10, 0)

↓

HTTP GET /api/v1/users/{userId}/followers?limit=10&offset=0

↓

Follow Service returns:
{
  success: true,
  data: {
    total: 25,
    items: [...users...]
  }
}

↓

Transformed to GraphQL format:
{
  followers: {
    total: 25,
    items: [...users...],
    limit: 10,
    offset: 0
  }
}
```

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

## Request/Response Mapping

### REST → GraphQL Mapping

| REST Endpoint | GraphQL Query/Mutation | Aggregation |
|--------------|----------------------|-------------|
| `GET /users` | `Query.users` | Returns raw list |
| `GET /users/:id/followers` | `Query.followers` | Returns paginated page |
| `GET /users/:id/following` | `Query.following` | Returns paginated page |
| `GET /follows/count/:id` | `Query.followCounts` | Calls 2 endpoints, aggregates |
| `GET /follows/check` | `Query.isFollowing` | Simple delegation |
| `POST /follows` | `Mutation.follow` | Simple delegation |
| `DELETE /follows` | `Mutation.unfollow` | Simple delegation |

## Error Handling Strategy

### Error Transformation

REST Status → GraphQL Error Code:

```typescript
export const handleAPIError = (error: unknown): never => {
  if (error instanceof Error) {
    const message = error.message;

    if (message.includes('Cannot follow yourself')) {
      throw new APIError('Cannot follow yourself', error, 'SELF_FOLLOW');
    }

    if (message.includes('Already following')) {
      throw new APIError('Already following this user', error, 'DUPLICATE_FOLLOW');
    }

    if (message.includes('User not found')) {
      throw new APIError('User not found', error, 'USER_NOT_FOUND');
    }

    if (message.includes('not found')) {
      throw new APIError('Resource not found', error, 'NOT_FOUND');
    }

    throw new APIError(message, error, 'FOLLOW_SERVICE_ERROR');
  }

  throw new APIError('An unexpected error occurred', undefined, 'INTERNAL_SERVER_ERROR');
};
```

### GraphQL Error Format

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

## Performance Considerations

### N+1 Query Prevention
```typescript
// Bad: Fetches user data N times
followers.map(f => followAPI.getUser(f.id))

// Good: Done in Follow Service with joins
// The REST endpoint returns full user objects
```

### Caching Strategy

**Current**: No caching (follow counts change frequently)

**Future Enhancement**:
```typescript
// Cache with TTL
const cache = new Map();
const TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedFollowerCount(userId) {
  const cached = cache.get(`followers:${userId}`);
  if (cached && Date.now() - cached.timestamp < TTL) {
    return cached.data;
  }

  const data = await followAPI.getFollowerCount(userId);
  cache.set(`followers:${userId}`, {
    data,
    timestamp: Date.now()
  });
  return data;
}
```

### Batching Resolver Calls

```typescript
// Multiple followers/following counts in single query
followCounts: async (_, { userId }) => {
  // These calls can be made in parallel
  const [followersCount, followingCount] = await Promise.all([
    followAPI.getFollowerCount(userId),
    followAPI.getFollowingCount(userId)
  ]);
  return { followersCount, followingCount };
}
```

## Security Considerations

### Input Validation
- GraphQL automatically validates input against schema
- IDs must be valid UUID format
- Limits are enforced (max 100 per page)

### Error Information Leakage
- GraphQL errors don't expose stack traces in production
- Configured via `formatError` in Apollo Server

### Authentication (Not Implemented)
Should be added in production:
```typescript
context: async ({ req }) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  const user = await verifyToken(token);
  return { user };
}
```

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│    Client Requests (GraphQL)             │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────┐
        │  Load Balancer   │
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌────────┐  ┌────────┐  ┌────────┐
│Gateway1│  │Gateway2│  │Gateway3│
│Pod     │  │Pod     │  │Pod     │
└────────┘  └────────┘  └────────┘
    │            │            │
    └────────────┼────────────┘
                 │
        ┌────────▼────────────┐
        │  Follow Service     │
        │  (Internal DNS)     │
        └────────────────────┘
```

## Monitoring & Observability

### Health Check
```
GET /health
Response: { "status": "ok" }
```

### GraphQL Introspection
Apollo Server provides introspection for tools:
```
GET /graphql?query=__schema
```

### Future Enhancements
- Request logging middleware
- Query performance metrics
- Error tracking (Sentry)
- Distributed tracing (Jaeger)

## Scalability Patterns

### Horizontal Scaling
- Stateless gateway allows unlimited instances
- Load balancer distributes requests
- All instances connect to same Follow Service

### Service Mesh (Future)
```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: graphql-gateway
spec:
  hosts:
  - graphql-gateway
  http:
  - match:
    - uri:
        prefix: /graphql
    route:
    - destination:
        host: graphql-gateway
        port:
          number: 4000
      weight: 100
```

## Development Workflow

1. **Define GraphQL Schema** → `src/schema/typeDefs.ts`
2. **Implement Resolvers** → `src/resolvers/resolvers.ts`
3. **Create Data Source** → `src/dataSources/followAPI.ts`
4. **Error Handling** → `src/utils/errors.ts`
5. **Local Testing** → `npm run dev`
6. **Build & Deploy** → Docker container
