import React from 'react';
import { Price } from '@magento/peregrine';

import { mergeClasses } from '../../../../classify';
import Image from '../../../Image';
import defaultClasses from './productDetail.css';
import { resourceUrl } from 'src/drivers';

const IMAGE_SIZE = 240;

// const stockStatusLabels = new Map([
//     ['IN_STOCK', 'In stock'],
//     ['OUT_OF_STOCK', 'Out of stock']
// ]);

const ProductDetail = props => {
    const { item, variantPrice, img } = props;
    const { prices, product, item_image/* , item_design_url */ } = item;
    const { price } = prices;
    const { currency, value: unitPrice } = variantPrice || price;
    const {
        name,
        sku,
        // small_image: smallImage,
        // stock_status: stockStatusValue
    } = product;
    // const { url: imageURL } = smallImage;
    // const stockStatus = stockStatusLabels.get(stockStatusValue) || 'Unknown';

    const classes = mergeClasses(defaultClasses, props.classes);

    return (
        <div className={classes.root}>
            <Image
                alt={name}
                classes={{ image: classes.image, root: classes.imageContainer }}
                width={IMAGE_SIZE}
                resource={img ? resourceUrl(img) : item_image}
            />
            {/* <img
                                                                src={item_image}
                                                                // alt={`image_${index}`}
                                                                // height={650}
                                                                width={IMAGE_SIZE}
                                                            /> */}
            <span className={classes.productName}>{name}</span>
            <div className={classes.stockRow}>
                <span>{`SKU # ${sku}`}</span>
                {/* <span className={classes.stockRow_status}>{stockStatus}</span> */}
            </div>
            <div className={classes.price}>
                <Price currencyCode={currency || "INR"} value={unitPrice} />
            </div>
        </div>
    );
};

export default ProductDetail;
