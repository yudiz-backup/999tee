import React from 'react';
import { FormattedMessage } from 'react-intl';
import { object, shape, string } from 'prop-types';
import { X as CloseIcon } from 'react-feather';
import { useEditModal } from 'src/peregrine/lib/talons/CheckoutPage/ShippingInformation/useEditModal';

import { mergeClasses } from '../../../classify';
import Icon from '../../Icon';
import { Portal } from '../../Portal';
import AddressForm from './AddressForm';
import defaultClasses from './editModal.css';

const EditModal = props => {
    const { classes: propClasses, shippingData, afterSubmit = () => {} } = props;
    const talonProps = useEditModal();
    const { handleClose, isOpen } = talonProps;

    const classes = mergeClasses(defaultClasses, propClasses);
    const rootClass = isOpen ? classes.root_open : classes.root;

    // Unmount the form to force a reset back to original values on close
    const bodyElement = isOpen ? (
        <AddressForm
            afterSubmit={(data) => {
                afterSubmit(data)
                handleClose()
            }}
            onCancel={handleClose}
            shippingData={shippingData}
        />
    ) : null;
    
    return (
        <Portal>
            <aside className={rootClass}>
                <div className={classes.header}>
                    <h4 className={classes.headerText}>
                        {shippingData && shippingData.id ? ('Edit Shipping Information') : ('Add new address')}
                    </h4>
                    <button
                        className={classes.closeButton}
                        onClick={handleClose}
                    >
                        <Icon src={CloseIcon} />
                    </button>
                </div>
                <div className={classes.body}>{bodyElement}</div>
            </aside>
        </Portal>
    );
};

export default EditModal;

EditModal.propTypes = {
    classes: shape({
        root: string,
        root_open: string,
        body: string,
        header: string,
        headerText: string
    }),
    shippingData: object
};
