import React from 'react';
import { shape, string } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import defaultClasses from './myAccount.css';
import Sidebar from './sidebar.js';

const StorePaymentMethod = props => {
    return (
        <div className={defaultClasses.columns}>
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
                            <FormattedMessage
                                id={'StorePaymentMethod.title'}
                                defaultMessage={'Store Payment Method'}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StorePaymentMethod;

StorePaymentMethod.propTypes = {
    classes: shape({
        actions: string,
        root: string,
        subtitle: string,
        title: string,
        user: string
    })
};
