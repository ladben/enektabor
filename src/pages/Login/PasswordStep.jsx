import { useState } from "react";
import { useSequenceConfig } from "../../context/SequenceContext";
import { supabase } from '../../lib/supabaseClient';
import bcrypt from "bcryptjs";

import { Button, TextInput, Title } from "../../components";

const PasswordStep = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPressed, setIsPressed] = useState(false);
  const { BUTTON_PRESSED_TIME, SWIPE_DELAY } = useSequenceConfig();

  const handleSubmit = async () => {
    setError('');
    setIsPressed(true);

    setTimeout(() => {
      setIsPressed(false);
    }, BUTTON_PRESSED_TIME);

    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error || !data) {
      setError('Competition not found');
      return;
    }

    const match = await bcrypt.compare(password, data.password);
    if (!match) {
      setError('Incorrect password');
      return;
    }

    setTimeout(() => {
      onSuccess(data);
    }, BUTTON_PRESSED_TIME + SWIPE_DELAY);
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
        className={"mb-24"}
      />
      {error && <p className="text-color-acc mt-2">{error}</p>}
    </>
  );
}
 
export default PasswordStep;