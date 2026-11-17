import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "utils/supabaseClient";
import { API_LONG_CACHE_TIME } from "constants";

const useSignInWithPassword = () => {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    meta: { showGlobalLoading: true },
  });
};

const useGetUserProfile = () => {
  return useQuery({
    queryKey: ["get", "userProfile"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("尚未登入");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    meta: { showGlobalLoading: true },
    staleTime: API_LONG_CACHE_TIME,
  });
};

const useSignUp = () => {
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    meta: { showGlobalLoading: true },
  });
};

const useSignOut = () => {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    meta: { showGlobalLoading: true },
  });
};

const useGetSession = () => {
  return useQuery({
    queryKey: ["get", "session"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    },
    meta: { showGlobalLoading: true },
    staleTime: API_LONG_CACHE_TIME,
  });
};

const useAuthQuery = {
  getUserProfile: useGetUserProfile,
  signInWithPassword: useSignInWithPassword,
  signUp: useSignUp,
  getSession: useGetSession,
  signOut: useSignOut,
};

export default useAuthQuery;
