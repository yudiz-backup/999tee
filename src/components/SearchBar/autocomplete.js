import React from 'react';
import { gql } from '@apollo/client';
import { bool, func, shape, string } from 'prop-types';
import { useAutocomplete } from 'src/peregrine/lib/talons/SearchBar';
// import { useIntl } from 'react-intl';

import defaultClasses from './autocomplete.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Suggestions from './suggestions';

const GET_AUTOCOMPLETE_RESULTS = gql`
    query getAutocompleteResults($inputText: String!) {
        # Limit results to first three.
        products(search: $inputText, currentPage: 1, pageSize: 3) {
            aggregations {
                label
                count
                attribute_code
                options {
                    label
                    value
                }
            }
            items {
                id
                name
                small_image {
                    url
                }
                url_key
                sku
                url_suffix
                price {
                    regularPrice {
                        amount {
                            value
                            currency
                        }
                    }
                }
            }
            page_info {
                total_pages
            }
            total_count
        }
    }
`;

const Autocomplete = props => {
    const {
        setVisible,
        valid,
        visible,
        handleSearchTriggerClick,
        setTriggerSearch
    } = props;
    const talonProps = useAutocomplete({
        queries: {
            getAutocompleteResults: GET_AUTOCOMPLETE_RESULTS
        },
        valid,
        visible
    });
    const {
        displayResult,
        filters,
        // messageType,
        products,
        // resultCount,
        value
    } = talonProps;

    const classes = mergeClasses(defaultClasses, props.classes);
    const rootClassName = visible ? classes.root_visible : classes.root_hidden;

    // const { formatMessage } = useIntl();
    // const MESSAGES = new Map()
    //     .set(
    //         'ERROR',
    //         formatMessage({
    //             id: 'autocomplete.error',
    //             defaultMessage: 'An error occurred while fetching results.'
    //         })
    //     )
    //     .set(
    //         'LOADING',
    //         formatMessage({
    //             id: 'autocomplete.loading',
    //             defaultMessage: 'Fetching results...'
    //         })
    //     )
    //     .set(
    //         'PROMPT',
    //         formatMessage({
    //             id: 'autocomplete.prompt',
    //             defaultMessage: 'Search for a product...'
    //         })
    //     )
    //     .set(
    //         'EMPTY_RESULT',
    //         formatMessage({
    //             id: 'autocomplete.emptyResult',
    //             defaultMessage: 'No results were found.'
    //         })
    //     )
    //     .set('RESULT_SUMMARY', (_, resultCount) =>
    //         formatMessage(
    //             {
    //                 id: 'autocomplete.resultSummary',
    //                 defaultMessage: '{resultCount} items'
    //             },
    //             { resultCount: resultCount }
    //         )
    //     );

    // const messageTpl = MESSAGES.get(messageType);
    // const message =
    //     typeof messageTpl === 'function'
    //         ? messageTpl`${resultCount}`
    //         : messageTpl;

    return (
        <div className={rootClassName}>
            {/* <div className={classes.message}>{message}</div> */}
            {/* <div className={classes.suggestions}> */}
            <Suggestions
                setTriggerSearch={setTriggerSearch}
                displayResult={displayResult}
                products={products || {}}
                filters={filters}
                searchValue={value}
                setVisible={setVisible}
                visible={visible}
                handleSearchTriggerClick={handleSearchTriggerClick}
            />
            {/* </div> */}
        </div>
    );
};

export default Autocomplete;

Autocomplete.propTypes = {
    classes: shape({
        message: string,
        root_hidden: string,
        root_visible: string,
        suggestions: string
    }),
    setVisible: func,
    visible: bool
};
