import * as firebase from 'firebase';

let config = {
    apiKey: 'AIzaSyCuL8ewZ_9zmFwJHi8BX9P4O6EhfSn1vN4',
    databaseURL: "https://nandan-petrochem.firebaseio.com",
    projectId: "nandan-petrochem",
    storageBucket: "nandan-petrochem.appspot.com",
};
var fire = firebase.initializeApp(config);
export default fire;