import React, { useState } from 'react';
import { Price } from '@magento/peregrine';
import { mergeClasses } from '../../../classify';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { PlusCircle, MinusCircle } from 'react-feather';

const GstTaxSummary = props => {
    const { cartDetails, priceClass, gstTaxTotal } = props;

    const classes = mergeClasses(props.classes);

    const [isDisplayGstTaxSummary, setIsDisplayGstTaxSummary] = useState(false);

    return (
        <>
            <span className={classes.lineItemLabel}>
                GST Tax
                <span
                    className={classes.gst_tax_summary_icon_wrapper}
                    onClick={() =>
                        setIsDisplayGstTaxSummary(!isDisplayGstTaxSummary)
                    }
                >
                    {isDisplayGstTaxSummary ? (
                        <Icon src={MinusCircle} size={18} />
                    ) : (
                        <Icon src={PlusCircle} size={18} />
                    )}
                </span>
            </span>
            <span className={priceClass}>
                <Price value={gstTaxTotal} currencyCode={'INR'} />
            </span>
            {isDisplayGstTaxSummary ? (
                <>
                    {cartDetails?.prices?.sgst?.[0]?.value !== 0 &&
                        cartDetails?.prices?.sgst?.length !== 0 && (
                            <>
                                <span className={classes.lineItemLabel}>
                                    {cartDetails?.prices?.sgst?.map(
                                        title => title.title
                                    )}
                                </span>
                                <span className={priceClass}>
                                    <Price
                                        value={cartDetails?.prices?.sgst?.map(
                                            value => value.value
                                        )
                                        }
                                        currencyCode={'INR'}
                                    />
                                </span>
                            </>
                        )}

                    {cartDetails?.prices?.cgst?.[0]?.value !== 0 &&
                        cartDetails?.prices?.cgst?.length !== 0 && (
                            <>
                                <span className={classes.lineItemLabel}>
                                    {cartDetails?.prices?.cgst?.map(
                                        title => title.title
                                    )}
                                </span>
                                <span className={priceClass}>
                                    <Price
                                        value={cartDetails?.prices?.cgst?.map(
                                            value => value.value
                                        )
                                        }
                                        currencyCode={'INR'}
                                    />
                                </span>
                            </>
                        )}

                    {cartDetails?.prices?.igst?.[0]?.value !== 0 &&
                        cartDetails?.prices?.igst?.length !== 0 && (
                            <>
                                <span className={classes.lineItemLabel}>
                                    {cartDetails &&
                                        cartDetails.prices &&
                                        cartDetails.prices.igst.map(
                                            title => title.title
                                        )}
                                </span>
                                <span className={priceClass}>
                                    <Price
                                        value={cartDetails?.prices?.igst?.map(
                                            value => value.value
                                        )
                                        }
                                        currencyCode={'INR'}
                                    />
                                </span>
                            </>
                        )}

                    {cartDetails?.prices?.utgst?.[0]?.value !== 0 &&
                        cartDetails?.prices?.utgst?.length !== 0 && (
                            <>
                                <span className={classes.lineItemLabel}>
                                    {cartDetails?.prices?.utgst?.map(
                                        title => title.title
                                    )}
                                </span>
                                <span className={priceClass}>
                                    <Price
                                        value={cartDetails?.prices?.utgst?.map(
                                            value => value.value
                                        )
                                        }
                                        currencyCode={'INR'}
                                    />
                                </span>
                            </>
                        )}

                    {cartDetails?.prices?.shipping_cgst?.[0]?.value !== 0 &&
                        cartDetails?.prices?.shipping_cgst?.length !== 0 && (
                            <>
                                <span className={classes.lineItemLabel}>
                                    {cartDetails?.prices?.shipping_cgst?.map(
                                        title => title.title
                                    )}
                                </span>
                                <span className={priceClass}>
                                    <Price
                                        value={cartDetails?.prices?.shipping_cgst?.map(
                                            value => value.value
                                        )
                                        }
                                        currencyCode={'INR'}
                                    />
                                </span>
                            </>
                        )}

                    {cartDetails?.prices?.shipping_sgst?.[0]?.value !== 0 &&
                        cartDetails?.prices?.shipping_sgst?.length !== 0 && (
                            <>
                                <span className={classes.lineItemLabel}>
                                    {cartDetails?.prices?.shipping_sgst?.map(
                                        title => title.title
                                    )}
                                </span>
                                <span className={priceClass}>
                                    <Price
                                        value={cartDetails?.prices?.shipping_sgst?.map(
                                            value => value.value
                                        )
                                        }
                                        currencyCode={'INR'}
                                    />
                                </span>
                            </>
                        )}

                    {cartDetails?.prices?.shipping_igst?.[0]?.value !== 0 &&
                        cartDetails?.prices?.shipping_igst?.length !== 0 && (
                            <>
                                <span className={classes.lineItemLabel}>
                                    {cartDetails?.prices?.shipping_igst?.map(
                                        title => title.title
                                    )}
                                </span>
                                <span className={priceClass}>
                                    <Price
                                        value={cartDetails?.prices?.shipping_igst?.map(
                                            value => value.value
                                        )
                                        }
                                        currencyCode={'INR'}
                                    />
                                </span>
                            </>
                        )}
                    {cartDetails?.prices?.shipping_utgst?.[0]?.value !== 0 &&
                        cartDetails?.prices?.shipping_utgst?.length !== 0 && (
                            <>
                                <span className={classes.lineItemLabel}>
                                    {cartDetails?.prices?.shipping_utgst?.map(
                                        title => title.title
                                    )}
                                </span>
                                <span className={priceClass}>
                                    <Price
                                        value={cartDetails?.prices?.shipping_utgst?.map(
                                            value => value.value
                                        )
                                        }
                                        currencyCode={'INR'}
                                    />
                                </span>
                            </>
                        )}
                </>
            ) : (
                <></>
            )}
        </>
    );
};

export default GstTaxSummary;
