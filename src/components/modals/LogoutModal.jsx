import './LogoutModal.css';

import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { Button } from '../index';

const LogoutModal = ({ onClose }) => {
  const { logout } = useUser();
  const navigate = useNavigate();
  const modalRoot = document.getElementById('modal-root');

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 1. Sima, tiszta kilépés (megőrzi a 12h-s jegyzeteket és egyebeket)
  const handleLogout = () => {
    logout();
    onClose();
    navigate('/', { replace: true });
  };

  // 2. 💥 RADIKÁLIS VISSZAÁLLÍTÁS (Mindent letakarít a localStorage-ból)
  const handleHardReset = () => {
    localStorage.clear(); // Teljes nukleáris csapás a domain tárolójára (gyorsítótár + minden törlődik)
    onClose();

    // Mivel a UserContext belső állapotát is nullázni kell a biztonság kedvéért:
    window.location.href = '/'; // Kényszerített teljes oldalújratöltés a tiszta memóriáért a loginon
  };

  const modalContent = (
    <motion.div
      className='flex modal w-100v h-100v p-32'
      onClick={handleBackdropClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className={`
          m-auto flex flex-column flex-align-center gap-32
          bg-bg
          text-color-white
          p-32 pt-48 b-radius-32
          elevation-md-blue
          border-md border-text
          pos-rel
        `}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <img
          src='/x-text.svg'
          alt='close modal'
          className='pos-abs t-0 r-0 p-12'
          style={{ width: '50px', height: '50px' }}
          onClick={onClose}
        />

        <h2>Művelet kiválasztása</h2>
        <p className='text-sm text-color-grey' style={{ marginTop: '-10px' }}>
          Ha hibás adatokat látsz vagy beragadt a rendszer, használd a
          visszaállítást.
        </p>

        {/* Gombok egymás mellett/alatt elrendezve */}
        <div className='flex flex-column gap-10 flex-align-center w-100 mt-16'>
          {/* Sima kilépés gomb */}
          <Button
            text='Kilépek'
            onClick={handleLogout}
            className='w-100 flex-justify-center'
          />

          {/* 💥 Nukleáris Hard-Reset gomb egyedi stílussal */}
          <Button
            text='Visszaállítás'
            onClick={handleHardReset}
            className='w-100 flex-justify-center bg-grey text-color-bg border-grey' // Szürke háttérrel, hogy vizuálisan elváljon a fő akciótól
          />
        </div>
      </motion.div>
    </motion.div>
  );

  return ReactDOM.createPortal(modalContent, modalRoot);
};

export default LogoutModal;
