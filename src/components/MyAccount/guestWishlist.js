import React, { useState, useEffect, useContext } from 'react';
import { shape, string } from 'prop-types';
import GET_CUSTOMER_QUERY from '../../queries/getCustomer.graphql';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { Link, resourceUrl, Redirect } from 'src/drivers';
import defaultClasses from './myAccount.css';
import wishlistClasses from './guestWishlist.css';
import searchClasses from '../SearchPage/searchPage.css';
import Sidebar from './sidebar.js';
import accountClasses from './accountinformation.css';
import {
    useWishlist,
    useDeleteFromWishlist
} from '../../peregrine/lib/talons/MyAccount/useDashboard';
import WishListQuery from '../../queries/getWishlist.graphql';
import REMOVE_FROM_WISHLIST_MUTATION from '../../queries/removeFromWishlist.graphql';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    // faTrashAlt,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { Trash as TrashIcon } from 'react-feather';
import { useCategoryAddToCart } from '../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import WishlistSkelton from './WishlistSkeleton.js';
import LoadingIndicator from '../LoadingIndicator';
import { useToasts } from '@magento/peregrine';
import { FormattedMessage } from 'react-intl';
import { useGetScopeCache } from '../../peregrine/lib/talons/Home/useHome';
import ADD_SIMPLE_MUTATION from '../../queries/addSimpleProductsToCart.graphql';
import CREATE_CART_MUTATION from '../../queries/createCart.graphql';
import GET_CART_DETAILS_QUERY from '../../queries/getCartDetails.graphql';
import { Title } from '../Head';
import Icon from '../Icon';
import { guestWishlistRemoveFromLocalStorage } from '../../util/helperFunction';
import { globalContext } from '../../peregrine/lib/context/global.js';

