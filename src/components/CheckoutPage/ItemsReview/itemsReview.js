import React, { useState, useEffect/* , useCallback  */ } from 'react';
import { FormattedMessage } from 'react-intl';

import { useItemsReview } from '../../../peregrine/lib/talons/CheckoutPage/ItemsReview/useItemsReview';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Item from './item';
import ShowAllButton from './showAllButton';
import LoadingIndicator from '../../LoadingIndicator';
import { mergeClasses } from '../../../classify';
// import { faAngleUp } from '@fortawesome/free-solid-svg-icons';
import LIST_OF_PRODUCTS_IN_CART_QUERY from './itemsReview.gql';

import defaultClasses from './itemsReview.css';
import defaultClasse from './showAllButton.css';

import { ChevronUp as ArrowUp } from 'react-feather';
import Icon from '../../Icon';

/**
 * Renders a list of items in an order.
 * @param {Object} props.data an optional static data object to render instead of making a query for data.
 */
const ItemsReview = props => {
    const { classes: propClasses,
        allCartGiftWrapper,
        openModal,
        setOpenModel,
        giftModal,
        setSelectedItem,
        selectedItem,
        giftWrapperData,
        wrapperStatusPerItem,
        isDisplayOnlyMode = false,
        setIsPriceSummaryLoading = () => { },
        setIsDeleteItemLoading = () => { },
        setTotalQty = () => { },
        isDeleteItemLoading
    } = props;
    const [isItemDeleted, setIsItemDeleted] = useState(false)
    const [isItemUpdated, setIsItemUpdates] = useState(false)

    const classes = mergeClasses(defaultClasses, propClasses);

    const talonProps = useItemsReview({
        queries: {
            getItemsInCart: LIST_OF_PRODUCTS_IN_CART_QUERY
        },
        data: props.data,
        isItemDeleted,
        setIsItemDeleted,
        isItemUpdated,
        setIsItemUpdates
    });

    const {
        items: itemsInCart = [],
        // totalQuantity,
        showAllItems,
        setShowAllItems,
        isLoading
    } = talonProps;
    const items = itemsInCart.length ? itemsInCart.map((item, index) => {
        return <>
            <Item
                key={`${item.id} ${itemsInCart.length}`}
                itme={item}
                {...item}
                ItemID={item.id}
                isHidden={!showAllItems && index >= 1}
                allCartGiftWrapper={allCartGiftWrapper}
                openModal={openModal}
                setOpenModel={setOpenModel}
                setSelectedItem={setSelectedItem}
                selectedItem={selectedItem}
                giftWrapperData={giftWrapperData}
                wrapperStatusPerItem={wrapperStatusPerItem}
                isDisplayOnlyMode={isDisplayOnlyMode}
                setIsPriceSummaryLoading={setIsPriceSummaryLoading}
                setIsDeleteItemLoading={setIsDeleteItemLoading}
                itemsInCart={itemsInCart}
                setIsItemDeleted={setIsItemDeleted}
                setIsItemUpdates={setIsItemUpdates}
            />
        </>
    }) : (<></>);


    const handleClickk = () => {
        setShowAllItems(!showAllItems)
    }
    const showAllItemsFooter = !showAllItems && items.length > 1 ? (
        <ShowAllButton setShowAllItems={setShowAllItems} showAllItems={showAllItems} isArrowDownIcon={!showAllItems} />
    ) : items.length > 1 ? (
        <button className={defaultClasse.root} onClick={handleClickk}>
            <span className={defaultClasse.content}>
                <span className={defaultClasse.text}>
                    HIDE ALL ITEMS
                </span>
                <Icon
                    src={ArrowUp}
                    defaultClasse={{
                        root: defaultClasse.arrowDown
                    }}
                />
            </span>
        </button>
    ) : (<>
    </>);

    const getClassNameForItemsWrapper = () => {
        if (
            itemsInCart.length === 1 ||
            (itemsInCart.length > 1 && !showAllItems)
        ) {
            return classes.active_items_container_for_one_item;
        }
        return classes.active_items_container;
    };
    const [show/* , setShow */] = useState(false);
    // const handleClick = () => {
    //     setShow(!show);
    // };
    const contentsContainerClass = show
        ? classes.contents_container
        : null;

    useEffect(() => {
        setTimeout(() => {
            setIsDeleteItemLoading(false)
        }, 6000)
    }, [isDeleteItemLoading])


    const itmesQuantity = itemsInCart?.reduce((acc, item) => {
        return acc + (+item?.qty_ordered || +item?.quantity)
    }, 0)
    useEffect(() => {
        if (itmesQuantity) {
            setTotalQty(itmesQuantity)
        }
    }, [itmesQuantity])

    if (isLoading) {
        return (
            <LoadingIndicator>
                <FormattedMessage
                    id={'checkoutPage.fetchingItemsInYourOrder'}
                    defaultMessage={'Fetching Items in your Order'}
                />
            </LoadingIndicator>
        );
    }

    return (
        <div className={classes.items_review_container + ' ' + 'hello_test'}>
            <div className={classes.total_quantity}>
                <span className={classes.total_quantity_amount}>
                    {itmesQuantity || items?.length}
                </span>
                <FormattedMessage
                    id={'checkoutPage.itemsInYourOrder'}
                    defaultMessage={' items in your order'}
                />
            </div>
            <div
                className={
                    classes.items_container +
                    ' ' +
                    getClassNameForItemsWrapper() +
                    ' ' +
                    contentsContainerClass
                }
            >
                {isDeleteItemLoading ? <LoadingIndicator/> : items}
            </div>
            {giftModal}
            {showAllItemsFooter}
        </div>
    );
};

export default ItemsReview;
