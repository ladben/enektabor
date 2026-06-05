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

// 12-hour shelf-life duration setup (matching your user context duration token)
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

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
  const SEEN_REVIEW_KEY = `user_${userId}_has_seen_review`;

  // --- 🌟 EXPIRATION GUARD HELPER FUNCTION 🌟 ---
  // Reads item and instantly garbage-collects it if its 12h limit has passed
  const getInitialValueWithExpiry = (storageKey, defaultValue) => {
    const rawData = localStorage.getItem(storageKey);
    if (!rawData) return defaultValue;

    try {
      const parsed = JSON.parse(rawData);

      // If the record has our timestamp wrapper structure, validate it!
      if (parsed && typeof parsed === 'object' && 'exp' in parsed) {
        if (Date.now() > parsed.exp) {
          localStorage.removeItem(storageKey); // ❌ Expired data found -> Wipe it out!
          console.log(`🧹 Stale storage wiped cleanly: ${storageKey}`);
          return defaultValue;
        }
        return parsed.value; // Data is fresh, use it!
      }

      // Fallback for legacy records that don't have an expiration wrapper yet
      return parsed;
    } catch (e) {
      return defaultValue;
    }
  };

  // --- States (Using our expiry evaluation helper wrapper) ---
  const [selectedPerformers, setSelectedPerformers] = useState(() => {
    return getInitialValueWithExpiry(SEL_KEY, []);
  });

  const [rankingEntries, setRankingEntries] = useState(() => {
    return getInitialValueWithExpiry(RANK_KEY, []);
  });

  const [miscVotes, setMiscVotes] = useState(() => {
    return getInitialValueWithExpiry(MISC_KEY, {});
  });

  const [hasSeenReview, setHasSeenReview] = useState(() => {
    return getInitialValueWithExpiry(SEEN_REVIEW_KEY, false);
  });

  const { submitVote } = useSubmitVote();
  const { data: performances = [], isLoading: perfLoading } =
    usePerformancesForVoting(competitionId, userId);
  const { data: miscCategories = [] } =
    useMiscCategoriesForCompetition(competitionId);
  const { data: competition } = useActiveCompetition();
  const topNumber = competition?.top_number;

  const reviewStepIndex = 2 + (miscCategories?.length || 0);

  // Restore Swiper Position on Mount with Expiration evaluation built-in
  useEffect(() => {
    if (!perfLoading && seqRef.current) {
      const savedStep = getInitialValueWithExpiry(STEP_KEY, null);
      if (savedStep !== null) {
        setTimeout(() => {
          seqRef.current?.slideTo(parseInt(savedStep, 10), 0);
        }, 100);
      }
    }
  }, [perfLoading]);

  // --- 🌟 AUTO-SAVE EFFECT WITH TIMESTAMP PACKAGING 🌟 ---
  useEffect(() => {
    if (!userId) return;

    const expirationTime = Date.now() + SESSION_DURATION_MS;

    const saveWithExpiry = (key, dataValue) => {
      const wrapper = {
        value: dataValue,
        exp: expirationTime,
      };
      localStorage.setItem(key, JSON.stringify(wrapper));
    };

    saveWithExpiry(SEL_KEY, selectedPerformers);
    saveWithExpiry(RANK_KEY, rankingEntries);
    saveWithExpiry(MISC_KEY, miscVotes);
  }, [selectedPerformers, rankingEntries, miscVotes, userId]);

  useEffect(() => {
    if (!userId) return;

    // If the user cleared their choices, wipe out the ranking state entries too
    if (selectedPerformers.length === 0) {
      setRankingEntries([]);
      return;
    }

    setRankingEntries((prevRankings) => {
      // 1. Strip out any old data objects wrapper if it exists from initial states
      const flatPrevRankings = Array.isArray(prevRankings) ? prevRankings : [];

      // 2. Remove any entries that are no longer present in selectedPerformers
      const preservedRankings = flatPrevRankings.filter((entry) =>
        selectedPerformers.includes(entry.performance_id),
      );

      // 3. Find newly added performer IDs that don't have a rank yet
      const existingIds = preservedRankings.map((r) => r.performance_id);
      const newIds = selectedPerformers.filter(
        (id) => !existingIds.includes(id),
      );

      // 4. Map new additions to the end of the ranking list
      const newEntries = newIds.map((id, index) => ({
        performance_id: id,
        rank: preservedRankings.length + index + 1,
      }));

      const combined = [...preservedRankings, ...newEntries];

      // 5. Re-index ranks strictly sequentially (1, 2, 3...) to avoid numeric gaps
      return combined.map((entry, idx) => ({
        ...entry,
        rank: idx + 1,
      }));
    });
  }, [selectedPerformers, userId]);

  if (!user || perfLoading) return <Spinner />;

  const handleSlideChange = (swiper) => {
    if (!userId) return;

    const expirationTime = Date.now() + SESSION_DURATION_MS;

    localStorage.setItem(
      STEP_KEY,
      JSON.stringify({ value: swiper.activeIndex, exp: expirationTime }),
    );

    if (swiper.activeIndex === reviewStepIndex) {
      setHasSeenReview(true);
      localStorage.setItem(
        SEEN_REVIEW_KEY,
        JSON.stringify({ value: true, exp: expirationTime }),
      );
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
          onConfirm={() => seqRef.current?.slideNext()}
        />
      </div>

      {/* Step 3+: Misc Category Voting Loops */}
      {miscCategories?.map((cat) => (
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
