import React, { useEffect } from 'react';

import firebase from '../../firebase';

const PushNotification = () => {
    useEffect(() => {
        if (firebase.messaging.isSupported()) {
            const messaging = firebase.messaging();
            messaging
                .requestPermission()
                .then(() => {
                    return messaging.getToken();
                })
                .then(token => {
                    console.log(token);
                    localStorage.setItem('notification-token', token);
                })
                .catch(err => {
                    localStorage.setItem('notification-error', err);
                    console.log(err);
                });
        }
    }, []);

    return <React.Fragment />;
};

export default PushNotification;
