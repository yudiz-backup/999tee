import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Form } from 'informed';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Button from '@magento/venia-ui/lib/components/Button';
import Field from '@magento/venia-ui/lib/components/Field';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import TextArea from '@magento/venia-ui/lib/components/TextArea';
import defaultClasses from '@magento/venia-ui/lib/components/ProductFullDetail/productFullDetail.css';
import { FormattedMessage, useIntl } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Icon from '../Icon';
import { ChevronDown as ChevronDownIcon, X as ClearIcon } from 'react-feather';
import {
    useProductReviews,
    useProductRatings,
    useSubmitProductReview
} from '../../peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import getAllProductReviews from '../../queries/getProductReviews.graphql';
import getProductRatings from '../../queries/getProductRatings.graphql';
import submitProductReview from '../../queries/submitProductReview.graphql';
import secure_base_media_url from '../../queries/baseMediaUrl.graphql';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { isRequired } from '../../util/formValidators';
import cedClasses from './productFullDetail.css';
import { Modal } from '../Modal';
import { useToasts } from '@magento/peregrine';
import { useCedContext } from 'src/peregrine/lib/context/ced';
import { monthsForChart } from '../../util/customData';
import { useQuery } from '@apollo/client';

const clearIcon = <Icon src={ClearIcon} size={30} />;
const chevrondownIcon = <Icon src={ChevronDownIcon} size={18} />;

