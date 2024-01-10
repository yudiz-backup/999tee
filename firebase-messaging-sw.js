importScripts('https://www.gstatic.com/firebasejs/8.2.9/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.9/firebase-messaging.js');

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('../firebase-messaging-sw.js')
        .then(function(registration) {
            console.log(
                'Registration successful, scope is:',
                registration.scope
            );
        })
        .catch(function(err) {
            console.log('Service worker registration failed, error:', err);
        });
}
firebase.initializeApp({
    apiKey: 'AIzaSyBAx-4u4VpI8IguIVQ8EfotrowTMDXNy48',
    authDomain: 'cenia-8e7a5.firebaseapp.com',
    projectId: 'cenia-8e7a5',
    storageBucket: 'cenia-8e7a5.appspot.com',
    messagingSenderId: '425559773716',
    appId: '1:425559773716:web:c896520ac68d317e068d01'
});

const initMessaging = firebase.messaging();
