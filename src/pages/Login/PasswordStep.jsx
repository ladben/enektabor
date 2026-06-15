import { useState } from 'react';
import { useSequenceConfig } from '../../context/SequenceContext';
import { useActiveCompetition } from '../../hooks/useActiveCompetition';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { Button, TextInput, Title } from '../../components';
import { supabase } from '../../lib/supabaseClient';

const PasswordStep = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPressed, setIsPressed] = useState(false);
  const { BUTTON_PRESSED_TIME, SWIPE_DELAY } = useSequenceConfig();
  const navigate = useNavigate();

  const { data: competition } = useActiveCompetition();

  const handleSubmit = async () => {
    setError('');
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), BUTTON_PRESSED_TIME);

    if (!password) {
      setError('Kérlek írd be a jelszót!');
      return;
    }

    try {
      // 1. SUPERADMIN BRANCH: A titkos mesterjelszó (nyers összehasonlítás, mint eddig)
      if (password === 'adminedit') {
        sessionStorage.setItem('admin_mode', 'superadmin');
        sessionStorage.removeItem('admin_user_id');
        setTimeout(() => navigate('/admin'), BUTTON_PRESSED_TIME + SWIPE_DELAY);
        return;
      }

      // 2. KORLÁTOZOTT ADMIN BRANCH: Titkosított egyedi jelszavak ellenőrzése
      // Lekérjük az összes olyan embert, akinek van admin jelszava az adatbázisban
      const { data: adminPeople, error: dbError } = await supabase
        .from('people')
        .select('id, name, admin_password')
        .not('admin_password', 'is', null);

      if (!dbError && adminPeople && adminPeople.length > 0) {
        // Végigjárunk az adminisztrátorokon, és megnézzük, passzol-e a bcrypt hash
        for (const admin of adminPeople) {
          const isMatch = await bcrypt.compare(password, admin.admin_password);

          if (isMatch) {
            sessionStorage.setItem('admin_mode', 'limited');
            sessionStorage.setItem('admin_user_id', admin.id);
            setTimeout(
              () => navigate('/admin'),
              BUTTON_PRESSED_TIME + SWIPE_DELAY,
            );
            return;
          }
        }
      }

      // 3. JÁTÉKOS / SZAVAZÓ BRANCH: Hagyományos gála-jelszó ellenőrzése
      if (!competition) {
        setError('Nincs aktív verseny elindítva.');
        return;
      }

      const isCompetitionMatch = await bcrypt.compare(
        password,
        competition.password,
      );
      if (!isCompetitionMatch) {
        setError('Helytelen jelszó!');
        return;
      }

      // Ha sikeres a gála jelszó, mehet a szavazó szekvencia
      setTimeout(
        () => onSuccess(competition),
        BUTTON_PRESSED_TIME + SWIPE_DELAY,
      );
    } catch (err) {
      console.error('Hiba a beléptetés során:', err);
      setError('Szerveroldali hiba történt a hitelesítéskor.');
    }
  };

  return (
    <>
      <Title text='Írd be a jelszót a folytatáshoz!' />
      <TextInput
        name='competition-password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder='Jelszó...'
      />
      <Button
        text='Mehet'
        iconType='tick'
        onClick={handleSubmit}
        isPressed={isPressed}
        className='mb-16'
      />
      {error && <p className='text-color-acc mt-2'>{error}</p>}
    </>
  );
};

export default PasswordStep;
