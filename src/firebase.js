import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { createContext, useContext } from 'react';

var firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

firebase.initializeApp(firebaseConfig);

export const FirebaseContext = createContext(null);
export const useFirebase = () => useContext(FirebaseContext);

export default class API {

  constructor() {
    this.firebase = firebase;
  }

  // Authentication API

  /**
   * Log in and return user.
   * May legitimately throw with `error.code` set to one of:
   *   - "auth/invalid-email"
   *   - "auth/user-disabled"
   *   - "auth/user-not-found"
   *   - "auth/wrong-password"
   */
  async logIn(email, password) {
    return await this.firebase.auth().signInWithEmailAndPassword(email, password);
  }

  /**
   * Log out current user
   */
  async logOut(){
    return this.firebase.auth().signOut();
  }
  
  /**
   * Create and return user.
   * May legitimately throw with `error.code` set to one of
   *   - "auth/email-already-in-use"
   *   - "auth/invalid-email"
   *   - "auth/weak-password"
   */
  async signUp(name, email, password) {
    const credentials = await this.firebase.auth().createUserWithEmailAndPassword(email, password);

    await credentials.user.updateProfile(({
      displayName: name
    }))

    await credentials.user.sendEmailVerification();

    return credentials.user;
  }

  // async sendPasswordResetEmail() {

  // }

  // async confirmPasswordReset(email, code) {

  // }

  /**
   * Update user profile data.
   */
  async updateProfile({name}) {
    const user = this.firebase.auth().currentUser;
    await user.updateProfile({
      displayName: name
    })
  }

  /**
   * Change password from old (which will be re-authenticated) to new.
   * May legitimate throw with `error.code` set to:
   *   - "auth/user-mismatch"
   *   - "auth/user-not-found"
   *   - "auth/wrong-password"
   *   - "auth/weak-password"
   */
  async changePassword(oldPassword, newPassword) {
    const user = this.firebase.auth().currentUser;
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, oldPassword);
    await user.reauthenticateWithCredential(credential);
    await user.updatePassword(newPassword);
  }

  
}