import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useProfileDisplay } from '../../context/ProfileDisplayContext';
import { usePerformancesForVoting } from '../../hooks/usePerformancesForVoting';
import { useMiscCategoriesForCompetition } from '../../hooks/useMiscCategoriesForCompetition';
import {
  Title,
  Subtitle,
  GridFlow,
  Avatar,
  ProfileDisplayFlip,
  Spinner,
  Button,
} from '../../components';
import PerformerDetailDrawer from './PerformerDetailDrawer';
import { supabase } from '../../lib/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';

const WaitRoom = () => {
  const { user } = useUser();
  const { profileDisplay } = useProfileDisplay();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPerformer, setSelectedPerformer] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  const currentCompId = user?.competition_id;
  const userRoles = user?.roles?.find(
    (r) => r.competition_id === currentCompId,
  );
  const isJury = !!userRoles?.is_jury;
  const isVoter = !!userRoles?.is_voter;

  const {
    data: performances = [],
    isLoading: perfLoading,
    refetch: refetchPerformances,
  } = usePerformancesForVoting(user?.competition_id, user?.user_id);
  const { data: categories = [] } = useMiscCategoriesForCompetition(
    user?.competition_id,
  );

  // --- 1. Real-time csatorna a verseny indításához és az élő dalválasztásokhoz ---
  useEffect(() => {
    if (!user) return navigate('/');

    // Csatorna a verseny státuszának figyeléséhez (Voting elindítása)
    const compChannel = supabase
      .channel('competition-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'competitions',
          filter: `id=eq.${currentCompId}`,
        },
        (payload) => {
          if (payload.new && payload.new.voting_started) {
            if (isVoter) {
              navigate('/vote');
            } else if (isJury) {
              navigate('/results');
            }
          }
        },
      )
      .subscribe();

    // 🌟 ÚJ REAL-TIME CSATORNA: Ha valaki dalt választ, azonnal frissítjük a listát, így élőben kiszínesedik az ikonja!
    const perfChannel = supabase
      .channel('live-performances-selection')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'performances',
          filter: `competition_id=eq.${currentCompId}`,
        },
        () => {
          refetchPerformances();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(compChannel);
      supabase.removeChannel(perfChannel);
    };
  }, [user, currentCompId, isVoter, isJury, navigate, refetchPerformances]);

  // --- 2. 🌟 CSOPORTOSÍTÁSI LOGIKA: Egy énekes csak egyszer jelenhet meg ---
  const uniquePerformers = useMemo(() => {
    const grouped = {};

    performances.forEach((perf) => {
      const userId = perf.performer_id;

      // Csoportosítás: Ha még nem láttuk, vagy ez az aktívan kiválasztott dala
      if (!grouped[userId] || perf.selected) {
        grouped[userId] = perf;
      }
    });

    // Tömbbe rendezzük a csoportosított elemeket
    const performersArray = Object.values(grouped);

    // Élő rendezés a személy neve alapján, a magyar ábécé szabályai szerint
    return performersArray.sort((a, b) => {
      const nameA = a.people?.name || '';
      const nameB = b.people?.name || '';
      return nameA.localeCompare(nameB, 'hu');
    });
  }, [performances]);

  const handleStartVoting = async () => {
    setIsStarting(true);
    const { error } = await supabase
      .from('competitions')
      .update({ voting_started: true })
      .eq('id', currentCompId);

    if (error) {
      console.error('Failed to start voting room session:', error.message);
      setIsStarting(false);
      return;
    }
  };

  if (!user || perfLoading || !profileDisplay) return <Spinner />;

  return (
    <div className='flex flex-column gap-24 flex-align-center w-100 h-100 ofy-hidden pos-rel pb-112'>
      <div className='flex flex-column flex-align-center w-100'>
        <Title text='Chill zone' />
        <Subtitle text='Koppints, és jegyzetelj, amíg el nem kezdődik a szavazás' />
      </div>

      <GridFlow>
        <div
          style={{ maxWidth: 'calc((100% - 30px) / 4)' }}
          className='w-100 ar-square'
        >
          <ProfileDisplayFlip />
        </div>

        {/* 🌟 Most már a letisztított, egyedi énekesek listáján futunk végig */}
        {uniquePerformers.map((p) => {
          const hasSelectedSong = p.selected && p.songs;

          return (
            <div
              key={p.performer_id} // p.id helyeről p.performer_id-ra cserélve a konzolos kulcs-ütközések elkerülésére
              className='w-100 ar-square'
              style={{ maxWidth: 'calc((100% - 30px) / 4)' }}
              onClick={() => hasSelectedSong && setSelectedPerformer(p)}
            >
              <Avatar
                imgSrc={p.people.avatar}
                imgName={p.people.name}
                // Ha van kiválasztott dala, rendes színű (default), ha nincs, akkor halvány (faded)
                state={hasSelectedSong ? 'default' : 'faded'}
                display={profileDisplay.icon}
              />
            </div>
          );
        })}
      </GridFlow>

      {isJury && (
        <Button
          text={isStarting ? 'Indítás...' : 'Szavazás indítása'}
          onClick={handleStartVoting}
          disabled={isStarting}
          className='pos-abs b-0 m-auto l-0 r-0 mb-32'
        />
      )}

      <PerformerDetailDrawer
        performer={selectedPerformer}
        categories={categories}
        onClose={() => setSelectedPerformer(null)}
      />
    </div>
  );
};

export default WaitRoom;
