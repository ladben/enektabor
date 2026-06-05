import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!user) return navigate('/');

    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentCompId, isVoter, navigate]);

  const { data: performances = [], isLoading: perfLoading } =
    usePerformancesForVoting(user?.competition_id, user?.user_id);
  const { data: categories = [] } = useMiscCategoriesForCompetition(
    user?.competition_id,
  );

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
        {performances.map((p) => (
          <div
            key={p.id}
            className='w-100 ar-square'
            style={{ maxWidth: 'calc((100% - 30px) / 4)' }}
            onClick={() => p.selected && setSelectedPerformer(p)}
          >
            <Avatar
              imgSrc={p.people.avatar}
              imgName={p.people.name}
              state={p.selected ? 'default' : 'faded'}
              display={profileDisplay.icon}
            />
          </div>
        ))}
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
