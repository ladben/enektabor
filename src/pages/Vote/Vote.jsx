import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { usePerformancesForVoting } from "../../hooks/usePerformancesForVoting";
import { useMiscCategoriesForCompetition } from "../../hooks/useMiscCategoriesForCompetition";
import { useActiveCompetition } from "../../hooks/useActiveCompetition";

import { Sequence } from "../../components";
import { RankPerformersStep, ReviewVoteStep, SelectPerformersStep, VoteMiscStep } from "./steps";

const Vote = () => {
  const seqRef = useRef();
  const navigate = useNavigate();
  const { user } = useUser();

  const [selectedPerformers, setSelectedPerformers] = useState([]);
  const [miscVotes, setMiscVotes] = useState({});
  const [rankingEntries, setRankingEntries] = useState([]);

  const userId = user?.user_id;
  const competitionId = user?.competition_id;

  const { data: performances = [] } = usePerformancesForVoting(competitionId, userId);
  const { data: miscCategories = [] } = useMiscCategoriesForCompetition(competitionId);
  const { data: competition } = useActiveCompetition();
  const topNumber = competition?.top_number;

  if (!user) return null;

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

  const handleMiscContinue = (index) => {
    if (index + 1 < miscCategories.length) {
      seqRef.current?.slideNext();
    } else {
      seqRef.current?.slideNext();
    }
  };

  const handleBackStep = () => {
    seqRef.current?.slidePrev();
  }

  return (
    <Sequence ref={seqRef}>
      {/* Step 1: select top performers */}
      <div className="flex flex-column gap-24 flex-align-center h-100 ofy-hidden">
        <SelectPerformersStep
          performances={performances}
          max={topNumber}
          selected={selectedPerformers}
          onConfirm={handlePerformersSelected}
        />
      </div>

      {/* Step 2: Rank Selected Performers */}
      <div className="flex flex-column gap-24 flex-align-center h-100 ofy-hidden">
        <RankPerformersStep
          performers={selectedPerformers}
          performances={performances}
          onBack={handleBackStep}
          onConfirm={handleRankConfirmed}
        />
      </div>

      {/* Step 3+: Misc Category Voting */}
      {miscCategories.map((cat, index) => {
        <div key={cat.id} className="flex flex-column gap-24 flex-align-center h-100 ofy-hidden">
          <VoteMiscStep
            category={cat}
            performances={performances}
            selected={miscVotes[cat.id]}
            onSelect={(id) => handleMiscVote(cat.id, id)}
            onConfirm={() => handleMiscContinue(index)}
          />
        </div>
      })}

      {/* Step 4: Final Review */}
      <div className="flex flex-column gap-24 flex-align-center h-100 ofy-hidden">
        <ReviewVoteStep
          rankings={rankingEntries}
          miscVotes={miscVotes}
          performances={performances}
          onSubmit={() => {
            // save vote for db
            navigate("/thanks");
          }}
        />
      </div>
    </Sequence>
  );
}
 
export default Vote;