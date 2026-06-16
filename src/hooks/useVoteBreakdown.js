import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export const useVoteBreakdown = (
  competitionId,
  isAdvanced = false,
  topNumber = 0,
) => {
  return useQuery({
    queryKey: ['vote-breakdown', competitionId, isAdvanced, topNumber], // topNumber bekerült a kulcsba
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_vote_breakdown', {
        p_competition_id: competitionId,
        p_is_advanced: isAdvanced,
        p_top_number: topNumber, // 🌟 Átadjuk a top_number értékét
      });

      if (error) throw error;
      return data;
    },
    enabled: !!competitionId,
    retry: false,
  });
};
