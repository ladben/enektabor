import { useState } from "react";
import { useSequenceConfig } from "../../context/SequenceContext";
import { useActiveCompetition } from "../../hooks/useActiveCompetition";
import bcrypt from "bcryptjs";

import { Button, TextInput, Title } from "../../components";

const PasswordStep = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPressed, setIsPressed] = useState(false);
  const { BUTTON_PRESSED_TIME, SWIPE_DELAY } = useSequenceConfig();

  const { data: competition } = useActiveCompetition();

  const handleSubmit = async () => {
    setError('');
    setIsPressed(true);

    setTimeout(() => setIsPressed(false), BUTTON_PRESSED_TIME);

    if (!competition) {
      setError('No active competitions found');
      return;
    }

    const match = await bcrypt.compare(password, competition.password);
    if (!match) {
      setError('Incorrect password');
      return;
    }

    setTimeout(() => onSuccess(competition), BUTTON_PRESSED_TIME + SWIPE_DELAY);
  };

  return (
    <>
      <Title text="Írd be a jelszót a folytatáshoz!" />
      <TextInput
        name="competition-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Jelszó..."
      />
      <Button
        text="Mehet"
        iconType="tick"
        onClick={handleSubmit}
        isPressed={isPressed}
        className={"mb-16"}
      />
      {error && <p className="text-color-acc mt-2">{error}</p>}
    </>
  );
}
 
export default PasswordStep;