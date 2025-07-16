import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export const useVoteBreakdown = (competitionId) => {
  return useQuery({
    queryKey: ['vote-breakdown', competitionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_vote_breakdown', { p_competition_id: competitionId});

      if (error) throw error;

      return data;
    },
    enabled: !!competitionId,
    retry: false,
  });
};