import React from 'react';
import { shape, string } from 'prop-types';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './myAccount.css';
import reviewClasses from './productReview.css';
import searchClasses from '../SearchPage/searchPage.css';
import Sidebar from './sidebar.js';
import { FormattedMessage } from 'react-intl';
import { useProductReviews } from '../../peregrine/lib/talons/MyAccount/useDashboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
    faStar,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import getAllProductReviews from '../../queries/getAllProductReviews.graphql';
import { Link, resourceUrl, Redirect } from 'src/drivers';
import RichContent from '@magento/venia-ui/lib/components/RichContent';
import { Title } from '../Head';
// import Button from '../Button';
// import { Eye as EyeIcon } from 'react-feather';
// import Icon from '@magento/venia-ui/lib/components/Icon';
import { monthsForChart } from '../../util/customData';
// const eyeIcon = <Icon src={EyeIcon} size={20} />;
const ProductReviews = props => {
    const classes = mergeClasses(defaultClasses, props.classes, reviewClasses);
    const reviewsProps = useProductReviews({
        query: getAllProductReviews,
        current_page: 1,
        limit: 4
    });

    const { productReviews, isSignedIn, loadMore } = reviewsProps;

    if (!isSignedIn) {
        return <Redirect to="/" />;
    }
    const loadMoreReviews = async () => {
        if (typeof productReviews != 'undefined') {
            loadMore({
                current_page: productReviews.current_page + 1,
                limit: productReviews.limit
            });
        }
    };
    return (
        <div className={defaultClasses.columns}>
            <Title>{`My Product Reviews}`}</Title>
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
                            <div className={defaultClasses.account_contentBar}>
                                <div
                                    className={
                                        defaultClasses.page_title_wrapper
                                    }
                                >
                                    <h1 className={defaultClasses.page_title}>
                                        <span className={defaultClasses.base}>
                                            <FormattedMessage
                                                id={'productReview.page_title'}
                                                defaultMessage={
                                                    'My Reviews & Ratings'
                                                }
                                            />
                                        </span>
                                    </h1>
                                </div>
                                {typeof productReviews.data != 'undefined' && (
                                    <div
                                        className={
                                            defaultClasses.block_dashboard_orders
                                        }
                                    >
                                        {productReviews.data.map((v, i) => {
                                            const date = new Date(v?.created_at);
                                            const dateMDY = `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}-${monthsForChart[date.getMonth() + 1]}-${date.getFullYear()}`;
                                            var image = resourceUrl(
                                                v.product_img,
                                                {
                                                    type: 'image-product',
                                                    width: 100,
                                                    height: 100
                                                }
                                            );
                                            return (
                                                <>
                                                    {v?.status === "Approved" && <div
                                                        key={i}
                                                        className={
                                                            classes.product_review_wrapper
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                classes.reviewed_product
                                                            }
                                                        >
                                                            <Link
                                                                to={resourceUrl(
                                                                    "/" + v.url_key
                                                                )}
                                                                className={
                                                                    classes.product_img
                                                                }
                                                            >
                                                                <img
                                                                    src={image}
                                                                    alt="product-img"
                                                                    className={
                                                                        'img-fluid'
                                                                    }
                                                                />
                                                            </Link>
                                                            <div
                                                                className={
                                                                    classes.product_details
                                                                }
                                                            >
                                                                <Link
                                                                    to={resourceUrl(
                                                                        "/" + v.url_key
                                                                    )}
                                                                    className={
                                                                        classes.product_name
                                                                    }
                                                                >
                                                                    {v.product_name}
                                                                </Link>
                                                                <p
                                                                    className={
                                                                        classes.product_date
                                                                    }
                                                                >
                                                                    {dateMDY}
                                                                </p>
                                                                <div
                                                                    className={
                                                                        classes.review_stars_wrapper +
                                                                        ' ' +
                                                                        'position-relative'
                                                                    }
                                                                >
                                                                    <span
                                                                        className={classes.not_reviewed}
                                                                        style={{
                                                                            width: v.rating + '%'
                                                                        }}
                                                                    >
                                                                        <FontAwesomeIcon icon={faStar} />
                                                                        <FontAwesomeIcon icon={faStar} />
                                                                        <FontAwesomeIcon icon={faStar} />
                                                                        <FontAwesomeIcon icon={faStar} />
                                                                        <FontAwesomeIcon icon={faStar} />
                                                                    </span>
                                                                    <span className={classes.reviewed}>
                                                                        <FontAwesomeIcon icon={faStar} />
                                                                        <FontAwesomeIcon icon={faStar} />
                                                                        <FontAwesomeIcon icon={faStar} />
                                                                        <FontAwesomeIcon icon={faStar} />
                                                                        <FontAwesomeIcon icon={faStar} />
                                                                    </span>
                                                                </div>
                                                                <p
                                                                    className={
                                                                        classes.review
                                                                    }
                                                                >
                                                                    <RichContent
                                                                        html={
                                                                            v.detail
                                                                        }
                                                                    />
                                                                </p>
                                                                {/* <Link
                                                                    to={resourceUrl(
                                                                        "/" + v.url_key
                                                                    )}
                                                                    className={classes.details + ' ' + defaultClasses.see_icon}>
                                                                    <Button priority='high'>
                                                                        <FormattedMessage
                                                                            id={
                                                                                'productReview.SeeDetails'
                                                                            }
                                                                            defaultMessage={
                                                                                'See Details'
                                                                            }
                                                                        />
                                                                        {eyeIcon}
                                                                    </Button>
                                                                </Link> */}
                                                            </div>
                                                        </div>
                                                    </div>}
                                                </>
                                            );
                                        })}
                                        {typeof productReviews != 'undefined' &&
                                            productReviews?.total_count !== productReviews?.current_page &&
                                            productReviews.data.length > 0 &&
                                            productReviews.data.length >
                                            productReviews.total_count && (
                                                <button
                                                    className={
                                                        defaultClasses.load_more_btn
                                                    }
                                                    onClick={loadMoreReviews}
                                                >
                                                    <FormattedMessage
                                                        id={'global.loadMore'}
                                                        defaultMessage={
                                                            'Load More'
                                                        }
                                                    />
                                                </button>
                                            )}
                                        {productReviews.data.length == 0 && (
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
                                                            'productReview.noResult'
                                                        }
                                                        defaultMessage={
                                                            'You have not given any reviews yet.'
                                                        }
                                                    />
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductReviews;

ProductReviews.propTypes = {
    classes: shape({
        actions: string,
        root: string,
        subtitle: string,
        title: string,
        user: string
    })
};
