import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "utils/supabaseClient";

const useInsertPet = () => {
  return useMutation({
    mutationFn: async ({ foster_id, ...data }) => {
      if (!foster_id) throw new Error("無 foster id");
      const { error } = await supabase
        .from("pets_information")
        .insert({ foster_id, ...data });

      if (error) throw error;
    },
    meta: { showGlobalLoading: true },
  });
};

const useGetPetsByFosterId = (fosterId) => {
  return useQuery({
    queryKey: ["get", "pets", fosterId],
    queryFn: async () => {
      if (!fosterId) throw new Error("無 foster id");

      const { data, error } = await supabase
        .from("pets_information")
        .select("*")
        .eq("foster_id", fosterId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: Boolean(fosterId),
    meta: { showGlobalLoading: true },
  });
};

const petsModulesQuery = {
  insertPet: useInsertPet,
  getPetsByFosterId: useGetPetsByFosterId,
};

export default petsModulesQuery;
