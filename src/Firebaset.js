import * as firebase from 'firebase';

let config = {
    apiKey: 'JE*U#?tg$%|RFU6uXw>p^I+e7$+#oE',
    // apiKey: 'AIzaSyCuL8ewZ_9zmFwJHi8BX9P4O6EhfSn1vN4',
    databaseURL: "https://nandan-petrochem.firebaseio.com",
    projectId: "nandan-petrochem",
    storageBucket: "nandan-petrochem.appspot.com",
};
var fire = firebase.initializeApp(config);
export default fire;