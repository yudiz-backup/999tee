import React, { useState } from 'react';
import { useSaveToken } from '../../peregrine/lib/talons/PushNotification/usePushNotification';
import SAVE_TOKEN from '../../queries/saveToken.graphql';

const PushNotification = () => {
    const [tokenSaved, setTokenSaved] = useState(false);
    const tokenProps = useSaveToken({
        query: SAVE_TOKEN
    });
    const { saveToken } = tokenProps;
    const NotificationToken = localStorage.getItem('notification-token');

    if (NotificationToken && !tokenSaved) {
        saveToken({ tokenId: NotificationToken });
        setTokenSaved(true);
    }
    return <React.Fragment />;
};

export default PushNotification;
