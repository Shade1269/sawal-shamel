import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { DarkModeProvider } from './components/DarkModeProvider'
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DarkModeProvider>
      <FirebaseAuthProvider>
        <App />
      </FirebaseAuthProvider>
    </DarkModeProvider>
  </StrictMode>
);
