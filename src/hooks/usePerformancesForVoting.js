import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export const usePerformancesForVoting = (competitionId, excludePerformerId) => {
  return useQuery({
    queryKey: ["performances_for_voting", competitionId, excludePerformerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performances')
        .select('id, performer_id, songs(title, artist), people(name, avatar)')
        .eq('competition_id', competitionId)
        .eq('selected', true)
        .neq('performer_id', excludePerformerId);
      console.log('db called for performances for voting');
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!competitionId && !! excludePerformerId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 0,
    cacheTime: 0,
  });
};