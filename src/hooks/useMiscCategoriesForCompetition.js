import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export const useMiscCategoriesForCompetition = (competitionId) => {
  return useQuery({
    queryKey: ["misc-categories", competitionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_has_misc_category')
        .select('misc_categories(id, name, question)')
        .eq('competition_id', competitionId);
      console.log('db called for misc_categories');
      if (error) throw new Error(error.message);
      return data.map((entry) => entry.misc_categories);
    },
    enabled: !!competitionId,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};