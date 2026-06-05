import { useState, useRef, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { usePerformancesForVoting } from '../../hooks/usePerformancesForVoting';
import { useMiscCategoriesForCompetition } from '../../hooks/useMiscCategoriesForCompetition';
import { useActiveCompetition } from '../../hooks/useActiveCompetition';
import { useSubmitVote } from '../../hooks/useSubmitVote';

import { Sequence, Spinner } from '../../components';
import {
  RankPerformersStep,
  ReviewVoteStep,
  SelectPerformersStep,
  VoteMiscStep,
} from './steps';

const Vote = () => {
  const seqRef = useRef();
  const { user } = useUser();
  const userId = user?.user_id;
  const competitionId = user?.competition_id;

  // --- User-Scoped Storage Keys ---
  const SEL_KEY = `user_${userId}_vote_selected`;
  const RANK_KEY = `user_${userId}_vote_rankings`;
  const MISC_KEY = `user_${userId}_vote_misc`;
  const STEP_KEY = `user_${userId}_vote_step_index`;

  // --- State Initializations ---
  const [selectedPerformers, setSelectedPerformers] = useState(() => {
    const saved = localStorage.getItem(SEL_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [rankingEntries, setRankingEntries] = useState(() => {
    const saved = localStorage.getItem(RANK_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [miscVotes, setMiscVotes] = useState(() => {
    const saved = localStorage.getItem(MISC_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const { submitVote } = useSubmitVote();
  const { data: performances = [], isLoading: perfLoading } =
    usePerformancesForVoting(competitionId, userId);
  const { data: miscCategories = [] } =
    useMiscCategoriesForCompetition(competitionId);
  const { data: competition } = useActiveCompetition();
  const topNumber = competition?.top_number;

  // --- Restore Swiper Position on Mount ---
  useEffect(() => {
    if (!perfLoading && seqRef.current) {
      const savedStep = localStorage.getItem(STEP_KEY);
      if (savedStep) {
        // Delay slightly to give Swiper time to render internal frames fully
        setTimeout(() => {
          seqRef.current?.slideTo(parseInt(savedStep, 10), 0);
        }, 100);
      }
    }
  }, [perfLoading]);

  // --- Auto-Save Values Effect Loop ---
  useEffect(() => {
    if (!userId) return;
    localStorage.setItem(SEL_KEY, JSON.stringify(selectedPerformers));
    localStorage.setItem(RANK_KEY, JSON.stringify(rankingEntries));
    localStorage.setItem(MISC_KEY, JSON.stringify(miscVotes));
  }, [selectedPerformers, rankingEntries, miscVotes, userId]);

  if (!user || perfLoading) return <Spinner />;

  // --- Track Swiper Sliding Events ---
  const handleSlideChange = (swiper) => {
    if (userId) {
      localStorage.setItem(STEP_KEY, swiper.activeIndex);
    }
  };

  const handlePerformersSelected = (ids) => {
    setSelectedPerformers(ids);
    seqRef.current?.slideNext();
  };

  const handleRankConfirmed = (rankedPerformers) => {
    const ranking = rankedPerformers.map((p, index) => ({
      performance_id: p.id,
      rank: index + 1,
    }));
    setRankingEntries(ranking);
    seqRef.current?.slideNext();
  };

  const handleMiscVote = (categoryId, performanceId) => {
    setMiscVotes((prev) => ({ ...prev, [categoryId]: performanceId }));
  };

  const handleVoteSubmit = async () => {
    try {
      const success = await submitVote({
        competitionId: user.competition_id,
        rankings: rankingEntries,
        miscVotes: miscVotes,
      });

      if (success) {
        localStorage.removeItem(SEL_KEY);
        localStorage.removeItem(RANK_KEY);
        localStorage.removeItem(MISC_KEY);
        localStorage.removeItem(STEP_KEY); // Clean up swiper memory
      }
    } catch (err) {
      console.error('Submitting vote was unsuccessful:', err.message);
    }
  };

  return (
    <Sequence ref={seqRef} onSlideChange={handleSlideChange}>
      {/* Step 1: select top performers */}
      <div className='flex flex-column gap-24 flex-align-center h-100 ofy-hidden w-100'>
        <SelectPerformersStep
          performances={performances}
          max={topNumber}
          selected={selectedPerformers}
          onConfirm={handlePerformersSelected}
          userId={userId}
        />
      </div>

      {/* Step 2: Rank Selected Performers */}
      <div className='flex flex-column gap-24 flex-align-center h-100 ofy-hidden w-100'>
        <RankPerformersStep
          performances={performances}
          performers={selectedPerformers}
          onBack={() => seqRef.current?.slidePrev()}
          onConfirm={handleRankConfirmed}
        />
      </div>

      {/* Step 3+: Misc Category Voting */}
      {miscCategories?.map((cat, index) => (
        <div
          key={cat.id}
          className='flex flex-column gap-24 flex-align-center h-100 ofy-hidden w-100'
        >
          <VoteMiscStep
            category={cat}
            performances={performances}
            selected={miscVotes[cat.id]}
            onSelect={(id) => handleMiscVote(cat.id, id)}
            onConfirm={() => seqRef.current?.slideNext()}
            onBack={() => seqRef.current?.slidePrev()}
            userId={userId}
          />
        </div>
      ))}

      {/* Step 4: Final Review */}
      <div className='flex flex-column gap-24 flex-align-center h-100 ofy-hidden w-100'>
        <ReviewVoteStep
          rankings={rankingEntries}
          miscVotes={miscVotes}
          performances={performances}
          categories={miscCategories}
          onSubmit={handleVoteSubmit}
          onBack={() => seqRef.current?.slidePrev()}
        />
      </div>
    </Sequence>
  );
};

export default Vote;
