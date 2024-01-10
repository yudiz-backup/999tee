import React, { Fragment } from 'react';
import { useProduct } from 'src/peregrine/lib/talons/RootComponents/Product/useProduct';
import { Title, Meta, Link } from '../../components/Head';
import { fullPageLoadingIndicator } from '../../components/LoadingIndicator';
import ProductFullDetail from '../../components/ProductFullDetail';
import defaultClasses from './product.css';
import getUrlKey from '../../util/getUrlKey';
import mapProduct from '../../util/mapProduct';
import { resourceUrl, Link as Linktag } from 'src/drivers';
import {
    JSONLD,
    Product,
    AggregateRating,
    Review,
    Generic
} from 'react-structured-data';
/*
 * As of this writing, there is no single Product query type in the M2.3 schema.
 * The recommended solution is to use filter criteria on a Products query.
 * However, the `id` argument is not supported. See
 * https://github.com/magento/graphql-ce/issues/86
 * TODO: Replace with a single product query when possible.
 */
import { GET_PRODUCT_DETAIL_QUERY } from './product.gql';

const ProductRoot = () => {
    const talonProps = useProduct({
        mapProduct,
        queries: {
            getProductQuery: GET_PRODUCT_DETAIL_QUERY
        },
        urlKey: getUrlKey()
    });
    const { error, loading, product } = talonProps;

    if (loading && !product) return fullPageLoadingIndicator;
    if (error && !product) return <div>Data Fetch Error</div>;
    if (!product) {
        return (
            <div className={defaultClasses.page_not_find}>
                <div className={'container' + ' ' + defaultClasses.container}>
                    <div className={'row'}>
                        <div className={'col-12'}>
                            <div className={defaultClasses.not_found_text}>
                                <h1>This item is out of stock!</h1>
                                <Linktag to="/">Back to HomePage</Linktag>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const c_url = window.location.href;
    var storeView = 'en_US';
    const siteName = window.location.hostname;
    let baseUrl = window.location.origin;
    if (process.env.IMAGE_OPTIMIZING_ORIGIN == 'backend') {
        baseUrl = '';
    }
    const title = `${product.meta_title
        ? product.meta_title
        : product.name + '|' + STORE_NAME
        }`;

    const metaKeyword = `${product.meta_keyword ? product.meta_keyword : META_KEYWORDS
        }`;
    const Gtin8 =
        product && product.structureData && product.structureData.gtin8;
    const PriceCurrency =
        product &&
        product.structureData &&
        product.structureData.offers &&
        product.structureData.offers.priceCurrency;
    const metaDescription =
        product && product.meta_description
            ? product.meta_description
            : META_DESCRIPTION;
    const price =
        product &&
        product.structureData &&
        product.structureData.offers &&
        product.structureData.offers.price;
    const itemOffered =
        product &&
        product.structureData &&
        product.structureData.offers &&
        product.structureData.offers.itemOffered;

    const availability =
        product &&
        product.structureData &&
        product.structureData.offers &&
        product.structureData.offers.availability;
    const url =
        product &&
        product.structureData &&
        product.structureData.offers &&
        product.structureData.offers.url;
    var productImage = 'cenia-static/icons/cenia_square_512.png';

    if (product && product.media_gallery_entries) {
        var imageData = product.media_gallery_entries;
        imageData.forEach(element => {
            productImage = resourceUrl(element.file, {
                type: 'image-product',
                width: 700,
                height: 700
            });
            return;
        });
    }
    let ratingSummary = product && product.rating_summary;
    const reviewCount = product && product.review_count;

    if (reviewCount == 0) {
        ratingSummary = '90';
    }
    // Note: STORE_NAME is injected by Webpack at build time.
    return (
        <Fragment>
            <Title>{title}</Title>
            <Meta name="robots" content={'INDEX,FOLLOW'} />
            <Meta name="title" content={title} />
            <Meta name="description" content={metaDescription} />
            <Meta name="keywords" content={metaKeyword} />
            <Meta name="format-detection" content="telephone=no" />
            <Link rel="canonical" href={c_url} />
            <Meta name="og:locale" content={storeView} />
            <Meta name="og:type" content={'Product'} />
            <Meta property="og:image" content={baseUrl + productImage} />
            <Meta name="og:title" content={title} />
            <Meta name="og:description" content={metaDescription} />
            <Meta name="og:url" content={c_url} />
            <Meta name="og:site_name" content={siteName} />
            <Meta name="twitter:card" content={'summary_large_image'} />
            <Meta name="twitter:description" content={metaDescription} />
            <Meta name="twitter:title" content={title} />
            <Meta name="twitter:image" content={baseUrl + productImage} />
            <Meta name="twitter:site" content={siteName} />
            <Meta name="twitter:url" content={c_url} />

            <JSONLD>
                <Product
                    name={product.name}
                    image={baseUrl + productImage}
                    description={metaDescription}
                    url={c_url}
                    sku={product.sku}
                >
                    <Review type="Review" author={STORE_NAME} />
                    <AggregateRating
                        bestRating={100}
                        worstRating={0}
                        ratingValue={ratingSummary}
                        reviewCount={reviewCount}
                    />
                    <Generic
                        type="brand"
                        jsonldtype="Brand"
                        schema={{ name: STORE_NAME }}
                    />
                    <Generic
                        type="offers"
                        jsonldtype="AggregateOffer"
                        schema={{
                            PriceCurrency,
                            price,
                            itemOffered,
                            availability,
                            url
                        }}
                    />
                    <Generic
                        type="gtin8"
                        jsonldtype="gtin8"
                        schema={{ Gtin8 }}
                    />
                </Product>
            </JSONLD>
            <ProductFullDetail product={product} />
        </Fragment>
    );
};

export default ProductRoot;
