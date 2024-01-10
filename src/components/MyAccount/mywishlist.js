import React, { useState, useEffect, useContext } from "react";
import { shape, string } from "prop-types";
import GET_CUSTOMER_QUERY from "../../queries/getCustomer.graphql";
import { mergeClasses } from "@magento/venia-ui/lib/classify";
import { Link, resourceUrl, Redirect } from "src/drivers";
import defaultClasses from "./myAccount.css";
import wishlistClasses from "./mywishlist.css";
import searchClasses from "../SearchPage/searchPage.css";
import Sidebar from "./sidebar.js";
import accountClasses from "./accountinformation.css";
import {
    useWishlist,
    useDeleteFromWishlist,
} from "../../peregrine/lib/talons/MyAccount/useDashboard";
import WishListQuery from "../../queries/getWishlist.graphql";
import REMOVE_FROM_WISHLIST_MUTATION from "../../queries/removeFromWishlist.graphql";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    // faTrashAlt,
    faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import { Trash as TrashIcon } from 'react-feather';
// import { useCategoryAddToCart } from "../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail";
// import Quantity from "./wishlistQuantity.js";
import WishlistSkelton from "./WishlistSkeleton.js";
import LoadingIndicator from "../LoadingIndicator";
import { useToasts } from "@magento/peregrine";
import { FormattedMessage } from "react-intl";
import { useGetScopeCache } from "../../peregrine/lib/talons/Home/useHome";
// import ADD_SIMPLE_MUTATION from "../../queries/addSimpleProductsToCart.graphql";
// import CREATE_CART_MUTATION from "../../queries/createCart.graphql";
// import GET_CART_DETAILS_QUERY from "../../queries/getCartDetails.graphql";
import { Title } from "../Head";
import Icon from "../Icon";
import { globalContext } from "../../peregrine/lib/context/global.js";

