import React, { useEffect } from 'react';
import {
    useCompareList,
    useRemoveCompare
} from '../../peregrine/lib/talons/Compare/useCompare';
import COMPARE_LIST from '../../queries/compareList.graphql';
import { fullPageLoadingIndicator } from '../LoadingIndicator';
import CustomerQuery from '../../queries/getCustomer.graphql';
import RichContent from '../../components/RichContent';
import REMOVE_COMPARE_LIST from '../../queries/removeProductsFromCompareList.graphql';
import classes from './compare.css';
import Product from './product';
import { useToasts } from '@magento/peregrine';
import { useIntl } from 'react-intl';

const CompareProducts = () => {
    const { formatMessage } = useIntl();
    const { data, refetch, loading } = useCompareList({
        query: COMPARE_LIST
    });
    const [, { addToast }] = useToasts();
    const { handleRemoveCompare, removeResponse } = useRemoveCompare({
        removeCompareMutation: REMOVE_COMPARE_LIST,
        CustomerQuery
    });
    useEffect(() => {
        if (typeof removeResponse != 'undefined') {
            addToast({
                type: 'info',
                message: formatMessage({
                    id: 'compare.removeCompareMessage',
                    defaultMessage:
                        'You have removed product from compare list.'
                }),
                timeout: 5000
            });
        }
    }, [addToast, formatMessage, removeResponse]);
    return (
        <div
            className={
                classes.table_wrapper +
                ' ' +
                classes.comparison +
                ' ' +
                'container'
            }
        >
            {' '}
            {loading && fullPageLoadingIndicator}
            <h1 className={classes.comparison_heading}>Compare Products</h1>
            <div
                className={
                    classes.data +
                    ' ' +
                    classes.table +
                    ' ' +
                    classes.table_comparison
                }
                id="product-comparison"
            >
                <div>
                    <div className={classes.cell_wrap}>
                        <div
                            className={
                                classes.cell +
                                ' ' +
                                classes.label +
                                ' ' +
                                classes.product
                            }
                        >
                            <span>Product</span>
                        </div>
                        {data &&
                            data.items &&
                            data.items.map((value, index) => {
                                return (
                                    <Product
                                        value={value}
                                        handleRemoveCompare={
                                            handleRemoveCompare
                                        }
                                        index={index + 'image'}
                                        classes={classes}
                                        refetch={refetch}
                                    />
                                );
                            })}
                    </div>
                </div>
                <div>
                    <div className={classes.cell_wrap}>
                        <div
                            className={
                                classes.cell +
                                ' ' +
                                classes.label +
                                ' ' +
                                classes.product
                            }
                        >
                            <span className="attribute label">SKU </span>
                        </div>
                        {data &&
                            data.items &&
                            data.items.map((value, index) => {
                                return (
                                    <div
                                        key={index + 'sku'}
                                        className={
                                            classes.cell +
                                            ' ' +
                                            classes.product +
                                            ' ' +
                                            classes.attribute_head
                                        }
                                    >
                                        <div className="attribute value">
                                            {value &&
                                                value.product &&
                                                value.product.sku}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                    <div className={classes.cell_wrap}>
                        <div
                            className={
                                classes.cell +
                                ' ' +
                                classes.label +
                                ' ' +
                                classes.product
                            }
                        >
                            <span className="attribute label">
                                Description{' '}
                            </span>
                        </div>
                        {data &&
                            data.items &&
                            data.items.map((value, index) => {
                                return (
                                    <div
                                        key={index + 'desc'}
                                        className={
                                            classes.cell +
                                            ' ' +
                                            classes.product +
                                            ' ' +
                                            classes.attribute_head
                                        }
                                    >
                                        <div className="attribute value">
                                            <RichContent
                                                html={
                                                    value &&
                                                    value.product &&
                                                    value.product.description &&
                                                    value.product.description
                                                        .html
                                                }
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompareProducts;
