import React from 'react';
import './App.css';

import API, { FirebaseContext } from './firebase';

import SignUpPage from './pages/SignUpPage';

function App() {

  const api = new API();

  return (
    <FirebaseContext.Provider value={api}>
      <SignUpPage />
    </FirebaseContext.Provider>
  );
}

export default App;
