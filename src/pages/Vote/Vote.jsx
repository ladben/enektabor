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

  // --- Storage Keys ---
  const SEL_KEY = `user_${userId}_vote_selected`;
  const RANK_KEY = `user_${userId}_vote_rankings`;
  const MISC_KEY = `user_${userId}_vote_misc`;
  const STEP_KEY = `user_${userId}_vote_step_index`;
  const SEEN_REVIEW_KEY = `user_${userId}_has_seen_review`; // Scoped seen flag storage key

  // --- States ---
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

  // Keep track of whether the user has reached the final screen yet
  const [hasSeenReview, setHasSeenReview] = useState(() => {
    return localStorage.getItem(SEEN_REVIEW_KEY) === 'true';
  });

  const { submitVote } = useSubmitVote();
  const { data: performances = [], isLoading: perfLoading } =
    usePerformancesForVoting(competitionId, userId);
  const { data: miscCategories = [] } =
    useMiscCategoriesForCompetition(competitionId);
  const { data: competition } = useActiveCompetition();
  const topNumber = competition?.top_number;

  // Calculate the total number of steps to know where the final Review screen sits
  // Step 0: Select, Step 1: Rank, Step 2 to (2 + categories.length - 1): Misc, Final: Review
  const reviewStepIndex = 2 + (miscCategories?.length || 0);

  // Restore Swiper Position on Mount
  useEffect(() => {
    if (!perfLoading && seqRef.current) {
      const savedStep = localStorage.getItem(STEP_KEY);
      if (savedStep) {
        setTimeout(() => {
          seqRef.current?.slideTo(parseInt(savedStep, 10), 0);
        }, 100);
      }
    }
  }, [perfLoading]);

  // Auto-Save Effect
  useEffect(() => {
    if (!userId) return;
    localStorage.setItem(SEL_KEY, JSON.stringify(selectedPerformers));
    localStorage.setItem(RANK_KEY, JSON.stringify(rankingEntries));
    localStorage.setItem(MISC_KEY, JSON.stringify(miscVotes));
  }, [selectedPerformers, rankingEntries, miscVotes, userId]);

  if (!user || perfLoading) return <Spinner />;

  // Monitor swiper sliding shifts to catch when they land on the review slide
  const handleSlideChange = (swiper) => {
    if (!userId) return;
    localStorage.setItem(STEP_KEY, swiper.activeIndex);

    if (swiper.activeIndex === reviewStepIndex) {
      setHasSeenReview(true);
      localStorage.setItem(SEEN_REVIEW_KEY, 'true');
    }
  };

  const handleFastForwardToReview = () => {
    seqRef.current?.slideTo(reviewStepIndex);
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
        localStorage.removeItem(STEP_KEY);
        localStorage.removeItem(SEEN_REVIEW_KEY);
      }
    } catch (err) {
      console.error('Submitting vote was unsuccessful:', err.message);
    }
  };

  return (
    <Sequence ref={seqRef} onSlideChange={handleSlideChange}>
      {/* Step 1: Select top performers */}
      <div className='flex flex-column gap-24 flex-align-center h-100 ofy-hidden w-100'>
        <SelectPerformersStep
          performances={performances}
          max={topNumber}
          selected={selectedPerformers}
          onConfirm={(ids) => {
            setSelectedPerformers(ids);
            seqRef.current?.slideNext();
          }}
          userId={userId}
        />
      </div>

      {/* Step 2: Rank Selected Performers */}
      <div className='flex flex-column gap-24 flex-align-center h-100 ofy-hidden w-100'>
        <RankPerformersStep
          performances={performances}
          performers={selectedPerformers}
          rankingEntries={rankingEntries}
          hasSeenReview={hasSeenReview}
          onFastForward={handleFastForwardToReview}
          onBack={() => seqRef.current?.slidePrev()}
          onRankChange={(updatedRankedList) => {
            const ranking = updatedRankedList.map((p, index) => ({
              performance_id: p.id,
              rank: index + 1,
            }));
            setRankingEntries(ranking);
          }}
          onConfirm={(rankedList) => seqRef.current?.slideNext()}
        />
      </div>

      {/* Step 3+: Misc Category Voting Loops */}
      {miscCategories?.map((cat, index) => (
        <div
          key={cat.id}
          className='flex flex-column gap-24 flex-align-center h-100 ofy-hidden w-100'
        >
          <VoteMiscStep
            category={cat}
            performances={performances}
            selected={miscVotes[cat.id]}
            hasSeenReview={hasSeenReview}
            onFastForward={handleFastForwardToReview}
            onSelect={(id) =>
              setMiscVotes((prev) => ({ ...prev, [cat.id]: id }))
            }
            onConfirm={() => seqRef.current?.slideNext()}
            onBack={() => seqRef.current?.slidePrev()}
            userId={userId}
          />
        </div>
      ))}

      {/* Step 4: Final Review Summary Page */}
      <div className='flex flex-column gap-24 flex-align-center h-100 ofy-hidden w-100'>
        <ReviewVoteStep
          rankings={rankingEntries}
          miscVotes={miscVotes}
          performances={performances}
          categories={miscCategories}
          onSubmit={handleVoteSubmit}
          onBack={() => seqRef.current?.slidePrev()}
          onJumpToStep={(slideIndex) => seqRef.current?.slideTo(slideIndex)}
        />
      </div>
    </Sequence>
  );
};

export default Vote;
