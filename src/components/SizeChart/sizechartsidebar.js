import React /*, { Fragment, useEffect }  */ from 'react';
import {
    /*  Lock as LockIcon,
     AlertCircle as AlertCircleIcon, */
    X as ClearIcon
} from 'react-feather';
import { bool, shape, string } from 'prop-types';
// import { /* FormattedMessage, */ useIntl } from 'react-intl';

import RichContent from '@magento/venia-ui/lib/components/RichContent'


// import { useScrollLock, /* Price, useToasts */ } from '@magento/peregrine';
// import { useMiniCart } from 'src/peregrine/lib/talons/MiniCart/useMiniCart';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
// import Button from '../Button';
import Icon from '../Icon';
// import StockStatusMessage from '../StockStatusMessage';
// import ProductList from './ProductList';
import defaultClasses from '../MiniCart/miniCart.css';
// import MiniCartOperations from './miniCart.gql';
// import MiniCartOperations from '../MiniCart/miniCart.gql';
// import { useUserContext } from '@magento/peregrine/lib/context/user';
// import { useCartPage } from '../../peregrine/lib/talons/CartPage/useCartPage';
// import { GET_CART_DETAILS } from '../CartPage/cartPage.gql';
// import { useCrossSellProduct } from '../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
// import crossSellQuery from '../../queries/getCrossSellProducts.graphql';
// import CrossSellProducts from '../CartPage/linkedProducts';
// import PriceSummary from '../CartPage/PriceSummary/priceSummary';
// import { globalContext } from '../../peregrine/lib/context/global';
// import FreeShippingBar from '../FreeShippingBar'
// import { Accordion, Section } from '../Accordion';
// import { GET_CART_DETAILS_QUERY } from '../SignIn/signIn.gql';


const clearIcon = <Icon src={ClearIcon} size={24} />;
// const errorIcon = <Icon src={AlertCircleIcon} size={20} />;

/**
 * The MiniCart component shows a limited view of the user's cart.
 *
 * @param {Boolean} props.isOpen - Whether or not the MiniCart should be displayed.
 * @param {Function} props.setIsOpen - Function to toggle mini cart
 */
const MiniCart = React.forwardRef((props, ref) => {
    const { isOpen, /* setIsOpen */ } = props;
    // const [{ isSignedIn }] = useUserContext();
    // const { formatMessage } = useIntl();

    // Prevent the page from scrolling in the background
    // when the MiniCart is open.
    // useScrollLock(isOpen);

    // const cartProp = useCartPage({
    //     queries: {
    //         getCartDetails: GET_CART_DETAILS
    //     }
    // });

    // const { cartItems } = cartProp;

    // const { crossSellData } = useCrossSellProduct({
    //     query: crossSellQuery,
    //     cartItems
    // });

    // const talonPropsPriceSummery = useCartPage({
    //     queries: {
    //         getCartDetails: GET_CART_DETAILS_QUERY
    //     }
    // });

    // const {
    //     cartDetails
    // } = talonPropsPriceSummery;

    // const { state } = React.useContext(globalContext);

    // const allowGuestCheckout = 1;

    const classes = mergeClasses(defaultClasses, props.classes);
    const rootClass = isOpen ? classes.root_open : classes.root;
    const contentsClass = isOpen ? classes.contents_open : classes.contents;
    // const quantityClassName = loading
    //     ? classes.quantity_loading
    //     : classes.quantity;
    // const priceClassName = loading ? classes.price_loading : classes.price;

    // const isCartEmpty = !(productList && productList.length);
    // const isProductStockStatus =
    //     productList &&
    //     productList.map(
    //         stockStauts =>
    //             stockStauts &&
    //             stockStauts.product &&
    //             stockStauts.product.stock_status
    //     );

    // const [, { addToast }] = useToasts();

    // useEffect(() => {
    //     if (errorMessage) {
    //         addToast({
    //             type: 'error',
    //             icon: errorIcon,
    //             message: errorMessage,
    //             dismissable: true,
    //             timeout: 7000
    //         });
    //     }
    // }, [addToast, errorMessage]);

    // const header = subTotal ? (
    //     <Fragment>
    //         <Accordion>
    //             <Section
    //                 id="spend_your_points"
    //                 title={formatMessage({
    //                     id:
    //                         'checkoutPage.priceSummary',
    //                     defaultMessage:
    //                         'Price Summary'
    //                 })}
    //             >
    //                 <PriceSummary
    //                     isFromMiniCart={true}
    //                     state={state}
    //                     minicartTotal={subTotal.value}
    //                     // cartDetails={cartDetails}
    //                 />
    //             </Section>
    //         </Accordion>

    //     </Fragment>
    // ) : null;

    // const handleLoginTrigger = () => {
    //     document.getElementById('user_account').click();
    // };

    // const checkoutPageTrigger = () => {
    //     if (isSignedIn) {
    //         handleProceedToCheckout();
    //     } else {
    //         {
    //             if (typeof allowGuestCheckout != 'undefined') {
    //                 allowGuestCheckout == 1
    //                     ? handleProceedToCheckout()
    //                     : handleLoginTrigger();
    //             } else {
    //                 handleProceedToCheckout();
    //             }
    //         }
    //     }
    // };
    const contents = (
        <div className={classes.emptyCart + ' ' + classes.body}>
            <div className={classes.header + ' ' + classes.minicarT_header}>
                <span>Size Chart</span>
                <button onClick={() => props.setIsOpen(false)} type='button'>{clearIcon}</button>
            </div>
            <RichContent html={props.sizeChartContent} />
        </div>
    )

    return (
        <aside className={rootClass}>
            <div ref={ref} className={contentsClass}>
                {contents}
            </div>
        </aside>
    );
});

export default MiniCart;

MiniCart.propTypes = {
    classes: shape({
        root: string,
        root_open: string,
        contents: string,
        contents_open: string,
        header: string,
        body: string,
        footer: string,
        checkoutButton: string,
        editCartButton: string,
        emptyCart: string,
        emptyMessage: string,
        stockStatusMessageContainer: string
    }),
    isOpen: bool
};
