import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <>
      <div className='head-image flex px-50 flex-justify-center flex-align-center elevation-section-shadow'>
        <img src='/header_img.png' alt="" className='w-100' />
      </div>
      <div className='main-wrapper flex flex-column gap-24 p-32 flex-align-center'>
        <Outlet />
      </div>
    </>
  );
}
 
export default MainLayout;