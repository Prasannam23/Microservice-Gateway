import { followAPI } from '../dataSources/followAPI';
import { handleAPIError } from '../utils/errors';

export const resolvers = {
  Query: {
    health: (): string => 'ok',

    users: async (): Promise<any[]> => {
      try {
        return await followAPI.getUsers();
      } catch (error) {
        return handleAPIError(error);
      }
    },

    followers: async (
      parent: any,
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

    following: async (
      parent: any,
      { userId, limit, offset }: { userId: string; limit: number; offset: number }
    ): Promise<any> => {
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
      parent: any,
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

    isFollowing: async (
      parent: any,
      { followerId, followeeId }: { followerId: string; followeeId: string }
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
    follow: async (
      parent: any,
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
      parent: any,
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
