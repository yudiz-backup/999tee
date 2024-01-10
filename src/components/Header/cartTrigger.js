import React, { Fragment, Suspense, useState } from 'react';
import { shape, string } from 'prop-types';
import { useIntl } from 'react-intl';
import { useCartTrigger } from 'src/peregrine/lib/talons/Header/useCartTrigger';
import { mergeClasses } from '../../classify';
import defaultClasses from './cartTrigger.css';
import { GET_ITEM_COUNT_QUERY } from './cartTrigger.gql';
// import { useEffect } from 'react';
import { ShoppingCart as ShoppingCartIcon } from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';

const cartIcon = <Icon src={ShoppingCartIcon} size={20} />;

const MiniCart = React.lazy(() => import('../MiniCart'));

const CartTrigger = props => {

    const {
        handleLinkClick,
        handleTriggerClick,
        itemCount,
        miniCartRef,
        miniCartIsOpen,
        hideCartTrigger,
        setMiniCartIsOpen
    } = useCartTrigger({
        queries: {
            getItemCountQuery: GET_ITEM_COUNT_QUERY
        }
    });
    const [isCartEmptyFlag, setIsCartEmptyFlag] = useState(false)

    const classes = mergeClasses(defaultClasses, props.classes);
    const { formatMessage } = useIntl();
    const buttonAriaLabel = formatMessage(
        {
            id: 'cartTrigger.ariaLabel',
            defaultMessage:
                'Toggle mini cart. You have {count} items in your cart.'
        },
        { count: itemCount }
    );
    const itemCountDisplay = itemCount > 99 ? '99+' : itemCount;
    const triggerClassName = miniCartIsOpen
        ? classes.triggerContainer_open
        : classes.triggerContainer;

    const maybeItemCounter = itemCount ? (
        <span className={classes.counter}>{itemCountDisplay}</span>
    ) : null;
    const cartTrigger = hideCartTrigger ? null : (
        // Because this button behaves differently on desktop and mobile
        // we render two buttons that differ only in their click handler
        // and control which one displays via CSS.
        <Fragment>
            <div className={triggerClassName}>
                <button style={{ maxHeight: '20px', position: 'relative' }}
                    aria-label={buttonAriaLabel}
                    className={classes.trigger}
                    onClick={handleTriggerClick}
                >
                    {cartIcon}
                    {isCartEmptyFlag ? '' : maybeItemCounter}
                </button>
            </div>
            <button style={{ maxHeight: '20px', position: 'relative' }}
                aria-label={buttonAriaLabel}
                className={classes.link}
                onClick={handleLinkClick}
            >
                {cartIcon}
                {maybeItemCounter}
            </button>
            <div className={classes.home_leftbar}>
                <Suspense fallback={null}>
                    <MiniCart
                        isOpen={miniCartIsOpen}
                        setIsOpen={setMiniCartIsOpen}
                        ref={miniCartRef}
                        setIsCartEmptyFlag={setIsCartEmptyFlag}
                    />
                </Suspense>
            </div>
        </Fragment>
    );

    return cartTrigger;
};

export default CartTrigger;

CartTrigger.propTypes = {
    classes: shape({
        counter: string,
        link: string,
        openIndicator: string,
        root: string,
        trigger: string,
        triggerContainer: string
    })
};
