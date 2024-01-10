import React from 'react';
import { shape, string } from 'prop-types';
import { MapPin } from 'react-feather';

import { useStoreSwitcher } from '../../peregrine/lib/talons/Header/useStoreSwitcher';

import { mergeClasses } from '../../classify';
import defaultClasses from './storeSwitcher.css';
import SwitcherItem from './switcherItem';
import storeSwitcherOperations from './storeSwitcher.gql';
import Icon from '../Icon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { Util } from '@magento/peregrine';

const StoreSwitcher = props => {
    const talonProps = useStoreSwitcher({
        ...storeSwitcherOperations
    });

    const {
        handleSwitchStore,
        allowGuestCheckout,
        currentStoreName,
        availableStores,
        storeMenuRef,
        storeMenuTriggerRef,
        storeMenuIsOpen,
        handleTriggerClick
    } = talonProps;

    const classes = mergeClasses(defaultClasses, props.classes);
    const menuClassName = storeMenuIsOpen ? classes.menu_open : classes.menu;
    const { BrowserPersistence } = Util;
    const storage = new BrowserPersistence();
    if (allowGuestCheckout && allowGuestCheckout != null) {
        storage.setItem('allowGuestCheckout', allowGuestCheckout);
    }

    if (!availableStores || availableStores.size <= 1) return null;

    const stores = [];

    availableStores.forEach((store, code) => {
        stores.push(
            <li key={code} className={classes.menuItem}>
                <SwitcherItem
                    active={store.isCurrent}
                    onClick={handleSwitchStore}
                    option={code}
                >
                    {store.storeName}
                </SwitcherItem>
            </li>
        );
    });
    return (
        <div className={classes.root}>
            <button
                aria-label="store-language-switch"
                onClick={handleTriggerClick}
                ref={storeMenuTriggerRef}
            >
                <span className={classes.trigger}>
                    <Icon src={MapPin} />
                    <span className={classes.label}>{currentStoreName}</span>
                    <span className={classes.select_img}>
                        <FontAwesomeIcon icon={faAngleDown} />
                    </span>
                </span>
            </button>
            <div ref={storeMenuRef} className={menuClassName}>
                <ul>{stores}</ul>
            </div>
            <div className={classes.overlay} />
        </div>
    );
};

export default StoreSwitcher;

StoreSwitcher.propTypes = {
    classes: shape({
        root: string,
        trigger: string,
        menu: string,
        menu_open: string,
        menuItem: string
    })
};
