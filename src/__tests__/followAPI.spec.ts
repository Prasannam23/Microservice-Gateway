import { FollowServiceAPI } from '../dataSources/followAPI';

jest.mock('node-fetch');

describe('FollowServiceAPI', () => {
  let api: FollowServiceAPI;

  beforeEach(() => {
    api = new FollowServiceAPI('http://localhost:3000/api/v1');
    jest.clearAllMocks();
  });

  describe('followUser', () => {
    it('should successfully follow a user', async () => {
      const mockFetch = jest.requireMock('node-fetch');
      mockFetch.default = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: 'follow-1' }
        })
      });

      const result = await api.followUser('user1', 'user2');
      expect(result.id).toBe('follow-1');
    });

    it('should handle follow service errors', async () => {
      const mockFetch = jest.requireMock('node-fetch');
      mockFetch.default = jest.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Cannot follow yourself',
          code: 'SELF_FOLLOW'
        })
      });

      await expect(api.followUser('user1', 'user1')).rejects.toThrow();
    });
  });

  describe('getFollowers', () => {
    it('should retrieve followers with pagination', async () => {
      const mockFetch = jest.requireMock('node-fetch');
      mockFetch.default = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            total: 2,
            items: [
              { id: 'user1', username: 'alice', displayName: 'Alice' },
              { id: 'user2', username: 'bob', displayName: 'Bob' }
            ]
          }
        })
      });

      const result = await api.getFollowers('user3', 20, 0);
      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
    });
  });

  describe('isFollowing', () => {
    it('should check if user is following another user', async () => {
      const mockFetch = jest.requireMock('node-fetch');
      mockFetch.default = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { isFollowing: true }
        })
      });

      const result = await api.isFollowing('user1', 'user2');
      expect(result).toBe(true);
    });
  });
});
