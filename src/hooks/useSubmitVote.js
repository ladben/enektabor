import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

export const useSubmitVote = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const submitVote = async ({ competitionId, rankings, miscVotes }) => {
    // 1. Create vote
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        competition_id: competitionId,
        user_id: user.user_id,
        finalized: true,
      })
      .select()
      .single();

    if (voteError || !vote) throw new Error(voteError.message);

    const voteId = vote.id;

    // 2. Insert rankings
    const rankingPayload = rankings.map(({ performance_id, rank}) => ({
      vote_id: voteId,
      performance_id,
      rank,
    }));

    const { error: rankingError } = await supabase
      .from('vote_ranking_entries')
      .insert(rankingPayload);

    if (rankingError) throw new Error(rankingError.message);

    // 3. Insert misc votes
    const miscPayload = Object.entries(miscVotes).map(([miscId, performance_id]) => ({
      vote_id: voteId,
      misc_category_id: parseInt(miscId),
      performance_id,
    }));

    const { error: miscError } = await supabase
      .from('vote_misc_entries')
      .insert(miscPayload);

    if (miscError) throw new Error(miscError.message);

    // 4. Done -> navigate
    navigate("/thanks");
    return true;
  }

  return { submitVote };
};