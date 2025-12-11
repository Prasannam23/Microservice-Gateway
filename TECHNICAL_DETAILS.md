# GraphQL Gateway - Technical Details & Development Guide

## Project Structure

```
graphql-gateway/
├── src/
│   ├── server.ts                    # Server startup and graceful shutdown
│   ├── app.ts                       # Express + Apollo Server setup
│   ├── schema/
│   │   └── typeDefs.ts              # GraphQL schema definitions
│   ├── resolvers/
│   │   └── resolvers.ts             # GraphQL resolver implementations
│   ├── dataSources/
│   │   └── followAPI.ts             # Follow Service HTTP client
│   ├── middleware/
│   │   └── apollo.ts                # Apollo Server configuration
│   ├── utils/
│   │   └── errors.ts                # Error definitions and handlers
│   └── __tests__/
│       └── followAPI.spec.ts        # API client tests
├── dist/                            # Compiled JavaScript (generated)
├── node_modules/                    # Dependencies (generated)
├── .env                             # Environment variables (local)
├── .env.example                     # Example environment variables
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── jest.config.js                   # Jest testing configuration
├── .eslintrc.json                   # ESLint configuration
├── Dockerfile                       # Docker container definition
├── docker-compose.yml               # Docker Compose orchestration
├── README.md                        # Service overview
├── ARCHITECTURE.md                  # Architecture documentation
└── TECHNICAL_DETAILS.md             # This file
```

## Installation & Setup

