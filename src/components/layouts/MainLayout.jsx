import { useLocation, Outlet } from 'react-router-dom';
import { useState } from 'react';
import LogoutModal from '../modals/LogoutModal';
import { AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';

const MainLayout = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useUser();

  const isHomePage = location.pathname === '/';

  const handleImageClick = () => {
    user && setIsModalOpen(true);
  };

  return (
    <div className='flex flex-column h-100sv of-hidden'>
      <div className='head-image flex px-50 flex-justify-center flex-align-center elevation-section-shadow'>
        <img
          src='/header_img.png'
          alt=''
          className={isHomePage ? 'w-100' : 'w-50'}
          onClick={handleImageClick}
        />
      </div>
      <div className='main-wrapper flex flex-column gap-24 p-32 flex-align-center of-hidden h-100'>
        <Outlet />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && user && (
          <LogoutModal onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
