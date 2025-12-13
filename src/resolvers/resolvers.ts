import { followAPI, FollowServiceUser } from '../dataSources/followAPI';
import { handleAPIError } from '../utils/errors';

export const resolvers = {
  Query: {
    health: (): string => 'ok',

    users: async (): Promise<FollowServiceUser[]> => {
      try {
        return await followAPI.getUsers();
      } catch (error) {
        return handleAPIError(error);
      }
    },

    followers: async (
      _parent: unknown,
      { userId, limit, offset }: { userId: string; limit: number; offset: number }
    ): Promise<{ total: number; items: FollowServiceUser[]; limit: number; offset: number }> => {
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

    following: async (
      _parent: unknown,
      { userId, limit, offset }: { userId: string; limit: number; offset: number }
    ): Promise<{ total: number; items: FollowServiceUser[]; limit: number; offset: number }> => {
      try {
        const data = await followAPI.getFollowing(userId, limit, offset);
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

    followCounts: async (
      _parent: unknown,
      { userId }: { userId: string }
    ): Promise<{ followersCount: number; followingCount: number }> => {
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

    isFollowing: async (
      _parent: unknown,
      { followerId, followeeId }: { followerId: string; followeeId: string }
    ): Promise<{ isFollowing: boolean }> => {
      try {
        const isFollowing = await followAPI.isFollowing(followerId, followeeId);
        return { isFollowing };
      } catch (error) {
        return handleAPIError(error);
      }
    }
  },

  Mutation: {
    follow: async (
      _parent: unknown,
      { followerId, followeeId }: { followerId: string; followeeId: string }
    ): Promise<boolean> => {
      try {
        await followAPI.followUser(followerId, followeeId);
        return true;
      } catch (error) {
        return handleAPIError(error);
      }
    },

    unfollow: async (
      _parent: unknown,
      { followerId, followeeId }: { followerId: string; followeeId: string }
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
