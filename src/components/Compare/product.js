import React, { useState, Suspense, useCallback, useContext } from 'react';
import { Link } from 'src/drivers';
import defaultClasses from '../Gallery/item.css';
import { useToasts } from '@magento/peregrine';
import { ADD_SIMPLE_MUTATION } from '../../components/ProductFullDetail/productFullDetail.gql';
import CREATE_CART_MUTATION from '../../queries/createCart.graphql';
import GET_CART_DETAILS_QUERY from '../../queries/getCartDetails.graphql';
import { FormattedMessage } from 'react-intl';
import PriceRange from '../PriceRange';
import proClasses from '../ProductFullDetail/productFullDetail.css';
import { useCategoryAddToCart } from '../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { globalContext } from '../../peregrine/lib/context/global';
import { handleCartNotification } from '../../util/helperFunction';
const Wishlist = React.lazy(() => import('../MyWishlist/wishlist'));

function Product(props) {
    const { value, index, classes, handleRemoveCompare, refetch } = props;

    const [showAlertMsg, setShowAlertMsg] = useState(false);
    const [loaderName, setLoaderName] = useState('');

    const { dispatch } = useContext(globalContext);

    const catProps = useCategoryAddToCart({
        addSimpleProductToCartMutation: ADD_SIMPLE_MUTATION,
        createCartMutation: CREATE_CART_MUTATION,
        getCartDetailsQuery: GET_CART_DETAILS_QUERY,
        setShowAlertMsg
    });
    const [, { addToast }] = useToasts();

    const { handleAddToCart, isAddingItem, success, errorMessage } = catProps;
    const responseToast = useCallback(() => {
        if (success && showAlertMsg && !isAddingItem) {
            // addToast({
            //     type: 'info',
            //     message: value.product.name + ' added to the cart.',
            //     dismissable: true,
            //     timeout: 5000
            // });
            setShowAlertMsg(false);
            handleCartNotification(true, dispatch, value?.product?.name)
        }
        if (errorMessage && showAlertMsg && !isAddingItem) {
            addToast({
                type: 'error',
                message: errorMessage ? errorMessage : 'error',
                dismissable: true,
                timeout: 5000
            });
            setShowAlertMsg(false);
        }
    }, [
        success,
        showAlertMsg,
        isAddingItem,
        errorMessage,
        addToast,
        value.product.name,
        dispatch
    ]);

    if (showAlertMsg) {
        responseToast();
    }
    return (
        <div
            key={index}
            data-th="Product"
            className={
                classes.cell +
                ' ' +
                classes.product +
                ' ' +
                classes.attribute_head
            }
        >
            <div>
                <div className={classes.remove_wrap + ' ' + 'border-0'}>
                    <div
                        className={
                            classes.cell +
                            ' ' +
                            classes.remove +
                            ' ' +
                            classes.hidden_print
                        }
                    >
                        <button
                            onClick={() => {
                                handleRemoveCompare(value.product.id);
                                refetch();
                            }}
                        >
                            <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                    </div>
                </div>
            </div>
            <div
                className={
                    classes.product_item_wishlist_Wrap +
                    ' ' +
                    'position-relative'
                }
            >
                <a
                    className={classes.product_item_photo}
                    href={
                        value.product.url_key +
                        (value.product.url_suffix
                            ? value.product.url_suffix
                            : '')
                    }
                    title={value.product.name}
                >
                    <span className={classes.product_image_container}>
                        <span className={classes.product_image_wrapper}>
                            <img
                                className={classes.product_image_photo}
                                src={value.product.small_image.url}
                                loading="lazy"
                                width="100"
                                height="100"
                                alt={value.product.name}
                            />
                        </span>
                    </span>
                </a>
                <Suspense fallback={<div>Loading...</div>}>
                    <Wishlist value={value.product} />
                </Suspense>
            </div>
            <strong className={classes.product_item_name}>
                <a
                    href={
                        value.product.url_key +
                        (value.product.url_suffix
                            ? value.product.url_suffix
                            : '')
                    }
                    title={value.product.name}
                >
                    {value.product.name}{' '}
                </a>
            </strong>
            <div
                className={classes.price_box + ' ' + classes.price_final_price}
            >
                <PriceRange
                    price={value.product.price_range}
                    optionFlag={false}
                    product={value.product}
                />
            </div>
            <div
                className={
                    classes.product_reviews_summary + ' ' + classes.short
                }
            >
                <div className={classes.rating_summary}>
                    <div
                        className={classes.rating_result}
                        id="rating-result_308"
                        title={value.product.rating_summary + '%'}
                    >
                        <span
                            className={
                                proClasses.review_stars_wrapper +
                                ' ' +
                                'position-relative'
                            }
                        >
                            <span
                                className={proClasses.not_reviewed}
                                style={{
                                    width: value.product.rating_summary + '%'
                                }}
                            >
                                <FontAwesomeIcon icon={faStar} />
                                <FontAwesomeIcon icon={faStar} />
                                <FontAwesomeIcon icon={faStar} />
                                <FontAwesomeIcon icon={faStar} />
                                <FontAwesomeIcon icon={faStar} />
                            </span>
                            <span className={proClasses.reviewed}>
                                <FontAwesomeIcon icon={faStar} />
                                <FontAwesomeIcon icon={faStar} />
                                <FontAwesomeIcon icon={faStar} />
                                <FontAwesomeIcon icon={faStar} />
                                <FontAwesomeIcon icon={faStar} />
                            </span>
                        </span>
                        <a
                            className={
                                classes.action + ' ' + classes.review_num_action
                            }
                            href={
                                value.product.url_key +
                                (value.product.url_suffix
                                    ? value.product.url_suffix
                                    : '')
                            }
                        >
                            ({value.product.review_count})
                        </a>
                    </div>
                </div>
            </div>

            <div
                className={
                    classes.product_item_actions + ' ' + classes.hidden_print
                }
            >
                <div className={classes.actions_primary}>
                    {value.product.__typename == 'SimpleProduct' &&
                        value.product.stock_status == 'IN_STOCK' &&
                        value.product.options == null && (
                            <button
                                className={
                                    defaultClasses.add_to_cart_btn +
                                    ' ' +
                                    'w-100 p-2'
                                }
                                onClick={() => {
                                    handleAddToCart(value.product);
                                    setLoaderName(value.name);
                                }}
                            >
                                <FormattedMessage
                                    id={'item.add_to_cart_btn'}
                                    defaultMessage={'Add to cart'}
                                />
                            </button>
                        )}
                    {value.product.__typename == 'SimpleProduct' &&
                        value.product.stock_status == 'IN_STOCK' &&
                        value.product.options !== null && (
                            <Link
                                to={
                                    value.product.url_key +
                                    (value.product.url_suffix
                                        ? value.product.url_suffix
                                        : '')
                                }
                                className={
                                    defaultClasses.add_to_cart_btn +
                                    ' ' +
                                    'w-100 p-2'
                                }
                            >
                                <FormattedMessage
                                    id={'item.add_to_cart_btn_SimpleProduct'}
                                    defaultMessage={'Add to cart'}
                                />
                            </Link>
                        )}
                    {value.product.__typename == 'SimpleProduct' &&
                        value.product.stock_status != 'IN_STOCK' && (
                            <Link
                                to={
                                    value.product.url_key +
                                    (value.product.url_suffix
                                        ? value.product.url_suffix
                                        : '')
                                }
                                className={
                                    defaultClasses.add_to_cart_btn +
                                    ' ' +
                                    'w-100 p-2'
                                }
                            >
                                <FormattedMessage
                                    id={'item.add_to_cart_btn_SimpleProduct'}
                                    defaultMessage={'Add to cart'}
                                />
                            </Link>
                        )}
                    {value.product.__typename != 'SimpleProduct' && (
                        <Link
                            to={
                                value.product.url_key +
                                (value.product.url_suffix
                                    ? value.product.url_suffix
                                    : '')
                            }
                            className={
                                defaultClasses.add_to_cart_btn +
                                ' ' +
                                'w-100 p-2'
                            }
                        >
                            <FormattedMessage
                                id={'item.add_to_cart_btn_ConfigurableProduct'}
                                defaultMessage={'Add to cart'}
                            />
                        </Link>
                    )}
                    {isAddingItem && value.name == loaderName && (
                        <div
                            className={
                                proClasses.modal +
                                ' ' +
                                proClasses.modal_active +
                                ' ' +
                                defaultClasses.modal_active +
                                ' ' +
                                classes.modal_active
                            }
                        >
                            <div className={proClasses.loader_div}>
                                <div className={proClasses.ball_pulse}>
                                    <div />
                                    <div />
                                    <div />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Product;
