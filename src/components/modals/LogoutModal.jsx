import './LogoutModal.css';

import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
// eslint disable-next-line no-unused-expressions
void motion;
import { useNavigate } from "react-router-dom";
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

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  }

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
        initial={{ opacity: 0, y: 30, scale: 0.95}}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <img
          src='/x-text.svg'
          alt='close modal'
          className='pos-abs t-0 r-0 p-12'
          style={{width: '50px', height: '50px'}}
          onClick={onClose}
        />
        <h2>Biztosan ki akarsz lépni?</h2>
        <Button
          text="Kilépek"
          onClick={handleLogout}
        />
      </motion.div>
    </motion.div>
  );

  return ReactDOM.createPortal(modalContent, modalRoot);
};
 
export default LogoutModal;