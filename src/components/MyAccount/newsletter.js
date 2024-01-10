import React, { useCallback, useEffect, useState } from 'react';
import { shape, string } from 'prop-types';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './myAccount.css';
import newsletterClasses from './newsletter.css';
import accountclass from './accountinformation.css';
import Sidebar from './sidebar.js';
import { FormattedMessage, useIntl } from 'react-intl';
import { Redirect } from 'src/drivers';
import LoadingIndicator from '../LoadingIndicator';
import { useToasts } from '@magento/peregrine';
import CommunicationsPageOperations from 'src/components/CommunicationsPage/communicationsPage.gql.js';
import { useCommunicationsPage } from 'src/peregrine/lib/talons/MyAccount/useCommunicationsPage';
import Button from '@magento/venia-ui/lib/components/Button';
import Checkbox from '@magento/venia-ui/lib/components/Checkbox';
import Field from '@magento/venia-ui/lib/components/Field';
import FormError from '@magento/venia-ui/lib/components/FormError';
import { Form } from 'informed';
import { Title } from '../Head';

const Newsletter = props => {
    const [isSubscribe, setIsSubscribe] = useState(JSON.parse(localStorage.getItem("isSubscribeNewSletter")))
    const classes = mergeClasses(
        defaultClasses,
        props.classes,
        newsletterClasses
    );
    const [, { addToast }] = useToasts();
    const { formatMessage } = useIntl();

    const afterSubmit = useCallback(() => {
        addToast({
            type: 'info',
            message: 'Your preferences have been updated.',
            timeout: 5000
        });
    }, [addToast]);

    const talonProps = useCommunicationsPage({
        afterSubmit,
        setIsSubscribe,
        isSubscribe,
        ...CommunicationsPageOperations
    });

    const {
        formErrors,
        handleSubmit,
        isDisabled,
        isSignedIn,
        isSubscribeData,
        subscriptionLoading
    } = talonProps;

    useEffect(() => {
        if (window.location.pathname === '/newsletter/manage/')
            isSubscribeData()
    }, [])

    if (!isSignedIn) {
        return <Redirect to="/" />;
    }

    return (
        <div className={defaultClasses.columns}>
            <Title>{`My Newsletter Subscription`}</Title>
            {subscriptionLoading && (
                <div className={accountclass.indicator_loader}>
                    <LoadingIndicator />
                </div>
            )}
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-12">
                        <div
                            className={
                                defaultClasses.column +
                                ' ' +
                                defaultClasses.main
                            }
                        >
                            <div className={defaultClasses.account_sideBar}>
                                <Sidebar history={props.history} />
                            </div>
                            <div className={defaultClasses.account_contentBar}>
                                <div
                                    className={
                                        defaultClasses.page_title_wrapper
                                    }
                                >
                                    <h1 className={defaultClasses.page_title}>
                                        <span className={defaultClasses.base}>
                                            <FormattedMessage
                                                id={'Newsletter.page_title'}
                                                defaultMessage={
                                                    'Newsletter Subscription'
                                                }
                                            />
                                        </span>
                                    </h1>
                                </div>
                                <div
                                    className={
                                        defaultClasses.block +
                                        ' ' +
                                        newsletterClasses.newsletter_Wrap +
                                        ' ' +
                                        defaultClasses.block_dashboard_orders
                                    }
                                >
                                    <div className={classes.checkbox_wrapper}>
                                        <FormError errors={formErrors} />
                                        <Form
                                            className={classes.form}
                                            onSubmit={handleSubmit}
                                            initialValues={isSubscribe}
                                        >
                                            <Field
                                                id="isSubscribed"
                                                label={formatMessage({
                                                    id:
                                                        'newsLetter.SubscriptionOption',
                                                    defaultMessage:
                                                        'Subscription Option'
                                                })}
                                            >
                                                <Checkbox
                                                    field="isSubscribed"
                                                    label={formatMessage({
                                                        id:
                                                            'newsLetter.message',
                                                        defaultMessage:
                                                            'Stay on the cutting edge of fashion; subscribe to the monthly 999Tee Newsletter.'
                                                    })}
                                                    isDisplayOwnLabel={true}
                                                    fieldState={{
                                                        value: isSubscribe
                                                    }}
                                                    onClick={() => {
                                                        setIsSubscribe(!isSubscribe)
                                                        localStorage.setItem("isSubscribeNewSletter", !isSubscribe)
                                                    }}
                                                />
                                            </Field>
                                            <div
                                                className={
                                                    classes.buttonsContainer +
                                                    ' ' +
                                                    'mt-3'
                                                }
                                            >
                                                <Button
                                                    disabled={isDisabled}
                                                    type="submit"
                                                    priority="high"
                                                >
                                                    {isDisabled
                                                        ? 'Saving'
                                                        : formatMessage({
                                                            id:
                                                                'newsLetter.saveChange',
                                                            defaultMessage:
                                                                'Save Changes'
                                                        })}
                                                </Button>
                                            </div>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Newsletter;

Newsletter.propTypes = {
    classes: shape({
        actions: string,
        root: string,
        subtitle: string,
        title: string,
        user: string
    })
};
