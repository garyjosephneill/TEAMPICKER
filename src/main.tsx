import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import PrivacyPolicy from './PrivacyPolicy'
import './index.css'

const isPrivacyPage = window.location.pathname === '/privacy'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isPrivacyPage ? <PrivacyPolicy /> : <App />}
  </React.StrictMode>,
)
