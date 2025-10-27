"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";

export interface User {
  id: string;
  email: string;
  name?: string;
}

export function useUserProfile() {
  // Query to check if user is authenticated
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await AuthService.getMe();
      return response as User;
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      await AuthService.signOut();
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
    onSuccess: () => {
      window.location.href = "/sign-in";
    },
  });

  const handleSignOut = async () => {
    try {
      await signOutMutation.mutateAsync();
    } catch (err) {
      // Error is handled in the hook
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isError,
    signOut: handleSignOut,
  };
}