const ProductReviews = props => {
    const { formatMessage } = useIntl();
    const { product, image = '' } = props;
    const [addedReviewMsg, setAddedReviewMsg] = useState(false);
    const [, { addToast }] = useToasts();
    const [{ currentUser, isSignedIn }] = useUserContext();
    const [, { setOverlay }] = useCedContext();
    const formref = useRef();
    const { data: baseMediaUrl } = useQuery(secure_base_media_url)
    const imgURL = baseMediaUrl?.storeConfig?.secure_base_media_url

    const submitProductReviewTalonProps = useSubmitProductReview({
        query: submitProductReview
    });

    const closePopup = useCallback(() => {
        setOverlay(false);
        $('#revire_form_popup').removeClass(defaultClasses.active);
        document
            .getElementsByTagName('html')[0]
            .setAttribute('data-scroll-lock', 'false');
    }, [setOverlay]);

    const { submitReview, reviewResponseData } = submitProductReviewTalonProps;
    useEffect(() => {
        if (reviewResponseData.success === true && addedReviewMsg) {
            document.getElementsByName('nickname').value =
                currentUser.firstname;
            addToast({
                type: 'info',
                message: reviewResponseData.message,
                dismissable: true,
                timeout: 5000
            });
            setAddedReviewMsg(false);
            closePopup();
            setRatings([]);
            setRatingSelect([]);
            formref.current.setValue('nickname', '');
            formref.current.setValue('detail', '');
            // formref.current.setValue('title', "")
        }
    }, [
        reviewResponseData.success,
        reviewResponseData.message,
        addedReviewMsg,
        currentUser.firstname,
        addToast,
        closePopup
    ]);

    const reviewsProps = useProductReviews({
        query: getAllProductReviews,
        product_id: product.id,
        current_page: 1,
        limit: 5
    });

    const ratingsProps = useProductRatings({
        query: getProductRatings
    });

    const { productRatings } = ratingsProps;
    const [ratings, setRatings] = useState([]);
    const [ratingError, setRatingError] = useState(false);
    const [activeSelect, setActiveSelect] = useState();
    const [ratingSelect, setRatingSelect] = useState([]);

    const { productReviews, loadMoreReviews, loading } = reviewsProps;
    let avgrating = '';
    let totalRating = 0;
    let totalStarts = '';
    if (typeof productReviews != 'undefined') {
        avgrating =
            productReviews.avgRating == null ? 0 : productReviews.avgRating;
        totalRating = productReviews.totalRating;
        totalStarts = productReviews.totalStarts;
    }

    const classes = mergeClasses(cedClasses, props.classes);

    const ratingSelection = (rating_code, option_value) => {
        setRatingSelect({ ...ratingSelect, [rating_code]: option_value });
        if (!activeSelect) {
            setActiveSelect(true);
        }
    };

    const handleSubmit = event => {
        if (ratings.length === productRatings.data.length) {
            setRatingError(false);
            submitReview({
                ratings: JSON.stringify(ratings),
                nickname: currentUser.firstname,
                title: event && event.title ? event.title : '-',
                detail: event && event.detail ? event.detail : '-',
                product_id: parseInt(product.id)
            });
            setAddedReviewMsg(true);
        } else {
            setRatingError(true);
        }
    };

    const loadMoreReview = async () => {
        if (typeof productReviews != 'undefined') {
            loadMoreReviews({
                current_page: productReviews.current_page + 1,
                limit: productReviews.limit,
                product_id: product.id
            });
        }
    };

    const ShowPop = () => {
        setOverlay(true);
        $('#revire_form_popup').addClass(defaultClasses.active);
        document
            .getElementsByTagName('html')[0]
            .setAttribute('data-scroll-lock', 'true');
    };

    const handleRatingChange = (ratingId, event) => {
        ratings.map((value, index) => {
            if (value.indexOf(ratingId + ':') > -1) {
                ratings.splice(index, 1);
            }
        });
        ratings.push(ratingId + ':' + event.target.value);
        setRatings(ratings);
    };

    let starRating = {};
    let totalRatingCount = 0;
    if (productReviews != '' && typeof productReviews != 'undefined') {
        starRating = JSON.parse(productReviews.ratingStarCount);
        totalRatingCount = Object.keys(starRating).reduce((acc, item) => {
            return acc + starRating[item];
        }, 0);
    }

    return (
        <div
            className={
                classes.rviews_tab + ' ' + classes.tab_list + ' ' + 'card'
            }
        >
            <div
                className={'card-header' + ' ' + classes.card_header}
                id="headingThree"
            >
                <div
                    className={
                        'btn btn-link collapsed' +
                        ' ' +
                        classes.product_tabs_list
                    }
                    data-toggle="collapse"
                    data-target="#collapseThree"
                    aria-expanded="false"
                    aria-controls="collapseThree"
                >
                    <span>
                        <FormattedMessage
                            id={
                                totalRating == 1 || !totalRating
                                    ? 'productReview.CustomerReviewSingle'
                                    : 'productReview.CustomerReviews'
                            }
                            defaultMessage="Customer Review"
                        />
                        {totalRating == 0 || totalRating == null ? (
                            ''
                        ) : (
                            <span className={classes.rating_count_sep}>
                                {totalRating}
                            </span>
                        )}
                    </span>
                    <span className={classes.tabs_arrow}>
                        {chevrondownIcon}
                    </span>
                </div>
            </div>
            <div
                id="collapseThree"
                className="collapse"
                aria-labelledby="headingThree"
                data-parent="#accordionExample"
            >
                <div
                    className={
                        defaultClasses.tabs_content_custom + ' ' + 'card-body'
                    }
                >
                    {reviewResponseData && reviewResponseData.success === true && (
                        <div className={defaultClasses.success_message_wrapper}>
                            <p
                                className={
                                    defaultClasses.success_message +
                                    ' ' +
                                    'd-flex align-center'
                                }
                            >
                                <span className={'mr-2'}>
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                </span>
                                {reviewResponseData.message}
                            </p>
                        </div>
                    )}
                    {reviewResponseData &&
                        reviewResponseData.success === false && (
                            <div
                                className={defaultClasses.error_message_wrapper}
                            >
                                <p className={defaultClasses.error_message}>
                                    {reviewResponseData.message}
                                </p>
                            </div>
                        )}
                    <Modal>
                        <div
                            id="revire_form_popup"
                            className={
                                defaultClasses.revire_form_popup +
                                ' ' +
                                defaultClasses.review_popup_form
                            }
                        >
                            <div className={defaultClasses.overlay} />
                            <div className={defaultClasses.review_form_inner}>
                                <div
                                    className={
                                        defaultClasses.review_form_wrapper
                                    }
                                >
                                    <div
                                        className={
                                            cedClasses.close_popup_review_btn
                                        }
                                    >
                                        <h4>
                                            How would you rate this product?
                                        </h4>
                                        <button
                                            onClick={closePopup}
                                            type="button"
                                        >
                                            {clearIcon}
                                        </button>
                                    </div>

                                    {!(
                                        productRatings.allow_guest_customer_to_write_review ===
                                        false && isSignedIn === false
                                    ) && (
                                            <Form
                                                className={
                                                    defaultClasses.review_form_wrap
                                                }
                                                id="product-review-submit"
                                                ref={formref}
                                                getApi={value =>
                                                    (formref.current = value)
                                                }
                                                onSubmit={handleSubmit}
                                            >
                                                <div
                                                    className={
                                                        defaultClasses.add_review_wrapper
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            defaultClasses.custom_review_stars
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                defaultClasses.rating_box
                                                            }
                                                        >
                                                            <div>
                                                                {typeof productRatings.data !=
                                                                    'undefined' &&
                                                                    productRatings.data.map(
                                                                        (v, i) => {
                                                                            var options = JSON.parse(
                                                                                v.options
                                                                            );
                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        i
                                                                                    }
                                                                                    className={
                                                                                        defaultClasses.user_ratings_wrapper
                                                                                    }
                                                                                >
                                                                                    <span
                                                                                        className={
                                                                                            defaultClasses.rating_title
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            v.rating_code
                                                                                        }
                                                                                    </span>
                                                                                    <div
                                                                                        className={
                                                                                            defaultClasses.rating_outer
                                                                                        }
                                                                                    >
                                                                                        {typeof options !=
                                                                                            'undefined' &&
                                                                                            options.map(
                                                                                                (
                                                                                                    optionArr
                                                                                                    // i
                                                                                                ) => {
                                                                                                    var ratingSelectedValue =
                                                                                                        ratingSelect[
                                                                                                        v
                                                                                                            .rating_code
                                                                                                        ];
                                                                                                    var ratingOptionValue =
                                                                                                        optionArr.option_value;
                                                                                                    const ratingClass = [
                                                                                                        defaultClasses.rating_str
                                                                                                    ];
                                                                                                    // let radioCheck = 'test'
                                                                                                    if (
                                                                                                        parseInt(
                                                                                                            ratingOptionValue
                                                                                                        ) <=
                                                                                                        parseInt(
                                                                                                            ratingSelectedValue
                                                                                                        )
                                                                                                    ) {
                                                                                                        ratingClass.push(
                                                                                                            defaultClasses.activeSelect
                                                                                                        );
                                                                                                        // radioCheck = 'check update'
                                                                                                    }
                                                                                                    return (
                                                                                                        <div
                                                                                                            key={`${v.rating_id
                                                                                                                }-${ratingOptionValue}`}
                                                                                                            className={
                                                                                                                defaultClasses.star_wrapper
                                                                                                            }
                                                                                                        >
                                                                                                            <input
                                                                                                                className={ratingClass.join(
                                                                                                                    ' '
                                                                                                                )}
                                                                                                                onClick={e => {
                                                                                                                    ratingSelection(
                                                                                                                        v.rating_code,
                                                                                                                        optionArr.option_value
                                                                                                                    );
                                                                                                                    handleRatingChange(
                                                                                                                        v.rating_id,
                                                                                                                        e
                                                                                                                    );
                                                                                                                }}
                                                                                                                id={
                                                                                                                    v.rating_code +
                                                                                                                    '_' +
                                                                                                                    optionArr.option_value
                                                                                                                }
                                                                                                                name={
                                                                                                                    'rating[' +
                                                                                                                    v.rating_id +
                                                                                                                    ']'
                                                                                                                }
                                                                                                                value={
                                                                                                                    optionArr.option_id
                                                                                                                }
                                                                                                            />
                                                                                                            <label
                                                                                                                className={
                                                                                                                    defaultClasses.star
                                                                                                                }
                                                                                                                htmlFor={
                                                                                                                    v.rating_code +
                                                                                                                    '_' +
                                                                                                                    optionArr.option_value
                                                                                                                }
                                                                                                            >
                                                                                                                <FontAwesomeIcon
                                                                                                                    icon={
                                                                                                                        faStar
                                                                                                                    }
                                                                                                                />
                                                                                                            </label>
                                                                                                        </div>
                                                                                                    );
                                                                                                }
                                                                                            )}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        }
                                                                    )}
                                                            </div>
                                                            <div
                                                                className={
                                                                    defaultClasses.review_hr_line
                                                                }
                                                            />
                                                            <div
                                                                className={
                                                                    classes.product_review_image_container
                                                                }
                                                            >
                                                                <img
                                                                    src={
                                                                        image
                                                                            ? `${imgURL}catalog/product${image}`
                                                                            : product &&
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
                                                                        classes.product_review_image
                                                                    }
                                                                    height="150"
                                                                    width="151"
                                                                />
                                                            </div>
                                                        </div>
                                                        {ratingError && (
                                                            <p
                                                                className={
                                                                    defaultClasses.root_error
                                                                }
                                                            >
                                                                {
                                                                    'Please select one of each of the ratings above.'
                                                                }
                                                            </p>
                                                        )}
                                                        <div
                                                            className={
                                                                defaultClasses.product_ratingform_wrapper +
                                                                ' ' +
                                                                'pt-3'
                                                            }
                                                        >
                                                            {/* <div
                                                                className={
                                                                    defaultClasses.form_field
                                                                }
                                                            >
                                                                <Field
                                                                    label={formatMessage(
                                                                        {
                                                                            id:
                                                                                'productReview.nickname',
                                                                            defaultMessage:
                                                                                'Nickname*'
                                                                        }
                                                                    )}
                                                                >
                                                                    <TextInput
                                                                        field="nickname"
                                                                        validate={value =>
                                                                            isRequired(
                                                                                value,
                                                                                'Nickname'
                                                                            )
                                                                        }
                                                                    />
                                                                </Field>
                                                            </div> */}
                                                            <div
                                                                className={
                                                                    defaultClasses.form_field
                                                                }
                                                            >
                                                                <Field
                                                                    label={formatMessage(
                                                                        {
                                                                            id:
                                                                                'productReview.Title',
                                                                            defaultMessage:
                                                                                'Title*'
                                                                        }
                                                                    )}
                                                                >
                                                                    <TextInput
                                                                        field="title"
                                                                    // initialValue={product.name && product.sku ? `${product.name} | ${product.sku}` : ''}
                                                                    />
                                                                </Field>
                                                            </div>
                                                            <div
                                                                className={
                                                                    defaultClasses.form_field
                                                                }
                                                            >
                                                                <Field
                                                                    label={formatMessage(
                                                                        {
                                                                            id:
                                                                                'productReview.Review',
                                                                            defaultMessage:
                                                                                'Review*'
                                                                        }
                                                                    )}
                                                                >
                                                                    <div
                                                                        className={
                                                                            cedClasses.review_textArea
                                                                        }
                                                                    >
                                                                        <TextArea
                                                                            field="detail"
                                                                            validate={value =>
                                                                                isRequired(
                                                                                    value,
                                                                                    'Review'
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                </Field>
                                                            </div>
                                                            <div
                                                                className={
                                                                    defaultClasses.product_ratingform_submit +
                                                                    ' ' +
                                                                    'my-4'
                                                                }
                                                            >
                                                                <Button
                                                                    priority="high"
                                                                    type="submit"
                                                                >
                                                                    <FormattedMessage
                                                                        id={
                                                                            'ProductReview.product_ratingform_submit'
                                                                        }
                                                                        defaultMessage={
                                                                            'Submit Review'
                                                                        }
                                                                    />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Form>
                                        )}
                                </div>
                            </div>
                        </div>
                    </Modal>

                    {typeof productReviews.data != 'undefined' &&
                        productReviews.data.length != 0 && (
                            <div
                                className={
                                    defaultClasses.overall_product_review_wrap
                                }
                            >
                                <div
                                    className={defaultClasses.rating_histogram}
                                >
                                    {Object.keys(starRating).length > 0 &&
                                        Object.keys(starRating).map(function (
                                            name,
                                            index
                                        ) {
                                            return (
                                                <div
                                                    key={index + 'rating_div'}
                                                    className={
                                                        defaultClasses.histogram_row
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            defaultClasses.histogram_star_number
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                defaultClasses.histogram_number
                                                            }
                                                        >
                                                            {name}
                                                        </span>
                                                        <div
                                                            className={
                                                                defaultClasses.histogram_star_icon
                                                            }
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={faStar}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={
                                                            defaultClasses.histgram_rating_progress
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                defaultClasses.histgram_rating_outer
                                                            }
                                                        >
                                                            <span
                                                                className={
                                                                    defaultClasses.histgram_rating_inner
                                                                }
                                                                style={{
                                                                    width:
                                                                        `${totalRatingCount
                                                                            ? (starRating[
                                                                                name
                                                                            ] /
                                                                                totalRatingCount) *
                                                                            100
                                                                            : 0
                                                                        }` + '%'
                                                                }}
                                                            />
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={
                                                            defaultClasses.histogram_rating_percentage
                                                        }
                                                    >
                                                        <span>
                                                            {' '}
                                                            {`${starRating[name]
                                                                }`}{' '}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                                <div
                                    className={
                                        defaultClasses.overall_product_rate
                                    }
                                >
                                    <div
                                        className={defaultClasses.rating_result}
                                    >
                                        <span
                                            className={classes.not_reviewed}
                                            style={{ width: avgrating + '%' }}
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
                                    <p className={defaultClasses.overall_text}>
                                        <span className={'mr-2'}>
                                            {totalStarts}
                                        </span>
                                        <FormattedMessage
                                            id="ProductReview.outOfTotalStars"
                                            defaultMessage="out of 5 stars"
                                        />
                                    </p>
                                </div>
                            </div>
                        )}

                    {productRatings.allow_guest_customer_to_write_review ===
                        false &&
                        isSignedIn === false && (
                            <>
                                <p className={defaultClasses.review_message}>
                                    Only registered users can write a review.
                                </p>
                                <p
                                    className={
                                        defaultClasses.user_account_links
                                    }
                                >
                                    Please{' '}
                                    <button
                                        className={
                                            defaultClasses.btn_rvw +
                                            ' ' +
                                            cedClasses.sign_in_btn
                                        }
                                        onClick={() => {
                                            document
                                                .getElementById('user_account')
                                                .click();
                                        }}
                                    >
                                        sign-in or CREATE AN ACCOUNT
                                    </button>
                                </p>
                            </>
                        )}
                    {!(
                        productRatings.allow_guest_customer_to_write_review ===
                        false && isSignedIn === false
                    ) && (
                            <div className={defaultClasses.give_review_wrap}>
                                <h2 className={defaultClasses.give_review_head}>
                                    <FormattedMessage
                                        id="ProductReview.give_review_head"
                                        defaultMessage="Review this product"
                                    />
                                </h2>

                                <Button
                                    onClick={ShowPop}
                                    type="button"
                                    priority={'high'}
                                >
                                    <FormattedMessage
                                        id={'ProductReview.give_review_butotn'}
                                        defaultMessage={'Write a review'}
                                    />
                                </Button>
                            </div>
                        )}
                    <div
                        id="customer-reviews"
                        className={defaultClasses.customer_review}
                    >
                        <div className={defaultClasses.block_title}>
                            <strong
                                className={
                                    defaultClasses.review_heading + ' ' + 'mb-3'
                                }
                            >
                                <FormattedMessage
                                    id={'ProductReview.review_heading'}
                                    defaultMessage={'Customer Reviews'}
                                />
                            </strong>
                        </div>
                        {typeof productReviews.data != 'undefined' &&
                            productReviews.data.length == 0 && (
                                <div
                                    className={defaultClasses.give_review_wrap}
                                >
                                    <p
                                        className={
                                            defaultClasses.no_review_message
                                        }
                                    >
                                        <FormattedMessage
                                            id={'ProductReview.noReviewMessage'}
                                            defaultMessage="No Reviews Available. Be the first one To Review This
                    Product."
                                        />
                                    </p>
                                </div>
                            )}
                    </div>
                </div>
                <div
                    className={
                        defaultClasses.blockcontent +
                        ' ' +
                        defaultClasses.customer_reviews_list
                    }
                >
                    <ul className={defaultClasses.review_items}>
                        {typeof productReviews.data != 'undefined' &&
                            productReviews.data.map((v, i) => {
                                const date = new Date(v?.created_at);
                                const dateMDY = `${date.getDate() < 10
                                    ? `0${date.getDate()}`
                                    : date.getDate()
                                    }-${monthsForChart[date.getMonth() + 1]
                                    }-${date.getFullYear()}`;
                                var ratingData = JSON.parse(v.rating);
                                return (
                                    <li
                                        key={i + 'ratings'}
                                        className={
                                            defaultClasses.item +
                                            ' ' +
                                            defaultClasses.review_item
                                        }
                                    >
                                        <div
                                            className={
                                                defaultClasses.cust_review_head
                                            }
                                        >
                                            <div
                                                className={
                                                    defaultClasses.customer_first_let
                                                }
                                            >
                                                <span
                                                    className={
                                                        defaultClasses.cust_name_firstlet
                                                    }
                                                >
                                                    {/* <FormattedMessage
                                                                id={
                                                                    'ProductReview.cust_name_firstlet'
                                                                }
                                                                defaultMessage={
                                                                    's'
                                                                }
                                                            /> */}
                                                    {v.nickname.charAt(0)}
                                                </span>
                                            </div>
                                            <div
                                                className={
                                                    defaultClasses.custom_details_review
                                                }
                                            >
                                                <div
                                                    className={
                                                        defaultClasses.review_details +
                                                        ' ' +
                                                        'd-flex'
                                                    }
                                                >
                                                    <p
                                                        className={
                                                            'mb-0 pb-2' +
                                                            ' ' +
                                                            'd-flex justify-content-between'
                                                        }
                                                    >
                                                        <strong
                                                            className={
                                                                defaultClasses.user_name
                                                            }
                                                        >
                                                            {v.nickname}{' '}
                                                        </strong>
                                                        <span> {dateMDY}</span>
                                                    </p>
                                                    {ratingData &&
                                                        ratingData?.sort((a, b) => a.rating_code > b.rating_code ? 1 : -1)?.map(
                                                            value => {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            i +
                                                                            'rating_form'
                                                                        }
                                                                        className={
                                                                            defaultClasses.rating_summary +
                                                                            ' ' +
                                                                            'd-flex'
                                                                        }
                                                                    >
                                                                        <span>
                                                                            {
                                                                                value.rating_code
                                                                            }
                                                                        </span>
                                                                        <div
                                                                            className={
                                                                                defaultClasses.rating_result
                                                                            }
                                                                        >
                                                                            <span
                                                                                className={
                                                                                    classes.not_reviewed
                                                                                }
                                                                                style={{
                                                                                    width:
                                                                                        value?.rating_percent +
                                                                                        '%'
                                                                                }}
                                                                            >
                                                                                <FontAwesomeIcon
                                                                                    icon={
                                                                                        faStar
                                                                                    }
                                                                                />
                                                                                <FontAwesomeIcon
                                                                                    icon={
                                                                                        faStar
                                                                                    }
                                                                                />
                                                                                <FontAwesomeIcon
                                                                                    icon={
                                                                                        faStar
                                                                                    }
                                                                                />
                                                                                <FontAwesomeIcon
                                                                                    icon={
                                                                                        faStar
                                                                                    }
                                                                                />
                                                                                <FontAwesomeIcon
                                                                                    icon={
                                                                                        faStar
                                                                                    }
                                                                                />
                                                                            </span>
                                                                            <span
                                                                                className={
                                                                                    classes.reviewed
                                                                                }
                                                                            >
                                                                                <FontAwesomeIcon
                                                                                    icon={
                                                                                        faStar
                                                                                    }
                                                                                />
                                                                                <FontAwesomeIcon
                                                                                    icon={
                                                                                        faStar
                                                                                    }
                                                                                />
                                                                                <FontAwesomeIcon
                                                                                    icon={
                                                                                        faStar
                                                                                    }
                                                                                />
                                                                                <FontAwesomeIcon
                                                                                    icon={
                                                                                        faStar
                                                                                    }
                                                                                />
                                                                                <FontAwesomeIcon
                                                                                    icon={
                                                                                        faStar
                                                                                    }
                                                                                />
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                </div>
                                                <div
                                                    className={
                                                        defaultClasses.review_title
                                                    }
                                                >
                                                    {v.review}
                                                </div>
                                                <div
                                                    className={
                                                        defaultClasses.review_content
                                                    }
                                                >
                                                    <p className={'mb-0'}>
                                                        {v.detail}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        <li className="text-center">
                            {typeof productReviews != 'undefined' &&
                                productReviews &&
                                productReviews.data.length > 0 &&
                                productReviews.current_page <
                                productReviews.total_count && (
                                    <Button
                                        priority="high"
                                        disabled={loading}
                                        onClick={loadMoreReview}
                                    >
                                        <FormattedMessage
                                            id={'global.loadMore'}
                                            defaultMessage={'Load More'}
                                        />
                                    </Button>
                                )}
                        </li>
                    </ul>

                    {/* {typeof productReviews.data != 'undefined' &&
                                productReviews.data.length <
                                productReviews.totalRating && (
                                    <button onClick={loadMore}>
                                        <FormattedMessage
                                            id={'ProductReview.loadMore'}
                                            defaultMessage={'Load More'}
                                        />
                                    </button>
                                )} */}
                </div>
            </div>
        </div>
    );
};

export default ProductReviews;
