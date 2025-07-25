import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export const usePeople = (competitionId) => {
  return useQuery({
    queryKey: ['people', competitionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_participants')
        .select('user_id, is_voter, is_jury, is_performer, people(name, avatar)')
        .eq('competition_id', competitionId);
      console.log('db called for people');
      if (error) throw new Error(error.message);
      console.log('db called for people, returned: ', data);
      return [...data].sort((a, b) =>
        a.people.name.localeCompare(b.people.name)
      );
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 0,
    cacheTime: 0,
  });
};