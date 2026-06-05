import { useRef, useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useActiveCompetition } from '../../hooks/useActiveCompetition';
import { useFinalizedVote } from '../../hooks/useFinalizedVote';
import { usePerformancesForPerformer } from '../../hooks/usePerformancesForPerformer';
import { useNavigate } from 'react-router-dom';

import { Sequence, Spinner } from '../../components';
import PasswordStep from './PasswordStep';
import SelectUserStep from './SelectUserStep';

const LoginPage = () => {
  const seqRef = useRef();
  const [competition, setCompetition] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();

  const { data: finalizedVote, isLoading: finalizedVoteLoading } =
    useFinalizedVote({
      userId: user?.user_id,
      competitionId: user?.competition_id,
    });

  const { data: performances = [], isLoading: perfLoading } =
    usePerformancesForPerformer(user?.user_id, user?.competition_id);

  const { data: activeComp, isLoading: activeCompLoading } =
    useActiveCompetition();

  useEffect(() => {
    if (activeComp && !competition) {
      setCompetition(activeComp);
    }
  }, [activeComp, competition]);

  const handlePasswordSuccess = (competition) => {
    setCompetition(competition);
    seqRef.current?.slideNext();
  };

  const handlePostLoginRedirect = () => {
    const targetCompId = competition?.id || user?.competition_id;
    const roles = user.roles?.find((r) => r.competition_id === targetCompId);

    if (finalizedVote && !roles?.is_jury) return navigate('/thanks');
    if (finalizedVote && roles?.is_jury) return navigate('/results');

    const hasVotingStarted = competition?.voting_started;
    if (hasVotingStarted) {
      if (roles?.is_voter) {
        return navigate('/vote');
      } else if (roles?.is_jury) {
        return navigate('/results');
      }
    }

    if (roles?.is_performer) {
      const hasConfirmedSong = performances.some((p) => p.selected);
      if (hasConfirmedSong) {
        return navigate('/wait-room');
      }
      return navigate('/songChoose');
    }

    if (roles?.is_voter || roles?.is_jury) return navigate('/wait-room');
  };

  useEffect(() => {
    if (user && !finalizedVoteLoading && !perfLoading) {
      handlePostLoginRedirect();
    }
  }, [user, performances, finalizedVoteLoading, perfLoading, competition]);

  if (user && (finalizedVoteLoading || perfLoading)) {
    return <Spinner />;
  }

  return (
    <Sequence ref={seqRef}>
      {/* Password screen */}
      <div className='flex flex-column gap-24 flex-align-center'>
        <PasswordStep onSuccess={handlePasswordSuccess} />
      </div>

      {/* User select screen */}
      <div className='flex flex-column gap-24 flex-align-center h-100 ofy-hidden'>
        {competition && <SelectUserStep competition={competition} />}
      </div>
    </Sequence>
  );
};

export default LoginPage;
