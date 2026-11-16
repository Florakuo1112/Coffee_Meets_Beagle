import { useQuery } from "@tanstack/react-query";
import { supabase } from "utils/supabaseClient";

export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;

export const API_LONG_CACHE_TIME = 10 * MINUTE;
export const API_SHORT_CACHE_TIME = 5 * SECOND;

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

const useUserProfileQuery = {
  getUserProfile: useGetUserProfile,
};

export default useUserProfileQuery;
