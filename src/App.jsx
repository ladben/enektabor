import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './components/layouts/MainLayout';
import NotFound from './routes/NotFound';
import LoginPage from './pages/Login/LoginPage';
import SongChoose from './pages/SongChoose';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/songChoose" element={<SongChoose />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
