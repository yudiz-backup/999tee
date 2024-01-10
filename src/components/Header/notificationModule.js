import React, { useState, useEffect } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { useToasts } from '@magento/peregrine'
import { FormattedMessage } from 'react-intl'
import { Redirect } from 'src/drivers';
import readedNotification from '../../queries/notificationModule/readedNotification.graphql'
import removeNotification from '../../queries/notificationModule/removeNotificationSingle.graphql'
import deleteAllNotification from '../../queries/notificationModule/removeAllNotification.graphql'
import { faExclamationTriangle, /* faTimes */ } from '@fortawesome/free-solid-svg-icons';
import searchClasses from '../SearchPage/searchPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faCancel } from '@fortawesome/free-solid-svg-icons';
// import Icon from '@magento/venia-ui/lib/components/Icon';
import { clearIcon } from '../CreateAccount/createAccount';
import { monthsForChart } from '../../util/customData'
import LoadingIndicator from '../LoadingIndicator/indicator';

export default function NotificationModule(props) {
    const [readNotification, setReadNotification] = useState()
    const { isOpen,
        classes,
        notificationData,
        notificationDataList,
        loading,
        setIsOpen,
        readMsgLength } = props

    const [readedNotificationData] = useMutation(readedNotification, {
        onCompleted: (data) => {
            setReadNotification(data)
            notificationDataList()
        }
    })

    const [removeSinglenotification, { loading: singleNotRemLoading }] = useMutation(removeNotification, {
        onCompleted: () => {
            notificationDataList()
        }
    })

    const [removeAllNot] = useLazyQuery(deleteAllNotification, {
        fetchPolicy: 'no-cache', onCompleted: () => {
            notificationDataList()
        }
    })

    const handleNoyficationId = (notificationList) => {
        if (notificationList) {
            readedNotificationData({
                variables: {
                    id: notificationList?.entity_id
                }
            })
        }
    }

    const [, { addToast }] = useToasts();

    useEffect(() => {
        if (readNotification) {
            addToast({
                type: 'info',
                message: readNotification.notificationStatusUpdate.success_message,
                dismissable: true,
                timeout: 5000
            });
            setIsOpen(false)
            setReadNotification()
        }
    }, [readNotification])

    if (readNotification) {
        return <Redirect to="/order/history" />
    }

    const removenotification = (e, id) => {
        e.stopPropagation()
        if (id) {
            removeSinglenotification({
                variables: {
                    id: id
                }
            })
        }
        setIsOpen(true)
    }

    const removeAllNotification = () => {
        removeAllNot()
    }

    return (
        <div className={`${isOpen ? classes.notification_active : null} ${classes.notification}`}>
            <div className={(notificationData?.notificationList?.sort()?.reverse() &&
                notificationData?.notificationList?.length !== 0) ? "toast" : ""}>
                <div className={'toast-header' + ' ' + classes.header_notify}>
                    <span className={classes.notify_btn}>
                        <img
                            className={classes.popupbtn_img}
                            src="/cenia-static/icons/icons8-alarm-50.png"
                            alt="bell"
                            width="24"
                            height="24"
                        />
                        <FormattedMessage
                            id={'notification.notification'}
                            defaultMessage={'Notifications'}
                        />

                    </span>
                    {notificationData?.notificationList?.length !== 0 &&
                        <button onClick={removeAllNotification}><span className={classes.notify_btn}>Remove All</span></button>
                    }
                </div>
                {!loading &&
                    notificationData?.notificationList?.length !== 0 ?
                    notificationData?.notificationList?.sort()?.reverse()?.map((notificationList, index) => {
                        const date = new Date(notificationList?.created_at);
                        const dateMDY = `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}-${monthsForChart[date.getMonth() + 1]}-${date.getFullYear()}`;

                        return <div className={classes.notification_toast} key={index}>
                            <button className={`toast-body text-left ${notificationList.is_read ? classes.notification_unread : ""}`} onClick={() => handleNoyficationId(notificationList)}>
                                <div className={classes.notification_toast_icon}>
                                    <div className={classes.notification_toast_title}>

                                        <h4 > {notificationList.notification_type}</h4>

                                    </div>
                                    <button onClick={(e) => removenotification(e, notificationList.entity_id)}>  {clearIcon}</button>

                                </div>
                                <div className={classes.notification_toast_content}>
                                    <p> {notificationList.msg}</p>
                                    <p>{dateMDY}</p>
                                </div>
                            </button>
                        </div>
                    }) :
                    (readMsgLength &&
                        readMsgLength?.length === 0) &&
                    (notificationData?.notificationList?.sort()?.reverse()?.length === 0) &&
                    <div className={searchClasses.noResult}>
                        <span className={searchClasses.noResult_icon}>
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                        </span>
                        <span className={'ml-2' + ' ' + searchClasses.noResult_text}>
                            <FormattedMessage
                                id={'notification.noResult_notification'}
                                defaultMessage={'No notifications so far'}
                            />
                        </span>
                    </div>
                }
                {(loading || singleNotRemLoading) && <LoadingIndicator/>}

            </div>
        </div>
    )
}
