import React from 'react';
import { func, number, objectOf, shape, string } from 'prop-types';
import { useCategoryTree } from '@magento/peregrine/lib/talons/CategoryTree';

import { mergeClasses } from '../../classify';
import MENU_QUERY from '../../queries/getNavigationMenu.graphql';
import Branch from './categoryBranch';
import Leaf from './categoryLeaf';
import defaultClasses from './categoryTree.css';
import LoadingIndicator from '../LoadingIndicator';
// import { NavLink } from 'react-router-dom';
// import { FormattedMessage } from 'react-intl';

const Tree = props => {
    const {
        categories,
        categoryId,
        onNavigate,
        setCategoryId,
        updateCategories,
    } = props;

    const talonProps = useCategoryTree({
        categories,
        categoryId,
        query: MENU_QUERY,
        updateCategories,
    });
    const { data, childCategories, categoryLoading } = talonProps;
    const classes = mergeClasses(defaultClasses, props.classes);
    if (categoryLoading) return <LoadingIndicator />;
    // for each child category, render a direct link if it has no children
    // otherwise render a branch
    const branches = data
        ? Array.from(childCategories, childCategory => {
            const [id, { category, isLeaf }] = childCategory;
            const { include_in_menu } = category;
            if (!include_in_menu) {
                return;
            }
            return isLeaf ? (
                <Leaf key={id} category={category} onNavigate={onNavigate} />
            ) : (
               <>
                <Branch
                    key={id}
                    category={category}
                    setCategoryId={setCategoryId}
                />
               </>
            );
        })
        : null;

        
    return (
        <div className={classes.root}>
            <ul className={classes.tree}>
                {branches}
                {/* <li className={classes.sale_link}>
                <NavLink to="/sale.html">
                    <button onClick={()=>onNavigate()}>
                   <span>Sale</span>
                    </button>
                </NavLink>
                </li> */}
            </ul>
        </div>
    );
};

export default Tree;

Tree.propTypes = {
    categories: objectOf(
        shape({
            id: number.isRequired,
            name: string
        })
    ),
    categoryId: number.isRequired,
    classes: shape({
        root: string,
        tree: string
    }),
    onNavigate: func.isRequired,
    setCategoryId: func.isRequired,
    updateCategories: func.isRequired
};
