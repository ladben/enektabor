import { supabase } from "../lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";

export const useFinalizedVote = ({ userId, competitionId }) => {
  return useQuery({
    queryKey: ['finalized-vote', userId, competitionId],
    queryFn: async () => {
      if (!userId || !competitionId) return null;
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', userId)
        .eq('competition_id', competitionId)
        .eq('finalized', true)
        .single();

      if (error && error.code !== 'PGRST116') throw new Error(error.message);
      return data;
    },
    enabled: !!userId && !!competitionId,
  });
};