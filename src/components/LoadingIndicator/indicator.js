import React from 'react';

import defaultClasses from './indicator.css';
import { mergeClasses } from '../../classify';
import preloader from '../../../cenia-static/images/preloader.gif'
// import { Loader as LoaderIcon } from 'react-feather';
// import Icon from '../Icon';

const LoadingIndicator = props => {
    const classes = mergeClasses(defaultClasses, props.classes);
    // const className = props.global ? classes.global : classes.root;

    return (
        <div className={classes.global}>
            <img
                width={100}
                height={100}
                src={preloader}
                alt="preloader"
            />
            {/* <Icon
                src={LoaderIcon}
                size={64}
                
            /> */}
            {/* <span className={classes.message}>{props.children}</span> */}
        </div>
    );
};

export default LoadingIndicator;
