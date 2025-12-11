# GraphQL Query Examples

All queries can be tested in Apollo Studio at `http://localhost:4000/graphql`

## 1. Get All Users

**Query:**
```graphql
query GetAllUsers {
  users {
    id
    username
    displayName
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { users { id username displayName } }"
  }'
```

**Response:**
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
      },
      {
        "id": "33333333-3333-3333-3333-333333333333",
        "username": "charlie",
        "displayName": "Charlie"
      },
      {
        "id": "44444444-4444-4444-4444-444444444444",
        "username": "diana",
        "displayName": "Diana"
      },
      {
        "id": "55555555-5555-5555-5555-555555555555",
        "username": "eve",
        "displayName": "Eve"
      }
    ]
  }
}
```

---

## 2. Follow a User

**Mutation:**
```graphql
mutation FollowUser {
  follow(
    followerId: "11111111-1111-1111-1111-111111111111"
    followeeId: "22222222-2222-2222-2222-222222222222"
  )
}
```

**cURL:**
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { follow(followerId: \"11111111-1111-1111-1111-111111111111\", followeeId: \"22222222-2222-2222-2222-222222222222\") }"
  }'
```

**Success Response:**
```json
{
  "data": {
    "follow": true
  }
}
```

**Error Response (Self-Follow):**
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

**Error Response (Duplicate Follow):**
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

## 3. Unfollow a User

**Mutation:**
```graphql
mutation UnfollowUser {
  unfollow(
    followerId: "11111111-1111-1111-1111-111111111111"
    followeeId: "22222222-2222-2222-2222-222222222222"
  )
}
```

**cURL:**
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { unfollow(followerId: \"11111111-1111-1111-1111-111111111111\", followeeId: \"22222222-2222-2222-2222-222222222222\") }"
  }'
```

**Success Response:**
```json
{
  "data": {
    "unfollow": true
  }
}
```

---

## 4. Get Followers (with Pagination)

**Query:**
```graphql
query GetFollowers {
  followers(
    userId: "22222222-2222-2222-2222-222222222222"
    limit: 10
    offset: 0
  ) {
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

**cURL:**
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { followers(userId: \"22222222-2222-2222-2222-222222222222\", limit: 10, offset: 0) { total limit offset items { id username displayName } } }"
  }'
```

**Response:**
```json
{
  "data": {
    "followers": {
      "total": 2,
      "limit": 10,
      "offset": 0,
      "items": [
        {
          "id": "11111111-1111-1111-1111-111111111111",
          "username": "alice",
          "displayName": "Alice"
        },
        {
          "id": "33333333-3333-3333-3333-333333333333",
          "username": "charlie",
          "displayName": "Charlie"
        }
      ]
    }
  }
}
```

---

## 5. Get Following

**Query:**
```graphql
query GetFollowing {
  following(
    userId: "11111111-1111-1111-1111-111111111111"
    limit: 10
    offset: 0
  ) {
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

**Response:**
```json
{
  "data": {
    "following": {
      "total": 1,
      "limit": 10,
      "offset": 0,
      "items": [
        {
          "id": "22222222-2222-2222-2222-222222222222",
          "username": "bob",
          "displayName": "Bob"
        }
      ]
    }
  }
}
```

---

## 6. Get Follow Counts

**Query:**
```graphql
query GetFollowCounts {
  followCounts(userId: "11111111-1111-1111-1111-111111111111") {
    followersCount
    followingCount
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { followCounts(userId: \"11111111-1111-1111-1111-111111111111\") { followersCount followingCount } }"
  }'
```

**Response:**
```json
{
  "data": {
    "followCounts": {
      "followersCount": 1,
      "followingCount": 2
    }
  }
}
```

---

## 7. Check If Following

**Query:**
```graphql
query CheckIfFollowing {
  isFollowing(
    followerId: "11111111-1111-1111-1111-111111111111"
    followeeId: "22222222-2222-2222-2222-222222222222"
  ) {
    isFollowing
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { isFollowing(followerId: \"11111111-1111-1111-1111-111111111111\", followeeId: \"22222222-2222-2222-2222-222222222222\") { isFollowing } }"
  }'
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

## 8. Complex Query - User Profile with Stats

**Query:**
```graphql
query GetUserProfile {
  alice: followers(userId: "11111111-1111-1111-1111-111111111111", limit: 5) {
    total
    items {
      id
      username
    }
  }
  
  aliceFollowing: following(userId: "11111111-1111-1111-1111-111111111111", limit: 5) {
    total
    items {
      id
      username
    }
  }
  
  aliceCounts: followCounts(userId: "11111111-1111-1111-1111-111111111111") {
    followersCount
    followingCount
  }
  
  bobFollowing: following(userId: "22222222-2222-2222-2222-222222222222", limit: 5) {
    total
    items {
      id
      username
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "alice": {
      "total": 1,
      "items": [
        {
          "id": "33333333-3333-3333-3333-333333333333",
          "username": "charlie"
        }
      ]
    },
    "aliceFollowing": {
      "total": 1,
      "items": [
        {
          "id": "22222222-2222-2222-2222-222222222222",
          "username": "bob"
        }
      ]
    },
    "aliceCounts": {
      "followersCount": 1,
      "followingCount": 1
    },
    "bobFollowing": {
      "total": 0,
      "items": []
    }
  }
}
```

---

## 9. Full Flow - Create Follow Network

**Step 1: Follow User**
```graphql
mutation {
  follow(
    followerId: "11111111-1111-1111-1111-111111111111"
    followeeId: "22222222-2222-2222-2222-222222222222"
  )
}
```

**Step 2: Follow Another User**
```graphql
mutation {
  follow(
    followerId: "22222222-2222-2222-2222-222222222222"
    followeeId: "33333333-3333-3333-3333-333333333333"
  )
}
```

**Step 3: Check Network**
```graphql
query {
  users {
    id
    username
  }
  
  aliceFollowers: followers(userId: "11111111-1111-1111-1111-111111111111") {
    total
  }
  
  bobFollowers: followers(userId: "22222222-2222-2222-2222-222222222222") {
    total
    items {
      username
    }
  }
}
```

---

## 10. Error Scenarios

### Self-Follow Error
```graphql
mutation {
  follow(
    followerId: "11111111-1111-1111-1111-111111111111"
    followeeId: "11111111-1111-1111-1111-111111111111"
  )
}
```

Response:
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

### Invalid User ID
```graphql
query {
  followers(userId: "invalid-uuid") {
    total
    items {
      id
    }
  }
}
```

Response:
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

## Testing with Postman/Insomnia

### Follow User Request
```
POST http://localhost:4000/graphql
Content-Type: application/json

{
  "query": "mutation { follow(followerId: \"11111111-1111-1111-1111-111111111111\", followeeId: \"22222222-2222-2222-2222-222222222222\") }"
}
```

### Get Followers Request
```
POST http://localhost:4000/graphql
Content-Type: application/json

{
  "query": "query { followers(userId: \"22222222-2222-2222-2222-222222222222\", limit: 10) { total items { id username displayName } } }"
}
```

---

## User IDs for Testing

- **Alice**: `11111111-1111-1111-1111-111111111111`
- **Bob**: `22222222-2222-2222-2222-222222222222`
- **Charlie**: `33333333-3333-3333-3333-333333333333`
- **Diana**: `44444444-4444-4444-4444-444444444444`
- **Eve**: `55555555-5555-5555-5555-555555555555`

---

## Health Check

```graphql
query {
  health
}
```

Response:
```json
{
  "data": {
    "health": "ok"
  }
}
```
