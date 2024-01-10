import React from 'react';
import { shape, string } from 'prop-types';

import { useCurrencySwitcher } from '../../peregrine/lib/talons/Header/useCurrencySwitcher';

import { mergeClasses } from '../../classify';
import defaultClasses from './currencySwitcher.css';
import SwitcherItem from './switcherItem';
import CurrencySymbol from '../CurrencySymbol';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

const CurrencySwitcher = props => {
    const {
        handleSwitchCurrency,
        currentCurrencyCode,
        availableCurrencies,
        currencyMenuRef,
        currencyMenuTriggerRef,
        currencyMenuIsOpen,
        handleTriggerClick
    } = useCurrencySwitcher();

    const classes = mergeClasses(defaultClasses, props.classes);
    const menuClassName = currencyMenuIsOpen ? classes.menu_open : classes.menu;

    const currencySymbol = {
        currency: classes.symbol
    };

    if (!availableCurrencies || availableCurrencies.length === 1) return null;

    const currencies = availableCurrencies.map(code => {
        return (
            <li key={code} className={classes.menuItem}>
                <SwitcherItem
                    active={code === currentCurrencyCode}
                    onClick={handleSwitchCurrency}
                    option={code}
                >
                    <CurrencySymbol
                        classes={currencySymbol}
                        currencyCode={code}
                        currencyDisplay={'narrowSymbol'}
                    />
                    {code}
                </SwitcherItem>
            </li>
        );
    });

    return (
        <div className={classes.root}>
            <button
                className={classes.trigger}
                aria-label={currentCurrencyCode}
                onClick={handleTriggerClick}
                ref={currencyMenuTriggerRef}
            >
                <CurrencySymbol
                    classes={currencySymbol}
                    currencyCode={currentCurrencyCode}
                    currencyDisplay={'narrowSymbol'}
                />
                <span className={classes.label}>{currentCurrencyCode}</span>
                <span className={classes.select_img}>
                    <FontAwesomeIcon icon={faAngleDown} />
                </span>
            </button>
            <div ref={currencyMenuRef} className={menuClassName}>
                <ul>{currencies}</ul>
            </div>
            <div className={classes.overlay} />
        </div>
    );
};

export default CurrencySwitcher;

CurrencySwitcher.propTypes = {
    classes: shape({
        root: string,
        trigger: string,
        menu: string,
        menu_open: string,
        menuItem: string,
        symbol: string
    })
};
