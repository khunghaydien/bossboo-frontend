import { publicFetchClient, fetchClient } from ".";

// Authentication service functions
export class AuthService {
  static async signUp(userData: { email: string; password: string }) {
    try {
      const response = await publicFetchClient<any>("/auth/sign-up", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async signIn(userData: { email: string; password: string }) {
    try {
      const response = await publicFetchClient<any>("/auth/sign-in", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async googleSignIn() {
    try {
      const response = await publicFetchClient<any>("/auth/google/url", {
        method: "GET",
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async facebookSignIn() {
    try {
      const response = await publicFetchClient<any>("/auth/facebook/url", {
        method: "GET",
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async forgotPassword(email: string) {
    try {
      const response = await publicFetchClient<any>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }) {
    try {
      const response = await publicFetchClient<any>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async signOut() {
    try {
      const response = await fetchClient<any>("/auth/sign-out", {
        method: "POST",
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getMe() {
    try {
      const response = await fetchClient<any>("/auth/me", {
        method: "GET",
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async refreshToken() {
    try {
      const response = await fetchClient<any>("/auth/refresh", {
        method: "POST",
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
