var config = {
  apiKey: "AIzaSyDan0DFvZ9f12FbwWAji2nccZDWfWlFC_Q",
  authDomain: "bakalarska-praca-8c17f.firebaseapp.com",
  databaseURL: "https://bakalarska-praca-8c17f.firebaseio.com",
  storageBucket: "bakalarska-praca-8c17f.appspot.com",
  messagingSenderId: "18153410974"
};
firebase.initializeApp(config);

firebase.auth().signInAnonymously();
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    window.user = user;
  }
});

module.exports = firebase.database();
