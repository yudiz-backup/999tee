import React from 'react'
import { useQuery } from '@apollo/client'
import onsale from '../../queries/onSale.graphql'
import defaultClasses from '../CedHome/home.css';;
// import sizeOptions from '../../queries/sizeOptions';
import SaleProduct from './saleProduct'
import LoadingIndicator from '../LoadingIndicator';

export default function OnSale() {
    const { data } = useQuery(onsale)
    const onSaleData = data && data.onsale && data.onsale.data
    const initialValue = {
        allColor: [],
        allSize: [],
        allImage: [],
        products: []
    }

    const uniqueConfigFileReduced = React.useMemo(() => {
        if (
            !onSaleData
        )
            return initialValue;
        return onSaleData.reduce(
            (prev, productItem) => {
                const {
                    description,
                    id,
                    sku,
                    name,
                    final_price,
                    urlkey,
                    regularPrice,
                    specialPrice,
                    image,
                    stock_status_data,
                    __typename,
                    type, child: product } = productItem

                const allColor = product && product.map(
                    color_code => color_code &&
                        color_code.configurable_options &&
                        color_code.configurable_options.map(attId => attId).filter(item =>
                            item.Attribute_code === 'color')[0].attribute_options[0].code
                );
                const allSize = product && product.map(
                    color_code => color_code &&
                        color_code.configurable_options &&
                        color_code.configurable_options.map(attId => attId).filter(item =>
                            item.Attribute_code !== 'color')[0].attribute_options[0].code
                );
                const colorAttr = product && product.map(
                    color_code => color_code &&
                        color_code.configurable_options &&
                        color_code.configurable_options.map(attId => attId).filter(item =>
                            item.Attribute_code === 'color')[0].Attribute_id
                );
                const sizeAttr = product && product.map(
                    color_code => color_code &&
                        color_code.configurable_options &&
                        color_code.configurable_options.map(attId => attId).filter(item =>
                            item.Attribute_code !== 'color')[0].Attribute_id
                );
                const uniqueProductItem =
                    product &&
                    product.filter(
                        (value, index, self) =>
                            index ===
                            self.findIndex(
                                (t) => {
                                    const hashCode = t && t.configurable_options && t.configurable_options.map(attId => attId)[0].attribute_options[0].code
                                    const valueHashCode = value && value.configurable_options && value.configurable_options.map(attId => attId)[0].attribute_options[0].code
                                    return hashCode === valueHashCode

                                })
                    );
                const merged = { ...prev };
                merged.allColor.push([...new Set(allColor)]);
                merged.allSize.push([...new Set(allSize)]);
                merged.allImage.push([...new Set(uniqueProductItem)]);

                merged.products.push({
                    description,
                    id,
                    sku,
                    name,
                    final_price,
                    type,
                    urlkey,
                    image,
                    variants: product,
                    regularPrice,
                    specialPrice,
                    stock_status_data,
                    __typename,
                    uniqueProductItem: [...new Set(uniqueProductItem)],
                    colors: [...new Set(allColor)],
                    sizes: [...new Set(allSize)],
                    colorAttr: [...new Set(colorAttr)],
                    sizeAtrr: [...new Set(sizeAttr)]

                })

                return merged;
            },
            {
                allColor: [],
                allSize: [],
                allImage: [],
                products: []
            }
        );
    }, [onSaleData, initialValue]);

    return (
        <section className={defaultClasses.onSale_page}>
            <div className="container-fluid">
                <div className="homepage_sections_head">
                    <h2 className="homepage_section_heading">Sale Page</h2></div>
                <div style={{ rowGap: '30px' }} className="row">
                    {uniqueConfigFileReduced &&
                        uniqueConfigFileReduced.products &&
                        uniqueConfigFileReduced.products.length > 0
                        ? uniqueConfigFileReduced.products.map((productItem) => {
                            return (
                                <div className='col-xl-3 col-lg-4 col-md-6'> <SaleProduct
                                    value={productItem}
                                    uniqueConfigFileReduced={uniqueConfigFileReduced} />
                                </div>
                            )
                        })
                        : <>
                            <LoadingIndicator />
                        </>
                    }
                </div>
            </div>
        </section>
    )
}
