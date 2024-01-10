import React/* , { useCallback, useEffect } */ from 'react';
import { FormattedMessage } from 'react-intl';
import { ChevronDown as ArrowDown, ChevronUp as ArrowUp } from 'react-feather';

import Icon from '../../Icon';
import { mergeClasses } from '../../../classify';

import defaultClasses from './showAllButton.css';

const ShowAllButton = props => {
    const { setShowAllItems, showAllItems, isArrowDownIcon = true, suffixMessage = '' } = props;
    const classes = mergeClasses(defaultClasses, props.classes || {});
    // const handleClick = useCallback(() => {
    //     onClick();
    // }, [onClick]);

    const handleClick = () => {
        setShowAllItems(!showAllItems);
    };
    return (
        <>
            <button className={classes.root} onClick={handleClick}>
                <span className={classes.content}>
                    <span className={classes.text}>
                        {suffixMessage ? (
                            suffixMessage
                        ) : (
                            <FormattedMessage
                                id={'checkoutPage.showAllItems'}
                                defaultMessage={`SHOW ALL ITEMS`}
                            />
                        )}
                    </span>
                    {isArrowDownIcon ? (
                        <Icon
                            src={ArrowDown}
                            classes={{
                                root: classes.arrowDown
                            }}
                        />
                    ) : (
                        <Icon
                            src={ArrowUp}
                            classes={{
                                root: classes.arrowDown
                            }}
                        />
                    )}
                </span>
            </button>
        </>
    );
};

export default ShowAllButton;
