import firebase from 'firebase/app';
import 'firebase/messaging';

const config = {
    apiKey: 'AIzaSyBAx-4u4VpI8IguIVQ8EfotrowTMDXNy48',
    authDomain: 'cenia-8e7a5.firebaseapp.com',
    projectId: 'cenia-8e7a5',
    storageBucket: 'cenia-8e7a5.appspot.com',
    messagingSenderId: '425559773716',
    appId: '1:425559773716:web:c896520ac68d317e068d01'
};
firebase.initializeApp(config);

export default firebase;