### Prerequisites
- Node.js 20+
- npm 10+
- Follow Service running (http://localhost:3000/api/v1 by default)

### Local Development Setup

```bash
# 1. Install dependencies
cd graphql-gateway
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env if needed (default settings work with local Follow Service)

# 3. Start development server
npm run dev
```

## Environment Variables

```bash
# Follow Service REST API URL
FOLLOW_SERVICE_URL="http://localhost:3000/api/v1"

# Server port (optional, default: 4000)
PORT=4000

# Node environment
NODE_ENV="development" # or "production"
```

## Available Scripts

### Development
```bash
# Start dev server with hot reload
npm run dev

# Watch mode tests
npm run test:watch

# Run linter
npm run lint
```

### Build & Production
```bash
# Compile TypeScript to JavaScript
npm run build

# Start production server (requires build first)
npm start

# Run production build and start
npm run build && npm start
```

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## GraphQL Endpoints

### Base URL
```
http://localhost:4000
```

### Health Check
```http
GET /health

Response: 200 OK
{
  "status": "ok"
}
```

### GraphQL API
```http
POST /graphql
Content-Type: application/json

{
  "query": "{ users { id username displayName } }"
}
```

### GraphQL Playground (Development)
```
http://localhost:4000/graphql
```
Interactive GraphQL explorer available in development mode.

---

## GraphQL Queries & Mutations

### Query 1: Get All Users

```graphql
query {
  users {
    id
    username
    displayName
  }
}
```

**Response:**
```json
{
  "data": {
    "users": [
      {
        "id": "11111111-1111-1111-1111-111111111111",
        "username": "alice",
        "displayName": "Alice Wonder"
      },
      {
        "id": "22222222-2222-2222-2222-222222222222",
        "username": "bob",
        "displayName": "Bob Smith"
      },
      {
        "id": "33333333-3333-3333-3333-333333333333",
        "username": "carol",
        "displayName": "Carol Jones"
      }
    ]
  }
}
```

---

### Query 2: Get User's Followers

```graphql
query {
  followers(
    userId: "11111111-1111-1111-1111-111111111111"
    limit: 10
    offset: 0
  ) {
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
```

**Response:**
```json
{
  "data": {
    "followers": {
      "total": 2,
      "items": [
        {
          "id": "22222222-2222-2222-2222-222222222222",
          "username": "bob",
          "displayName": "Bob Smith"
        },
        {
          "id": "33333333-3333-3333-3333-333333333333",
          "username": "carol",
          "displayName": "Carol Jones"
        }
      ],
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

### Query 3: Get User's Following List

```graphql
query {
  following(
    userId: "22222222-2222-2222-2222-222222222222"
    limit: 10
    offset: 0
  ) {
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
```

**Response:**
```json
{
  "data": {
    "following": {
      "total": 1,
      "items": [
        {
          "id": "33333333-3333-3333-3333-333333333333",
          "username": "carol",
          "displayName": "Carol Jones"
        }
      ],
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

### Query 4: Get Follow Counts

```graphql
query {
  followCounts(userId: "11111111-1111-1111-1111-111111111111") {
    followersCount
    followingCount
  }
}
```

**Response:**
```json
{
  "data": {
    "followCounts": {
      "followersCount": 2,
      "followingCount": 2
    }
  }
}
```

---

### Query 5: Check if Following

```graphql
query {
  isFollowing(
    followerId: "11111111-1111-1111-1111-111111111111"
    followeeId: "22222222-2222-2222-2222-222222222222"
  ) {
    isFollowing
  }
}
```

**Response:**
```json
{
  "data": {
    "isFollowing": {
      "isFollowing": true
    }
  }
}
```

---

### Mutation 1: Follow User

```graphql
mutation {
  follow(
    followerId: "11111111-1111-1111-1111-111111111111"
    followeeId: "33333333-3333-3333-3333-333333333333"
  )
}
```

**Response (Success):**
```json
{
  "data": {
    "follow": true
  }
}
```

**Response (Error - Already Following):**
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

---

### Mutation 2: Unfollow User

```graphql
mutation {
  unfollow(
    followerId: "11111111-1111-1111-1111-111111111111"
    followeeId: "22222222-2222-2222-2222-222222222222"
  )
}
```

**Response (Success):**
```json
{
  "data": {
    "unfollow": true
  }
}
```

**Response (Error - Not Following):**
```json
{
  "errors": [
    {
      "message": "Follow relationship not found",
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```

---

## Complex Query Examples

### Combined Query: Get Everything for a User

```graphql
query GetUserProfile($userId: ID!) {
  user: users {
    id
    username
    displayName
  }
  
  followers(userId: $userId, limit: 5) {
    total
    items {
      id
      username
    }
  }
  
  following(userId: $userId, limit: 5) {
    total
    items {
      id
      username
    }
  }
  
  counts: followCounts(userId: $userId) {
    followersCount
    followingCount
  }
}
```

**Variables:**
```json
{
  "userId": "11111111-1111-1111-1111-111111111111"
}
```

---

### Mutation: Follow User and Get Updated Status

```graphql
mutation FollowUserAndCheck($followerId: ID!, $followeeId: ID!) {
  follow(followerId: $followerId, followeeId: $followeeId)
  
  isFollowing: isFollowing(followerId: $followerId, followeeId: $followeeId) {
    isFollowing
  }
  
  counts: followCounts(userId: $followeeId) {
    followersCount
  }
}
```

**Variables:**
```json
{
  "followerId": "11111111-1111-1111-1111-111111111111",
  "followeeId": "22222222-2222-2222-2222-222222222222"
}
```

---

## cURL Examples

### Health Check
```bash
curl http://localhost:4000/health
```

### GraphQL Query with cURL

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ users { id username displayName } }"
  }'
```

### GraphQL Mutation with cURL

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { follow(followerId: \"11111111-1111-1111-1111-111111111111\" followeeId: \"22222222-2222-2222-2222-222222222222\") }"
  }'
```

---

## PowerShell Examples

### GraphQL Query with Invoke-WebRequest

```powershell
$body = @{
    query = '{ users { id username displayName } }'
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:4000/graphql `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body | Select-Object -ExpandProperty Content
```

### GraphQL Mutation with PowerShell

```powershell
$mutation = @{
    query = 'mutation { follow(followerId: "11111111-1111-1111-1111-111111111111" followeeId: "22222222-2222-2222-2222-222222222222") }'
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:4000/graphql `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $mutation
```

---

## File Structure & Responsibilities

### `src/app.ts`
- Creates Express application
- Configures Apollo Server
- Sets up GraphQL endpoint at `/graphql`
- Sets up health check at `/health`
- Handles server initialization and error handling

### `src/server.ts`
- Starts HTTP server
- Initializes Apollo Server
- Handles graceful shutdown

### `src/schema/typeDefs.ts`
- Defines GraphQL schema
- Type definitions (User, Query, Mutation)
- Field arguments and default values

### `src/resolvers/resolvers.ts`
- Implements resolver functions for each GraphQL field
- Maps GraphQL operations to Follow Service API calls
- Aggregates data from multiple sources
- Error handling and transformation

### `src/dataSources/followAPI.ts`
- HTTP client for Follow Service REST API
- Methods for each Follow Service endpoint
- Request building and response parsing
- Error translation

### `src/utils/errors.ts`
- `APIError` class extending GraphQL error
- Error code mapping
- `handleAPIError()` function for REST→GraphQL error conversion

### `src/middleware/apollo.ts`
- Apollo Server configuration (optional, integrated into app.ts)

---

## Resolver Implementation Details

### Query Resolvers

```typescript
export const resolvers = {
  Query: {
    // Returns static health string
    health: (): string => 'ok',

    // Fetches all users from Follow Service
    users: async (): Promise<any[]> => {
      try {
        return await followAPI.getUsers();
      } catch (error) {
        return handleAPIError(error);
      }
    },

    // Fetches paginated followers list
    followers: async (
      _parent: any,
      { userId, limit, offset }: { userId: string; limit: number; offset: number }
    ): Promise<any> => {
      try {
        const data = await followAPI.getFollowers(userId, limit, offset);
        return {
          total: data.total,
          items: data.items,
          limit,
          offset
        };
      } catch (error) {
        return handleAPIError(error);
      }
    },

    // Fetches paginated following list
    following: async (
      _parent: any,
      { userId, limit, offset }
    ): Promise<any> => {
      // Similar to followers
    },

    // Aggregates counts from two separate calls
    followCounts: async (
      _parent: any,
      { userId }: { userId: string }
    ): Promise<any> => {
      try {
        const [followersCount, followingCount] = await Promise.all([
          followAPI.getFollowerCount(userId),
          followAPI.getFollowingCount(userId)
        ]);
        return { followersCount, followingCount };
      } catch (error) {
        return handleAPIError(error);
      }
    },

    // Checks relationship status
    isFollowing: async (
      _parent: any,
      { followerId, followeeId }
    ): Promise<any> => {
      try {
        const isFollowing = await followAPI.isFollowing(followerId, followeeId);
        return { isFollowing };
      } catch (error) {
        return handleAPIError(error);
      }
    }
  },
  
  Mutation: {
    // Creates follow relationship
    follow: async (
      _parent: any,
      { followerId, followeeId }
    ): Promise<boolean> => {
      try {
        await followAPI.followUser(followerId, followeeId);
        return true;
      } catch (error) {
        return handleAPIError(error);
      }
    },

    // Removes follow relationship
    unfollow: async (
      _parent: any,
      { followerId, followeeId }
    ): Promise<boolean> => {
      try {
        await followAPI.unfollowUser(followerId, followeeId);
        return true;
      } catch (error) {
        return handleAPIError(error);
      }
    }
  }
};
```

---

## Data Source Implementation

### FollowServiceAPI Class

```typescript
export class FollowServiceAPI {
  private baseUrl: string;

  constructor(baseUrl: string = FOLLOW_SERVICE_URL) {
    this.baseUrl = baseUrl;
  }

  // Generic request method
  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    };

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Follow Service Error: ${error.message}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Specific methods for each endpoint
  async getUsers(): Promise<FollowServiceUser[]> {
    return this.request('GET', '/users');
  }

  async getFollowers(
    userId: string,
    limit: number,
    offset: number
  ): Promise<PaginatedResponse<FollowServiceUser>> {
    return this.request('GET', `/users/${userId}/followers?limit=${limit}&offset=${offset}`);
  }

  // ... other methods
}
```

---

## Error Handling

### Error Code Mapping

```typescript
export const handleAPIError = (error: unknown): never => {
  if (error instanceof Error) {
    const message = error.message;

    // Map specific error messages to codes
    const errorMap = {
      'Cannot follow yourself': 'SELF_FOLLOW',
      'Already following': 'DUPLICATE_FOLLOW',
      'User not found': 'USER_NOT_FOUND',
      'not found': 'NOT_FOUND'
    };

    for (const [pattern, code] of Object.entries(errorMap)) {
      if (message.includes(pattern)) {
        throw new APIError(message, error, code);
      }
    }

    throw new APIError(message, error, 'FOLLOW_SERVICE_ERROR');
  }

  throw new APIError('An unexpected error occurred', undefined, 'INTERNAL_SERVER_ERROR');
};
```

### Error Response Examples

**Client-facing error (no stack trace):**
```json
{
  "errors": [
    {
      "message": "User not found",
      "extensions": {
        "code": "USER_NOT_FOUND"
      }
    }
  ]
}
```

---

## Testing

### Running Tests

```bash
npm test
npm test:watch
npm test:coverage
```

### Test Structure

```typescript
// Tests for FollowServiceAPI
describe('FollowServiceAPI', () => {
  let api: FollowServiceAPI;

  beforeEach(() => {
    api = new FollowServiceAPI(MOCK_URL);
  });

  it('should fetch users', async () => {
    const users = await api.getUsers();
    expect(users).toEqual(expect.any(Array));
  });
});
```

---

## Docker Build & Run

### Build Docker Image

```bash
docker build -t graphql-gateway:latest .
```

### Run Container

```bash
docker run -p 4000:4000 \
  -e FOLLOW_SERVICE_URL="http://follow-service:3000/api/v1" \
  graphql-gateway:latest
```

### Docker Compose

```bash
docker compose up -d
```

---

## Development Tips

### Using GraphQL Playground

When running `npm run dev`, the GraphQL Playground is available at:
```
http://localhost:4000/graphql
```

Features:
- Write and test queries
- View schema documentation
- See real-time results

### IDE Setup

#### VS Code GraphQL Extension
Install: `apollographql.vscode-apollo`

Benefits:
- Syntax highlighting
- Schema validation
- Autocompletion

---

## Performance Optimization

### Query Batching

Execute multiple queries in one request:
```graphql
{
  users { id }
  followers(userId: "...") { total }
  following(userId: "...") { total }
}
```

### Caching Strategy

Future enhancement using Redis:
```typescript
const cache = new Map();

async function getCachedUsers() {
  if (cache.has('users')) {
    return cache.get('users');
  }
  
  const users = await followAPI.getUsers();
  cache.set('users', users);
  return users;
}
```

---

## Troubleshooting

### Can't Connect to Follow Service

```
Error: Failed to communicate with Follow Service
```

**Solution**: Ensure Follow Service is running:
```bash
cd ../follow-service
npm run dev
```

Verify `FOLLOW_SERVICE_URL` environment variable.

### Apollo Server Won't Start

```
Error: listen EADDRINUSE :::4000
```

**Solution**: Kill process on port 4000:
```bash
lsof -i :4000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

Or use different port:
```bash
PORT=4001 npm run dev
```

---

## Additional Resources

- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)
- [GraphQL Official Documentation](https://graphql.org/learn/)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [node-fetch Documentation](https://github.com/node-fetch/node-fetch)