const GuestWishList = props => {
    const [, { addToast }] = useToasts();
    const { state, dispatch } = useContext(globalContext);
    const { wishlistCount = 0 } = state || {};
    const classes = mergeClasses(
        defaultClasses,
        props.classes,
        wishlistClasses
    );

    const [resultGuestWishlistData, setResultGuestWishlistData] = useState();
    const [wantToRemoveDataDetail, setWantToRemoveDataDetail] = useState();

    const guestWishlistData = resultGuestWishlistData
        ? JSON.parse(resultGuestWishlistData)
        : [];

    const wishlistProps = useWishlist({
        query: WishListQuery
    });

    const deleteData = useDeleteFromWishlist({
        query: REMOVE_FROM_WISHLIST_MUTATION,
        customerQuery: GET_CUSTOMER_QUERY
    });
    const { removing } = deleteData;
    const catProps = useCategoryAddToCart({
        addSimpleProductToCartMutation: ADD_SIMPLE_MUTATION,
        createCartMutation: CREATE_CART_MUTATION,
        getCartDetailsQuery: GET_CART_DETAILS_QUERY
    });
    const { /* handleAddToCart */ } = catProps;
    let productUrlSuffix = '';

    const { config } = useGetScopeCache();
    if (
        config &&
        config.product_url_suffix &&
        config.product_url_suffix != 'null'
    ) {
        productUrlSuffix = config.product_url_suffix;
    }
    const { isSignedIn, loading } = wishlistProps;

    const remove = async id => {
        guestWishlistRemoveFromLocalStorage(id);
        setResultGuestWishlistData(localStorage.getItem('guest_wishlist'));
    };

    useEffect(() => {
        if (!resultGuestWishlistData) {
            setResultGuestWishlistData(localStorage.getItem('guest_wishlist'));
        }
    }, []);

    useEffect(() => {
        if (wishlistCount !== guestWishlistData?.length) {
            setResultGuestWishlistData(localStorage.getItem('guest_wishlist'));
        }
    }, [wishlistCount])

    useEffect(() => {
        if (!isSignedIn) {
            const result = resultGuestWishlistData
                ? JSON.parse(resultGuestWishlistData)
                : [];
            dispatch({
                type: 'WISHLIST_COUNT',
                payload: result.length || 0
            });
        }
    }, [resultGuestWishlistData]);

    useEffect(() => {
        if (wantToRemoveDataDetail && wantToRemoveDataDetail.name) {
            addToast({
                type: 'info',
                message: `${wantToRemoveDataDetail.name
                    } removed from wishlist.`,
                dismissable: true,
                timeout: 5000
            });
            setWantToRemoveDataDetail();
        }
    }, [wantToRemoveDataDetail]);

    if (isSignedIn) {
        return <Redirect to="/wishlist" />;
    }

    if (!loading) {
        return (
            <div className={defaultClasses.columns}>
                <Title>{`My WishList`}</Title>
                {removing && (
                    <div className={accountClasses.indicator_loader}>
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
                                <div
                                    className={
                                        wishlistClasses.guestWishlist_contentBar
                                    }
                                >
                                    <div
                                        className={
                                            defaultClasses.page_title_wrapper
                                        }
                                    >
                                        <h1
                                            className={
                                                defaultClasses.page_title
                                            }
                                        >
                                            <span
                                                className={defaultClasses.base}
                                            >
                                                <FormattedMessage
                                                    id={'myWishlist.page_title'}
                                                    defaultMessage={
                                                        'My Wish List'
                                                    }
                                                />
                                            </span>
                                        </h1>
                                    </div>
                                    <div
                                        className={
                                            defaultClasses.block_dashboard_orders +
                                            ' ' +
                                            wishlistClasses.block_dahsboard_wishlist
                                        }
                                    >
                                        {guestWishlistData.length ? (
                                            <div
                                                className={
                                                    classes.products_wrapper
                                                }
                                            >
                                                {guestWishlistData.map(
                                                    (product, index) => {
                                                        return (
                                                            <div
                                                                key={index}
                                                                className={
                                                                    classes.product_tiles
                                                                }
                                                            >
                                                                <div
                                                                    className={
                                                                        classes.inner
                                                                    }
                                                                >
                                                                    <div
                                                                        className={
                                                                            classes.product_img
                                                                        }
                                                                    >
                                                                        <Link
                                                                            to={
                                                                                product &&
                                                                                    product.url_key
                                                                                    ? resourceUrl(
                                                                                        product[
                                                                                        'url_key'
                                                                                        ] +
                                                                                        productUrlSuffix
                                                                                    )
                                                                                    : product.urlKey && product.urlSuffix ? resourceUrl(
                                                                                        product.urlKey + product.urlSuffix
                                                                                    ) : resourceUrl(
                                                                                        product[
                                                                                        'urlkey'
                                                                                        ]
                                                                                    )
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    product &&
                                                                                        product.small_image &&
                                                                                        product
                                                                                            .small_image
                                                                                            .url
                                                                                        ? product
                                                                                            .small_image
                                                                                            .url
                                                                                        : product.small_image
                                                                                            ? product.small_image
                                                                                            : product.thumbnail &&
                                                                                                product
                                                                                                    .thumbnail
                                                                                                    .url
                                                                                                ? product
                                                                                                    .thumbnail
                                                                                                    .url
                                                                                                : product.image
                                                                                }
                                                                                alt="smallimage"
                                                                                className={
                                                                                    'img-fluid'
                                                                                }
                                                                                height="282"
                                                                                width="420"
                                                                            />
                                                                        </Link>
                                                                        <div
                                                                            className={
                                                                                classes.delete_icon
                                                                            }
                                                                        >
                                                                            <button
                                                                                id={
                                                                                    product.id
                                                                                }
                                                                                onClick={() => {
                                                                                    setWantToRemoveDataDetail(
                                                                                        product
                                                                                    );
                                                                                    remove(
                                                                                        product.id
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <span
                                                                                    className={
                                                                                        classes.delete_text
                                                                                    }
                                                                                >
                                                                                    <Icon
                                                                                        src={
                                                                                            TrashIcon
                                                                                        }
                                                                                        attrs={{
                                                                                            width: 15
                                                                                        }}
                                                                                    />
                                                                                </span>
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    <div
                                                                        className={
                                                                            classes.product_details
                                                                        }
                                                                    >
                                                                        <div
                                                                            className={
                                                                                classes.product_name
                                                                            }
                                                                        >
                                                                            <Link
                                                                                to={resourceUrl(
                                                                                    product[
                                                                                    'url_key'
                                                                                    ] +
                                                                                    productUrlSuffix
                                                                                )}
                                                                            >
                                                                                {
                                                                                    product.name
                                                                                }
                                                                            </Link>
                                                                        </div>
                                                                        <div
                                                                            className={
                                                                                classes.price_items
                                                                            }
                                                                        >
                                                                            {product &&
                                                                                product.type &&
                                                                                product.type ===
                                                                                'simple' &&
                                                                                product.final_price ? (
                                                                                <span>
                                                                                    {
                                                                                        product.final_price
                                                                                    }
                                                                                </span>
                                                                            ) : product &&
                                                                                product.specialPrice &&
                                                                                product.regularPrice ? (
                                                                                <div>
                                                                                    <span
                                                                                        className={
                                                                                            classes.specialPrice
                                                                                        }
                                                                                    >
                                                                                        ₹
                                                                                        {parseFloat(
                                                                                            product.specialPrice
                                                                                        ).toFixed(
                                                                                            2
                                                                                        )}
                                                                                    </span>
                                                                                    <span
                                                                                        className={
                                                                                            classes.regularPrice
                                                                                        }
                                                                                    >
                                                                                        ₹
                                                                                        {parseFloat(
                                                                                            product.regularPrice
                                                                                        ).toFixed(
                                                                                            2
                                                                                        )}
                                                                                    </span>
                                                                                </div>
                                                                            ) : (
                                                                                <div>
                                                                                    <span
                                                                                        className={
                                                                                            classes.price_label
                                                                                        }
                                                                                    >
                                                                                        ₹{' '}
                                                                                    </span>
                                                                                    <span
                                                                                        className={
                                                                                            classes.price
                                                                                        }
                                                                                    >
                                                                                        {product &&
                                                                                            product.specialPrice
                                                                                            ? parseFloat(
                                                                                                product.specialPrice
                                                                                            ).toFixed(
                                                                                                2
                                                                                            )
                                                                                            : product &&
                                                                                                product.regularPrice
                                                                                                ? parseFloat(
                                                                                                    product.regularPrice
                                                                                                ).toFixed(
                                                                                                    2
                                                                                                )
                                                                                                : product &&
                                                                                                    product.price_range &&
                                                                                                    product
                                                                                                        .price_range
                                                                                                        .maximum_price &&
                                                                                                    product
                                                                                                        .price_range
                                                                                                        .maximum_price
                                                                                                        .regular_price &&
                                                                                                    product
                                                                                                        .price_range
                                                                                                        .maximum_price
                                                                                                        .regular_price
                                                                                                        .value
                                                                                                    ? parseFloat(
                                                                                                        product
                                                                                                            .price_range
                                                                                                            .maximum_price
                                                                                                            .regular_price
                                                                                                            .value
                                                                                                    ).toFixed(
                                                                                                        2
                                                                                                    )
                                                                                                    : product && product.unitPrice ? parseFloat(
                                                                                                        product.unitPrice
                                                                                                    ).toFixed(
                                                                                                        2
                                                                                                    ) : product?.price ?
                                                                                                        product?.price?.regularPrice?.amount?.value !==
                                                                                                            product?.price?.minimalPrice?.amount?.value ?
                                                                                                            product?.price?.regularPrice?.amount?.value + "-" +
                                                                                                            product?.price?.minimalPrice?.amount?.value :
                                                                                                            product?.price?.regularPrice?.amount?.value
                                                                                                        : ''}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {/* <div className={classes.wishlist_quantity}>
                                                                    <Quantity
                                                                        initialValue={quantity}
                                                                        onValueChange={(value) =>
                                                                            handleSetQuantity(value, val.product.sku)
                                                                        }
                                                                    />

                                                                </div> */}
                                                                    {/* <div className={classes.actions_wrapper}>
                                                                    <div className={classes.add_btn_wrap}>
                                                                        {product.__typename ==
                                                                            "SimpleProduct" && (
                                                                                <button
                                                                                    onClick={() => {
                                                                                        handleAddToCart(product);
                                                                                        remove(product.id);
                                                                                    }}
                                                                                >
                                                                                    <span className={classes.add_btn}>
                                                                                        <FormattedMessage
                                                                                            id={"myWishlist.moveToCartBtn"}
                                                                                            defaultMessage={"Move to cart"}
                                                                                        />
                                                                                    </span>
                                                                                </button>
                                                                            )}
                                                                        {product.__typename !=
                                                                            "SimpleProduct" && (
                                                                                <Link
                                                                                    to={resourceUrl(
                                                                                        product["url_key"] +
                                                                                        productUrlSuffix
                                                                                    )}
                                                                                    className={classes.add_btn}
                                                                                >
                                                                                    <FormattedMessage
                                                                                        id={"myWishlist.moveToCartBtn"}
                                                                                        defaultMessage={"Move to cart"}
                                                                                    />
                                                                                </Link>
                                                                            )}
                                                                    </div>
                                                                </div> */}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        ) : (
                                            <div
                                                className={
                                                    searchClasses.noResult
                                                }
                                            >
                                                <span
                                                    className={
                                                        searchClasses.noResult_icon
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={
                                                            faExclamationTriangle
                                                        }
                                                    />
                                                </span>
                                                <span
                                                    className={
                                                        'ml-2' +
                                                        ' ' +
                                                        searchClasses.noResult_text
                                                    }
                                                >
                                                    <FormattedMessage
                                                        id={
                                                            'myWishlist.noResult_text'
                                                        }
                                                        defaultMessage={
                                                            'You have no items saved in wishlist.'
                                                        }
                                                    />
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className={defaultClasses.columns}>
                <Title>{`My WishList`}</Title>
                {removing && (
                    <div className={accountClasses.indicator_loader}>
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
                                <div
                                    className={
                                        wishlistClasses.guestWishlist_contentBar
                                    }
                                >
                                    <div
                                        className={
                                            defaultClasses.page_title_wrapper
                                        }
                                    >
                                        <h1
                                            className={
                                                defaultClasses.page_title
                                            }
                                        >
                                            <span
                                                className={defaultClasses.base}
                                            >
                                                <FormattedMessage
                                                    id={'myWishlist.page_title'}
                                                    defaultMessage={
                                                        'My Wish List'
                                                    }
                                                />
                                            </span>
                                        </h1>
                                    </div>
                                    <div>
                                        <WishlistSkelton />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

export default GuestWishList;

GuestWishList.propTypes = {
    classes: shape({
        actions: string,
        root: string,
        subtitle: string,
        title: string,
        user: string
    })
};
