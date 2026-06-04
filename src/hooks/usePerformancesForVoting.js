import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export const usePerformancesForVoting = (competitionId, excludePerformerId) => {
  const queryClient = useQueryClient();
  const queryKey = [
    'performances_for_voting',
    competitionId,
    excludePerformerId,
  ];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!competitionId) return [];

      const { data, error } = await supabase
        .from('performances')
        .select(
          'id, performer_id, selected, songs(title, artist), people(name, avatar)',
        )
        .eq('competition_id', competitionId)
        .neq('performer_id', excludePerformerId); // Kept to exclude self safely

      console.log('db called for performances for wait-room');
      if (error) throw new Error(error.message);
      return [...data].sort((a, b) => {
        const nameA = a.people?.name || '';
        const nameB = b.people?.name || '';
        return nameA.localeCompare(nameB, 'hu'); // Added Hungarian locale support for proper accent sorting
      });
    },
    enabled: !!competitionId && excludePerformerId !== undefined,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  // This handles the live reactive part when a performer locks in their song
  useEffect(() => {
    const channel = supabase
      .channel('waitroom-perf-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'performances' },
        () => {
          // Instantly forces TanStack query to fetch the updated selection status
          queryClient.invalidateQueries({ queryKey });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, queryKey]);

  return query;
};
