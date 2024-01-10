import React from 'react';
import { number, shape, string } from 'prop-types';

import { Price } from '@magento/peregrine';
import { FormattedMessage, useIntl } from 'react-intl';
import { mergeClasses } from '../../classify';

import defaultClasses from './totalsSummary.css';

const TotalsSummary = props => {
    // Props.
    const { currencyCode, numItems, subtotal } = props;
    const { formatMessage } = useIntl();

    // Members.
    const classes = mergeClasses(defaultClasses, props.classes);
    const hasSubtotal = Boolean(subtotal);
    const numItemsText =
        numItems === 1
            ? formatMessage({
                  id: 'totalsSummary.singleNumItem',
                  defaultMessage: 'item'
              })
            : formatMessage({
                  id: 'totalsSummary.multipleNumItem',
                  defaultMessage: 'items'
              });

    return (
        <div className={classes.root}>
            {hasSubtotal && (
                <dl className={classes.totals}>
                    <dt className={classes.subtotalLabel}>
                        <span>
                            <FormattedMessage
                                id={'totalsSummary.subtotalLabel'}
                                defaultMessage={'Cart Total : '}
                            />

                            <Price
                                currencyCode={currencyCode}
                                value={subtotal}
                            />
                        </span>
                    </dt>
                    <dd className={classes.subtotalValue}>
                        ({numItems} {numItemsText})
                    </dd>
                </dl>
            )}
        </div>
    );
};

TotalsSummary.propTypes = {
    classes: shape({
        root: string,
        subtotalLabel: string,
        subtotalValue: string,
        totals: string
    }),
    currencyCode: string,
    numItems: number,
    subtotal: number
};

export default TotalsSummary;
