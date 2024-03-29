import React, { useState } from 'react';
import { bool, func, oneOf, shape, string } from 'prop-types';
import {
    Edit2 as Edit2Icon,
    Heart as HeartIcon,
    Trash as TrashIcon
} from 'react-feather';

import { mergeClasses } from '../../classify';
import Icon from '../Icon';

import defaultClasses from './section.css';
import DeleteModal from '../DeleteModal';

const icons = new Map()
    .set('Heart', HeartIcon)
    .set('Edit2', Edit2Icon)
    .set('Trash', TrashIcon);

const Section = props => {
    const { icon, isFilled, onClick, text} = props;
    const [categoryFlag, setCategoryFlag] = useState(false);
    const [deleteModalFlag, setDeleteModalFlag] = useState(false);
    const classes = mergeClasses(defaultClasses, props.classes);
    const iconClasses = { root: classes.icon };
    const iconSrc = icons.get(icon);

    if (isFilled) {
        iconClasses.root = classes.icon_filled;
    }

    return (
        <li className={classes.menuItem}>
            {/* {
                icon === "Trash" 
                  ? <>
                   <DeleteModal 
                         categoryFlag={categoryFlag}
                         setCategoryFlag={setDeleteModalFlag}
                         handleDeleteItem={onClick}
                   />
                  </>
                   : 
            } */}
         <>
                           <button onMouseDown={onClick}>
                                <Icon classes={iconClasses} size={16} src={iconSrc} />
                                <span className={classes.text}>{text}</span>
                            </button>
                   </>
        </li>
    );
};

Section.propTypes = {
    classes: shape({
        icon: string,
        icon_filled: string,
        menuItem: string,
        text: string
    }),
    icon: oneOf(['Edit2', 'Heart', 'Trash']),
    isFilled: bool,
    onClick: func,
    text: string
};

export default Section;
