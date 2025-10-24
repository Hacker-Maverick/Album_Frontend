import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from '../store/index.js'
import './index.css'
import AppRouter from './AppRouter.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId="445823216011-eecujaargkr7bnulgou60p70und1glpn.apps.googleusercontent.com">
        <AppRouter />
            <ToastContainer position="bottom-right" autoClose={3000} />
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>,
)
