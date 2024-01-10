import React, { useContext } from 'react';
import { clearIcon } from '../../CreateAccount/createAccount';
import cedClasses from '../../ProductFullDetail/productFullDetail.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Button from '../../Button';
import { Link } from 'src/drivers';
import { globalContext } from '../../../peregrine/lib/context/global';
import { handleCartNotification } from '../../../util/helperFunction';
import RichContent from '@magento/venia-ui/lib/components/RichContent/richContent';
import defaultClasses from '../../CartPage/PriceAdjustments/AllCouponCodeSlidebar/allCouponCodeSlidebar.css';
import designToolContent from '../../../queries/designToolPage.graphql';
import { useQuery } from '@apollo/client';

export default function PopupModal(props) {
    const classes = mergeClasses(cedClasses, props.classes);
    const defaultClass = mergeClasses(defaultClasses, props.classes);
    const { dispatch } = useContext(globalContext);

    const { data: designToolInfo, loading } = useQuery(designToolContent);

    const { contextInfo } = props;

    const handleClose = () => {
        // handleCartNotification(false, dispatch, 'item')
        if (contextInfo?.designToolNotification?.designToolNotification) {
            dispatch({
                type: 'DESIGN_TOOL_NOTIFICATION',
                payload: { designToolNotification: false }
            });
        }
        if (contextInfo?.addToCartNotification?.addToCartNotification) {
            handleCartNotification(false, dispatch, 'item');
        }
        if (contextInfo?.sizeChartModal?.sizeChartModal) {
            dispatch({
                type: 'SIZE_CHART_MODAL',
                payload: { sizeChartModal: false }
            });
        }
        if (contextInfo?.couponCodeModal?.couponCodeModal) {
            dispatch({
                type: 'COUPON_CODE_MODAL',
                payload: { couponCodeModal: false }
            });
        }
    };
    return (
        <section>
            <div
                // className={classes.add_gift_form + "  " + "modal fade"} id="staticBackdrop"
                style={
                    contextInfo?.designToolNotification
                        ?.designToolNotification ||
                    contextInfo?.addToCartNotification?.addToCartNotification ||
                    contextInfo?.sizeChartModal?.sizeChartModal ||
                    contextInfo?.couponCodeModal?.couponCodeModal
                        ? { display: 'block' }
                        : { display: 'none' }
                }
                className={
                    contextInfo?.designToolNotification
                        ?.designToolNotification ||
                    contextInfo?.addToCartNotification?.addToCartNotification ||
                    contextInfo?.sizeChartModal?.sizeChartModal ||
                    contextInfo?.couponCodeModal?.couponCodeModal
                        ? classes.add_gift_form +
                          '  ' +
                          'modal   fade show' +
                          ' ' +
                          classes.jobBoradActiveModal +
                          ` ${
                              contextInfo?.sizeChartModal?.sizeChartModal
                                  ? defaultClass.size_chart_modal
                                  : ''
                          }` +
                          ` ${
                              contextInfo?.couponCodeModal?.couponCodeModal
                                  ? defaultClass.coupon_code_modal
                                  : ''
                          }` +
                          ` ${
                              contextInfo?.designToolNotification
                                  ?.designToolNotification
                                  ? defaultClass.design_tool_modal
                                  : ''
                          }`
                        : null
                }
                data-backdrop="static"
                data-keyboard="false"
                tabIndex="-1"
                aria-labelledby="staticBackdropLabel"
                aria-hidden="true"
            >
                <div className={classes.overlay} />
                <div
                    className={
                        classes.are_sure_modal +
                        ' ' +
                        'modal-dialog modal-dialog-centered'
                    }
                >
                    {contextInfo?.designToolNotification
                        ?.designToolNotification && (
                        <div
                            className={
                                classes.modal_content + ' ' + 'modal-content'
                            }
                        >
                            <div
                                className={
                                    classes.modal_header + ' ' + 'modal-header'
                                }
                            >
                                <h5
                                    style={{ fontSize: '16px' }}
                                    className="modal-title"
                                    id="staticBackdropLabel"
                                >
                                    {
                                        designToolInfo?.cmsBlocks?.items?.[0]
                                            ?.title
                                    }
                                </h5>
                                <div className={'text-right'}>
                                    <button
                                        type="submit"
                                        data-dismiss="modal"
                                        onClick={handleClose}
                                    >
                                        {clearIcon}
                                    </button>
                                </div>
                            </div>
                            {/* <div className="modal-body"></div> */}
                            {designToolInfo?.cmsBlocks?.items && !loading && (
                                <div
                                    className={
                                        classes.sure_footer +
                                        ' ' +
                                        'modal-footer mr-auto'
                                    }
                                >
                                    <div className="modal-body">
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    designToolInfo?.cmsBlocks
                                                        ?.items?.[0]?.content
                                            }}
                                            style={{width: '100%'}}
                                        />
                                        {/* <Button
                                    priority="high"
                                    type="submit"
                                    data-dismiss="modal"
                                    onClick={handleClose}
                                >
                                    {' '}
                                    Close{' '}
                                </Button> */}
                                        {/* <Link to='/cart'>
                                        <Button type="reset" data-dismiss="modal" onClick={handleClose}> View Cart </Button>
                                    </Link> */}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {contextInfo?.addToCartNotification
                        ?.addToCartNotification && (
                        <div
                            className={
                                classes.modal_content + ' ' + 'modal-content'
                            }
                        >
                            <div
                                className={
                                    classes.modal_header + ' ' + 'modal-header'
                                }
                            >
                                <h5
                                    style={{ fontSize: '16px' }}
                                    className="modal-title"
                                    id="staticBackdropLabel"
                                >
                                    {`${
                                        contextInfo?.addToCartNotification
                                            ?.productName
                                    } has been added to your cart.`}
                                </h5>
                                <div className={'text-right'}>
                                    <button
                                        type="submit"
                                        data-dismiss="modal"
                                        onClick={handleClose}
                                    >
                                        {clearIcon}
                                    </button>
                                </div>
                            </div>
                            {/* <div className="modal-body"></div> */}
                            <div
                                className={
                                    classes.sure_footer +
                                    ' ' +
                                    'modal-footer mr-auto'
                                }
                            >
                                <Button
                                    priority="high"
                                    type="submit"
                                    data-dismiss="modal"
                                    onClick={handleClose}
                                >
                                    {' '}
                                    Continue Shopping{' '}
                                </Button>
                                <Link to="/cart">
                                    <Button
                                        type="reset"
                                        data-dismiss="modal"
                                        onClick={handleClose}
                                    >
                                        {' '}
                                        View Cart{' '}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                    {contextInfo?.sizeChartModal?.sizeChartModal && (
                        <div
                            className={
                                classes.modal_content +
                                ' ' +
                                'modal-content dfsdf'
                            }
                        >
                            <div
                                className={
                                    classes.modal_header + ' ' + 'modal-header'
                                }
                            >
                                <h5
                                    style={{ fontSize: '16px' }}
                                    className="modal-title"
                                    id="staticBackdropLabel"
                                >
                                    Size Chart
                                </h5>
                                <div className={'text-right'}>
                                    <button
                                        type="submit"
                                        data-dismiss="modal"
                                        onClick={handleClose}
                                    >
                                        {clearIcon}
                                    </button>
                                </div>
                            </div>
                            {/* <div className="modal-body"></div> */}
                            <div
                                className={
                                    classes.sure_footer +
                                    ' ' +
                                    'modal-footer mr-auto'
                                }
                            >
                                <div className="modal-body">
                                    <RichContent
                                        html={
                                            contextInfo?.sizeChartModal?.content
                                        }
                                    />
                                </div>
                                <Button
                                    priority="high"
                                    type="submit"
                                    data-dismiss="modal"
                                    onClick={handleClose}
                                >
                                    {' '}
                                    Close{' '}
                                </Button>
                                {/* <Link to='/cart'>
                                 <Button type="reset" data-dismiss="modal" onClick={handleClose}> View Cart </Button>
                             </Link> */}
                            </div>
                        </div>
                    )}
                    {contextInfo?.couponCodeModal?.couponCodeModal && (
                        <div
                            className={
                                classes.modal_content + ' ' + 'modal-content'
                            }
                        >
                            <div
                                className={
                                    classes.modal_header + ' ' + 'modal-header'
                                }
                            >
                                <h5
                                    style={{ fontSize: '16px' }}
                                    className="modal-title"
                                    id="staticBackdropLabel"
                                >
                                    Coupon Code
                                </h5>
                                <div className={'text-right'}>
                                    <button
                                        type="submit"
                                        data-dismiss="modal"
                                        onClick={handleClose}
                                    >
                                        {clearIcon}
                                    </button>
                                </div>
                            </div>
                            <div className="modal-body-wrapper">
                                <div
                                    className={
                                        defaultClass.sure_footer +
                                        ' ' +
                                        'modal-footer mr-auto'
                                    }
                                >
                                    <div className="modal-body">
                                        <div
                                            className={
                                                defaultClass.emptyCart +
                                                ' ' +
                                                defaultClass.body
                                            }
                                        >
                                            <div
                                                className={
                                                    defaultClass.header +
                                                    ' ' +
                                                    defaultClass.minicarT_header
                                                }
                                            />
                                            {contextInfo?.couponCodeModal
                                                ?.allCouponCodeData.length ? (
                                                <div
                                                    className={
                                                        defaultClass.coupon_section_wrappper
                                                    }
                                                >
                                                    {contextInfo?.couponCodeModal?.allCouponCodeData.map(
                                                        (item, index) => {
                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className={
                                                                        item.couponCode ===
                                                                        contextInfo
                                                                            ?.couponCodeModal
                                                                            ?.couponCode
                                                                            ? defaultClass.already_applied_coupon_code_section_wrapper
                                                                            : defaultClass.coupon_code_section_wrapper
                                                                    }
                                                                >
                                                                    <div
                                                                        className={
                                                                            defaultClass.coupon_title
                                                                        }
                                                                    >
                                                                        {
                                                                            item.couponTitle
                                                                        }
                                                                    </div>
                                                                    <div
                                                                        className={
                                                                            defaultClass.coupon_code_wrapper
                                                                        }
                                                                    >
                                                                        <span
                                                                            className={
                                                                                defaultClass.coupon_code
                                                                            }
                                                                        >
                                                                            {
                                                                                item.couponCode
                                                                            }
                                                                        </span>
                                                                        <span
                                                                            className={
                                                                                defaultClass.apply_button
                                                                            }
                                                                            onClick={() => {
                                                                                if (
                                                                                    item.couponCode ===
                                                                                    contextInfo
                                                                                        ?.couponCodeModal
                                                                                        ?.couponCode
                                                                                ) {
                                                                                    contextInfo?.couponCodeModal?.handleRemoveCouponCode(
                                                                                        item.couponCode
                                                                                    );
                                                                                    handleClose();
                                                                                } else {
                                                                                    contextInfo?.couponCodeModal?.handlePopupApplyButton(
                                                                                        item.couponCode
                                                                                    );
                                                                                    handleClose();
                                                                                }
                                                                            }}
                                                                        >
                                                                            {item.couponCode ===
                                                                            contextInfo
                                                                                ?.couponCodeModal
                                                                                ?.couponCode
                                                                                ? 'Remove'
                                                                                : 'Apply'}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        {
                                                                            item.couponDescription
                                                                        }
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            ) : (
                                                <div>
                                                    Currently no coupon code
                                                    available
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* <Button priority="high" type="submit" data-dismiss="modal" onClick={handleClose} > Close </Button> */}
                                    {/* <Link to='/cart'>
                                        <Button type="reset" data-dismiss="modal" onClick={handleClose}> View Cart </Button>
                                    </Link> */}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
