import React, { useCallback } from 'react';
import { shape, string } from 'prop-types';
import { mergeClasses } from '../../../classify';
import defaultClasses from './currentFilter.css';
import { X as XIcon } from 'react-feather';
import Icon from '../../Icon';
const CurrentFilter = props => {
    const { group, item, removeItem, onApply, label } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    const barchartIcon = <Icon src={XIcon} size={20} />;
    
    const handleClick = useCallback(() => {
        removeItem({ group, item });
        onApply();
    }, [onApply, group, item, removeItem]);

    return (
        <span className={classes.root} onClick={handleClick}>
            <span className={classes.text}>{`${label} : ${group !== 'price' ? item.title : `₹${item.title.split('-')[0]}-₹${item.title.split('-')[1]}`}`}</span>
            {barchartIcon}
        </span>
    );
};

export default CurrentFilter;

CurrentFilter.propTypes = {
    classes: shape({
        root: string
    })
};
