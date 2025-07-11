import { useState } from "react";
import { supabase } from '../../lib/supabaseClient';
import bcrypt from "bcryptjs";
import { Button, TextInput } from "../../components";

const PasswordStep = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) return setError('Competition not found');

    const match = await bcrypt.compare(password, data.password);
    if (!match) return setError('Incorrect password');

    onSuccess(data)
  };

  return (
    <div className="p-4">
      <TextInput
        name="competition-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Írd be a jelszót!"
        className="border p-2 w-full mb-2"
      />
      <Button
        onClick={handleSubmit}
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
 
export default PasswordStep;