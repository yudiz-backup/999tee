import React from 'react';
import { func, number, shape, string } from 'prop-types';
import { useCategoryBranch } from '@magento/peregrine/lib/talons/CategoryTree';
import { mergeClasses } from '../../classify';
import defaultClasses from './categoryBranch.css';
import leafdefaultClasses from './categoryLeaf.css';
import storeClass from '../Header/storeSwitcher.css';

const Branch = props => {
    const { category, setCategoryId } = props;
    const { name } = category;
    const classes = mergeClasses(defaultClasses, props.classes);

    const talonProps = useCategoryBranch({ category, setCategoryId });
    const { exclude, handleClick } = talonProps;

    if (exclude) {
        return null;
    }

    return (
       <>
        <li className={classes.root}>
            <button
                aria-label="select"
                className={leafdefaultClasses.target}
                type="button"
                onClick={handleClick}
            >
                <span className={classes.text}>{name}</span>
                <span className={leafdefaultClasses.icon}>
                    <img
                        className={storeClass.drop_down_ing}
                        src="/cenia-static/images/select.png"
                        alt="select"
                        width="10"
                        height="6"
                    />
                </span>
            </button>
        </li>
       </>
    );
};

export default Branch;

Branch.propTypes = {
    category: shape({
        id: number.isRequired,
        include_in_menu: number,
        name: string.isRequired
    }).isRequired,
    classes: shape({
        root: string,
        target: string,
        text: string
    }),
    setCategoryId: func.isRequired
};
