import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './components/layouts/MainLayout';
import NotFound from './routes/NotFound';
import LoginPage from './pages/Login/LoginPage';
import SongChoose from './pages/SongChoose';
import WaitRoom from './pages/WaitRoom/WaitRoom';
import Vote from './pages/Vote/Vote';
import Thanks from './pages/Thanks';
import Results from './pages/Results';
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path='/' element={<LoginPage />} />
          <Route path='/songChoose' element={<SongChoose />} />
          <Route path='/wait-room' element={<WaitRoom />} />
          <Route path='/vote' element={<Vote />} />
          <Route path='/thanks' element={<Thanks />} />
          <Route path='/results' element={<Results />} />
          <Route path='*' element={<NotFound />} />
        </Route>
        <Route path='/admin' element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
