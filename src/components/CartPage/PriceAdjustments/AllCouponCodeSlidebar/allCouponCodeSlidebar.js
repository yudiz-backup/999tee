import React from 'react';
import { X as ClearIcon } from 'react-feather';
import { bool, shape, string } from 'prop-types';
// import { useScrollLock } from '@magento/peregrine';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Icon from '../../../Icon';
import defaultClasses from './allCouponCodeSlidebar.css';

const clearIcon = <Icon src={ClearIcon} size={24} />;

const AllCouponCodeSlidebar = React.forwardRef((props, ref) => {
    const { isOpen, setIsOpen, allCouponCodeData = [], handlePopupApplyButton = () => { }, couponCode, handleRemoveCouponCode = () => { } } = props;

    // Prevent the page from scrolling in the background
    // when the AllCouponCodeSlidebar is open.
    // useScrollLock(isOpen);

    const classes = mergeClasses(defaultClasses, props.classes);
    const rootClass = isOpen ? classes.root_open : classes.root;
    const contentsClass = isOpen ? classes.contents_open : classes.contents;

    const contents = (
        <div className={classes.emptyCart + ' ' + classes.body}>
            <div className={classes.header + ' ' + classes.minicarT_header}>
                <span>Coupon Code</span>
                <button type='button' onClick={() => setIsOpen(false)}>{clearIcon}</button>
            </div>
            {allCouponCodeData.length ? (
                <div className={classes.coupon_section_wrappper}>
                    {allCouponCodeData.map((item, index) => {
                        return (
                            <div key={index} className={item.couponCode === couponCode ? classes.already_applied_coupon_code_section_wrapper : classes.coupon_code_section_wrapper}>
                                <div className={classes.coupon_title}>{item.couponTitle}</div>
                                <div className={classes.coupon_code_wrapper}>
                                    <span className={classes.coupon_code}>{item.couponCode}</span>
                                    <span className={classes.apply_button} onClick={() => {
                                        if (item.couponCode === couponCode) {
                                            handleRemoveCouponCode(item.couponCode)
                                        } else {
                                            handlePopupApplyButton(item.couponCode)
                                        }
                                    }}>
                                        {item.couponCode === couponCode ? 'Remove' : 'Apply'}
                                    </span>
                                </div>
                                <div>{item.couponDescription}</div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div>Currently no coupon code available</div>
            )}
        </div>
    );

    return (
        <aside className={rootClass}>
            <div ref={ref} className={contentsClass}>
                {contents}
            </div>
        </aside>
    );
});

export default AllCouponCodeSlidebar;

AllCouponCodeSlidebar.propTypes = {
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
