import fetch from 'node-fetch';

export interface FollowServiceError {
  success: false;
  message: string;
  code: string;
}

export interface FollowServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface FollowServiceUser {
  id: string;
  username: string;
  displayName: string | null;
}

export interface PaginatedResponse<T> {
  total: number;
  items: T[];
}

const FOLLOW_SERVICE_URL = process.env.FOLLOW_SERVICE_URL || 'http://localhost:3000/api/v1';

export class FollowServiceAPI {
  private baseUrl: string;

  constructor(baseUrl: string = FOLLOW_SERVICE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const options: any = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const error = await response.json() as FollowServiceError;
        throw new Error(`Follow Service Error: ${error.message}`);
      }

      const data = await response.json() as FollowServiceResponse<T>;
      return data.data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to communicate with Follow Service');
    }
  }

  async followUser(followerId: string, followeeId: string): Promise<{ id: string }> {
    return this.request('POST', '/follows', {
      followerId,
      followeeId
    });
  }

  async unfollowUser(followerId: string, followeeId: string): Promise<void> {
    await this.request('DELETE', '/follows', {
      followerId,
      followeeId
    });
  }

  async getFollowers(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResponse<FollowServiceUser>> {
    return this.request(`GET`, `/users/${userId}/followers?limit=${limit}&offset=${offset}`);
  }

  async getFollowing(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResponse<FollowServiceUser>> {
    return this.request('GET', `/users/${userId}/following?limit=${limit}&offset=${offset}`);
  }

  async getUsers(): Promise<FollowServiceUser[]> {
    const response = await this.request<FollowServiceUser[]>('GET', '/users');
    return response || [];
  }

  async getFollowerCount(userId: string): Promise<number> {
    const response = await this.request<{ count: number }>('GET', `/users/${userId}/followers/count`);
    return response?.count || 0;
  }

  async getFollowingCount(userId: string): Promise<number> {
    const response = await this.request<{ count: number }>('GET', `/users/${userId}/following/count`);
    return response?.count || 0;
  }

  async isFollowing(followerId: string, followeeId: string): Promise<boolean> {
    const response = await this.request<{ isFollowing: boolean }>('GET', `/follows/check?followerId=${followerId}&followeeId=${followeeId}`);
    return response?.isFollowing || false;
  }
}

export const followAPI = new FollowServiceAPI();
