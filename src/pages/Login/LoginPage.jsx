import { useState } from "react";
import PasswordStep from "./PasswordStep";
import SelectUserStep from "./SelectUserStep";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [step, setStep] = useState(0);
  const [competition, setCompetition] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();

  const handlePasswordSuccess = (competition) => {
    setCompetition(competition);
    setStep(1);
  };

  const handlePostLoginRedirect = () => {
    const roles = user.roles?.find((r) => r.competition_id === competition.id);
    if (roles?.is_performer) return navigate('/songChoose');
    if (roles?.is_voter) return navigate('/vote');
    if (roles?.is_jury) return navigate('/results');
  };

  // if already logged in, redirect
  if (user && competition) {
    handlePostLoginRedirect();
    return null;
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="transition-transform duration-500 flex w-[200%]">
        <div className={`w-1/2 ${step === 0 ? '' : '-translate-x-full'}`}>
          <PasswordStep onSuccess={handlePasswordSuccess} />
        </div>
        <div className={`w-1/2 ${step === 1 ? '' : 'translate-x-full'}`}>
          {competition && <SelectUserStep competition={competition}/>}
        </div>
      </div>
    </div>
  );
}
 
export default LoginPage;