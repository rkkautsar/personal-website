import * as firebase from "firebase/app";
import "firebase/analytics";
import "firebase/performance";

const firebaseConfig = {
  apiKey: "AIzaSyCKLgA8JtL39N0QA0uXmkfZANnLGUEDijY",
  authDomain: "personal-website-28720.firebaseapp.com",
  databaseURL: "https://personal-website-28720.firebaseio.com",
  projectId: "personal-website-28720",
  storageBucket: "personal-website-28720.appspot.com",
  messagingSenderId: "640814751030",
  appId: "1:640814751030:web:2407443317d1088b0fa797",
  measurementId: "G-4X41Y2KKSV",
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}
export const analytics = firebase.analytics();
export const performance = firebase.performance();

if (process.env.NODE_ENV === "development") {
  analytics.setUserProperties({
    debug_mode: true,
  });
}
