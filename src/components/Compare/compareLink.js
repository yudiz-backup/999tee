import React from 'react';
import { Link } from 'react-router-dom';
import classes from './compare.css';
import { Util } from '@magento/peregrine';
import Icon from '../Icon';
import { BarChart as BarChartIcon } from 'react-feather';
const barchartIcon = <Icon src={BarChartIcon} size={20} />;
const CompareLink = props => {
    const { currentUser, isSignedIn } = props;

    const { BrowserPersistence } = Util;
    const storage = new BrowserPersistence();

    const compareCount =
        currentUser.compare_list && currentUser.compare_list.item_count
            ? currentUser.compare_list.item_count
            : 0;
    const uid = storage.getItem('compare_uid')
        ? storage.getItem('compare_uid')
        : '';

    if (compareCount == 0 && !uid) {
        return <div />;
    }
    if (uid && !isSignedIn) {
        return (
            <span title="Compare" className={classes.compare_link_wrap}>
                <Link
                    to="/compare_products"
                    className={classes.compare_link}
                    //to="/compare_products"
                >
                    {barchartIcon}
                </Link>
            </span>
        );
    }
    if (compareCount && uid && isSignedIn) {
        return (
            <span title="Compare" className={classes.compare_link_wrap}>
                <Link className={classes.compare_link} to="/compare_products">
                    <span>{barchartIcon}</span>
                    <span className={classes.counter}>{compareCount}</span>
                </Link>
            </span>
        );
    }
    return <div />;
};
export default CompareLink;
