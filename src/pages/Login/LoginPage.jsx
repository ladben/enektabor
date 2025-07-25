import { useRef, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useFinalizedVote } from "../../hooks/useFinalizedVote";
import { useNavigate } from "react-router-dom";

import { Sequence } from "../../components";
import PasswordStep from "./PasswordStep";
import SelectUserStep from "./SelectUserStep";

const LoginPage = () => {
  const seqRef = useRef();
  const [competition, setCompetition] = useState(null);
  const { user } = useUser();
  const { data: finalizedVote, isLoading: finalizedVoteLoading } = useFinalizedVote({ userId: user?.user_id, competitionId: user?.competition_id });
  const navigate = useNavigate();

  const handlePasswordSuccess = (competition) => {
    setCompetition(competition);
    seqRef.current?.slideNext();
  };

  const handlePostLoginRedirect = () => {
    if (finalizedVote) return navigate('/thanks');
    
    const roles = user.roles?.find((r) => r.competition_id === competition.id);
    if (roles?.is_performer) return navigate('/songChoose');
    if (roles?.is_voter) return navigate('/vote');
    if (roles?.is_jury) return navigate('/results');
  };

  // if already logged in, redirect
  if (user && competition && !finalizedVoteLoading) {
    handlePostLoginRedirect();
    return null;
  }

  return (
    <Sequence ref={seqRef}>

      {/* Password screen */}
      <div className="flex flex-column gap-24 flex-align-center">
        <PasswordStep onSuccess={handlePasswordSuccess} />
      </div>

      {/* User select screen */}
      <div className="flex flex-column gap-24 flex-align-center h-100 ofy-hidden">
        {competition && <SelectUserStep competition={competition} /> }
      </div>
      
    </Sequence>
  );
}
 
export default LoginPage;