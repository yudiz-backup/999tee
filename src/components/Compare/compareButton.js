import React, { useEffect, useState } from 'react';
import CREATE_COMPARE_LIST from '../../queries/createCompareList.graphql';
import ADDTO_COMPARE_LIST from '../../queries/addProductsToCompareList.graphql';
import { Util, useToasts } from '@magento/peregrine';
import classes from './compare.css';
import Icon from '../Icon';
import { BarChart as BarChartIcon } from 'react-feather';

import { useIntl } from 'react-intl';
import {
    useCompare,
    useCompareList,
    useRemoveCompare
} from '../../peregrine/lib/talons/Compare/useCompare';
import COMPARE_LIST from '../../queries/compareList.graphql';
import REMOVE_COMPARE_LIST from '../../queries/removeProductsFromCompareList.graphql';
import CustomerQuery from '../../queries/getCustomer.graphql';

const barchartIcon = <Icon src={BarChartIcon} size={20} />;
const CompareButton = props => {
    const { id } = props;
    const { formatMessage } = useIntl();
    const [added, setAdded] = useState(false);
    const [removed, setRemoved] = useState(false);

    const { data, refetch } = useCompareList({
        query: COMPARE_LIST
    });
    const { handleRemoveCompare, removeResponse } = useRemoveCompare({
        removeCompareMutation: REMOVE_COMPARE_LIST,
        CustomerQuery
    });
    let addedToComparelist = false;
    if (typeof data != 'undefined') {
        data.items.forEach(function(elem) {
            if (elem.product.id == id) {
                addedToComparelist = true;
            }
        });
    }
    const {
        handleCreateCompare,
        createCompareData,
        handleAddCompare,
        compareResponse
    } = useCompare({
        createCompareMutation: CREATE_COMPARE_LIST,
        addToCompareMutation: ADDTO_COMPARE_LIST
    });
    const [, { addToast }] = useToasts();

    useEffect(() => {
        if (typeof compareResponse != 'undefined' && added) {
            addToast({
                type: 'info',
                message: formatMessage({
                    id: 'compare.compareMessage',
                    defaultMessage: 'You have added product to compare list.'
                }),
                timeout: 5000
            });
            setAdded(false);
        }
    }, [addToast, added, compareResponse, formatMessage]);

    useEffect(() => {
        if (typeof removeResponse != 'undefined' && removed) {
            addToast({
                type: 'info',
                message: formatMessage({
                    id: 'compare.removeCompareMessage',
                    defaultMessage:
                        'You have removed product from compare list.'
                }),
                timeout: 5000
            });
            setRemoved(false);
        }
    }, [addToast, formatMessage, removeResponse, removed]);
    const { BrowserPersistence } = Util;
    const storage = new BrowserPersistence();

    if (
        createCompareData &&
        createCompareData.uid &&
        !storage.getItem('compare_uid')
    ) {
        storage.setItem('compare_uid', createCompareData.uid);
    }

    const addToCompare = async id => {
        var uid = storage.getItem('compare_uid')
            ? storage.getItem('compare_uid')
            : '';
        if (uid) {
            await handleAddCompare(id);
        } else {
            await handleCreateCompare(id);
        }
    };

    return (
        <React.Fragment>
            {addedToComparelist ? (
                <button
                    className={
                        classes.add_to_compare + ' ' + classes.added_to_compare
                    }
                    title="Remove from compare"
                    onClick={async () => {
                        await handleRemoveCompare(id);
                        await refetch();
                        setRemoved(true);
                    }}
                >
                    {barchartIcon}
                </button>
            ) : (
                <button
                    className={classes.add_to_compare}
                    title="Add to compare"
                    onClick={async () => {
                        await addToCompare(id);
                        setAdded(true);
                    }}
                >
                    {barchartIcon}
                </button>
            )}
        </React.Fragment>
    );
};
export default CompareButton;
