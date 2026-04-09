import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App'
import { Provider } from 'react-redux';
import { store, persistor } from "./redux/store";
import "nprogress/nprogress.css";
import { PersistGate } from 'redux-persist/integration/react';
import './utils/i18n'



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
  ,
)