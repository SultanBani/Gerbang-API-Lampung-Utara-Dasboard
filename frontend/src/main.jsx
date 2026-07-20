import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ApiGatewayProvider } from './context/ApiGatewayContext'
import App from './App'
import './style.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ApiGatewayProvider>
          <App />
        </ApiGatewayProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
