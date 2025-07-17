import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export const useActiveCompetition = () => {
  return useQuery({
    queryKey: ['active-competition'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('is_active', true)
        .single();
      console.log('db called for competition');
      if (error || !data) throw new Error('No active competitions found');
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 0,
    cacheTime: 0,
    retry: false,
  });
};