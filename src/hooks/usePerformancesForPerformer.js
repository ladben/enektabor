import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export const usePerformancesForPerformer = (userId, competitionId) => {
  return useQuery({
    queryKey: ['performances', userId, competitionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performances')
        .select('id, selected, songs(id, artist, title)')
        .eq('performer_id', userId)
        .eq('competition_id', competitionId);
      console.log('db called for performances');
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!userId && !!competitionId,
    refetchOnMount: true,
    staleTime: 100,
  });
};