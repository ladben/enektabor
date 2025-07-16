import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './components/layouts/MainLayout';
import NotFound from './routes/NotFound';
import LoginPage from './pages/Login/LoginPage';
import SongChoose from './pages/SongChoose';
import Vote from './pages/Vote/Vote';
import Thanks from './pages/Thanks';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/songChoose" element={<SongChoose />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/thanks" element={<Thanks />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