const MyWishList = (props) => {
    const [, { addToast }] = useToasts();
    const { dispatch } = useContext(globalContext);
    const classes = mergeClasses(defaultClasses, props.classes, wishlistClasses);
    const [removeMsg, setRemoveMsg] = useState(false);
    const wishlistProps = useWishlist({
        query: WishListQuery,
    });

    const deleteData = useDeleteFromWishlist({
        query: REMOVE_FROM_WISHLIST_MUTATION,
        customerQuery: GET_CUSTOMER_QUERY,
    });
    const { handleRemoveItem, removing, removeResponse } = deleteData;
    // const catProps = useCategoryAddToCart({
    //     addSimpleProductToCartMutation: ADD_SIMPLE_MUTATION,
    //     createCartMutation: CREATE_CART_MUTATION,
    //     getCartDetailsQuery: GET_CART_DETAILS_QUERY,
    // });
    // const { handleAddToCart } = catProps;
    let productUrlSuffix = "";

    const { config } = useGetScopeCache();
    if (
        config &&
        config.product_url_suffix &&
        config.product_url_suffix != "null"
    ) {
        productUrlSuffix = config.product_url_suffix;
    }
    const { /* handleSetQuantity, quantity, */ data, isSignedIn, loading, refetch } =
        wishlistProps;

    const remove = async (id) => {
        await handleRemoveItem({ product_id: id });
        setRemoveMsg(true);
    };

    useEffect(() => {
        if (
            removeMsg &&
            removeResponse &&
            removeResponse.removeFromWishlist &&
            removeResponse.removeFromWishlist.success
        ) {
            addToast({
                type: "info",
                message: removeResponse.removeFromWishlist.message,
                dismissable: true,
                timeout: 10000,
            });
            refetch();
        }
    }, [addToast, removeMsg, removeResponse, refetch]);

    useEffect(() => {
        if (typeof data !== 'undefined') {
            dispatch({
                type: 'WISHLIST_COUNT',
                payload: data.length || 0
            });
        }
    }, [data])

    if (!isSignedIn) {
        return <Redirect to="/" />;
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
                                className={defaultClasses.column + " " + defaultClasses.main}
                            >
                                <div className={defaultClasses.account_sideBar}>
                                    <Sidebar history={props.history} />
                                </div>
                                <div className={defaultClasses.account_contentBar}>
                                    <div className={defaultClasses.page_title_wrapper}>
                                        <h1 className={defaultClasses.page_title}>
                                            <span className={defaultClasses.base}>
                                                <FormattedMessage
                                                    id={"myWishlist.page_title"}
                                                    defaultMessage={"My Wishlist"}
                                                />
                                            </span>
                                        </h1>
                                    </div>
                                    <div
                                        className={
                                            defaultClasses.block_dashboard_orders +
                                            " " +
                                            wishlistClasses.block_dahsboard_wishlist
                                        }
                                    >
                                        {typeof data != "undefined" && (
                                            <div className={classes.products_wrapper}>
                                                {data.map((val, index) => {
                                                    return (
                                                        <div key={index} className={classes.product_tiles + ' ' + classes.product_tiles_div}>
                                                            <div className={classes.inner}>
                                                                <div className={classes.product_img}>
                                                                    <Link
                                                                        to={resourceUrl(
                                                                            val.product["url_key"] + productUrlSuffix
                                                                        )}
                                                                    >
                                                                        <img
                                                                            src={val.product.small_image.url}
                                                                            alt="smallimage"
                                                                            className={"img-fluid"}
                                                                            width="282"
                                                                            height="420"
                                                                        />
                                                                    </Link>
                                                                    <div className={classes.delete_icon}>
                                                                        <button
                                                                            id={val.product.id}
                                                                            onClick={() => remove(val.product.id)}
                                                                        >

                                                                            <Icon src={TrashIcon} attrs={{ width: 15 }} />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div className={classes.product_details}>
                                                                    <div className={classes.product_name}>
                                                                        <Link
                                                                            to={resourceUrl(
                                                                                val.product["url_key"] +
                                                                                productUrlSuffix
                                                                            )}
                                                                        >
                                                                            {val.product.name}
                                                                        </Link>
                                                                    </div>
                                                                    <div className={classes.price_items}>
                                                                        <span className={classes.price_label}>
                                                                            ₹{" "}
                                                                        </span>
                                                                        <span className={classes.price}>
                                                                            {
                                                                                val.product.price.regularPrice.amount
                                                                                    .value
                                                                            }
                                                                        </span>
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
                                                                        {val.product.__typename ==
                                                                            "SimpleProduct" && (
                                                                                <button
                                                                                    onClick={() => {
                                                                                        handleAddToCart(val.product);
                                                                                        remove(val.product.id);
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
                                                                        {val.product.__typename !=
                                                                            "SimpleProduct" && (
                                                                                <Link
                                                                                    to={resourceUrl(
                                                                                        val.product["url_key"] +
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
                                                })}
                                                {data.length == 0 && (
                                                    <div className={searchClasses.noResult}>
                                                        <span className={searchClasses.noResult_icon}>
                                                            <FontAwesomeIcon icon={faExclamationTriangle} />
                                                        </span>
                                                        <span
                                                            className={
                                                                "ml-2" + " " + searchClasses.noResult_text
                                                            }
                                                        >
                                                            <FormattedMessage
                                                                id={"myWishlist.noResult_text"}
                                                                defaultMessage={
                                                                    "You have no items saved in wishlist."
                                                                }
                                                            />
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {typeof data == "undefined" && (
                                            <div className={searchClasses.noResult}>
                                                <span className={searchClasses.noResult_icon}>
                                                    <FontAwesomeIcon icon={faExclamationTriangle} />
                                                </span>
                                                <span
                                                    className={"ml-2" + " " + searchClasses.noResult_text}
                                                >
                                                    <FormattedMessage
                                                        id={"myWishlist.noResult_text"}
                                                        defaultMessage={
                                                            "You have no items saved in wishlist."
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
                                className={defaultClasses.column + " " + defaultClasses.main}
                            >
                                <div className={defaultClasses.account_sideBar}>
                                    <Sidebar history={props.history} />
                                </div>
                                <div className={defaultClasses.account_contentBar}>
                                    <div className={defaultClasses.page_title_wrapper}>
                                        <h1 className={defaultClasses.page_title}>
                                            <span className={defaultClasses.base}>
                                                <FormattedMessage
                                                    id={"myWishlist.page_title"}
                                                    defaultMessage={"My Wish List"}
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

export default MyWishList;

MyWishList.propTypes = {
    classes: shape({
        actions: string,
        root: string,
        subtitle: string,
        title: string,
        user: string,
    }),
};