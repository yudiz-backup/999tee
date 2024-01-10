import React, { Suspense/* , useState */ } from 'react';
import { func } from 'prop-types';
import { mergeClasses } from '../../../classify';
import { Accordion, Section } from '../../Accordion';
import defaultClasses from './priceAdjustments.css';
import LoadingIndicator from '../../LoadingIndicator';
import { useIntl } from 'react-intl';

const CouponCode = React.lazy(() => import('./CouponCode'));
const ShippingMethods = React.lazy(() => import('./ShippingMethods'));
/**
 * PriceAdjustments is a child component of the CartPage component.
 * It renders the price adjustments forms for applying gift cards, coupons, and the shipping method.
 * All of which can adjust the cart total.
 *
 * @param {Object} props
 * @param {Function} props.setIsCartUpdating A callback function for setting the updating state of the cart.
 * @param {Object} props.classes CSS className overrides.
 * See [priceAdjustments.css]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/PriceAdjustments/priceAdjustments.css}
 * for a list of classes you can override.
 *
 * @returns {React.Element}
 *
 * @example <caption>Importing into your project</caption>
 * import PriceAdjustments from '@magento/venia-ui/lib/components/CartPage/PriceAdjustments'
 */
const PriceAdjustments = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    // const [couponCode, setCouponCode] = useState('');

    const { formatMessage } = useIntl();

    const { setIsCartUpdating, couponCode, setCouponCode } = props;

    return (
        <div className={classes.root}>
            <Accordion canOpenMultiple={true}>
                <Section
                    id={'shipping_method'}
                    title={formatMessage({
                        id: 'priceAdjustment.estimateShipping',
                        defaultMessage: 'Deliver to'
                    })}
                >
                    <Suspense fallback={<LoadingIndicator />}>
                        <ShippingMethods
                            setIsCartUpdating={setIsCartUpdating}
                        />
                    </Suspense>
                </Section>
                <Section
                    id={'coupon_code'}
                    title={formatMessage({
                        id: 'priceAdjustment.couponCode',
                        defaultMessage: 'Enter Coupon Code'
                    })}
                >
                    <Suspense fallback={<LoadingIndicator />}>
                        <CouponCode
                            setIsCartUpdating={setIsCartUpdating}
                            setCouponCode={setCouponCode}
                            couponCode={couponCode}
                        />
                    </Suspense>
                </Section>
                {/* <GiftCardSection setIsCartUpdating={setIsCartUpdating} />
        <Section id={'gift_options'} title={'See Gift Options'}>
          <Suspense fallback={<LoadingIndicator />}>
            <GiftOptions />
          </Suspense>
        </Section> */}
            </Accordion>
        </div>
    );
};

export default PriceAdjustments;

PriceAdjustments.propTypes = {
    setIsCartUpdating: func
};
