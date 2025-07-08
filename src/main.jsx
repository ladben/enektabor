import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ItemProvider } from './context/ItemContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ItemProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ItemProvider>
  </StrictMode>,
)
