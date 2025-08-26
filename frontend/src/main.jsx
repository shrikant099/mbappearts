import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter} from 'react-router-dom'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import store from './store.js'

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <Provider store={store}>

      <BrowserRouter>
      <App />
      <Toaster/>
    </BrowserRouter>

    </Provider>
    
  </StrictMode>,
)
