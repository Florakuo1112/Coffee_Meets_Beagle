import { useMutation } from "@tanstack/react-query";
import { supabase } from "utils/supabaseClient";

const useInsertProfile = () => {
  return useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from("profiles").insert(data);
      if (error) throw error;
    },
    meta: { showGlobalLoading: true },
  });
};

const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      if (!id) throw new Error("無使用者 id");

      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    meta: { showGlobalLoading: true },
  });
};

const profileModulesQuery = {
  insertProfile: useInsertProfile,
  updateProfile: useUpdateProfile,
};

export default profileModulesQuery;
