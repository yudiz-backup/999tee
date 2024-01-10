import React, { useState } from 'react';
import { func } from 'prop-types';
import { Search as SearchIcon, /* X as ClearIcon */ } from 'react-feather';
import { useSearchField } from 'src/peregrine/lib/talons/SearchBar';

import Icon from '@magento/venia-ui/lib/components/Icon';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
// import Trigger from '@magento/venia-ui/lib/components/Trigger';

// const clearIcon = <Icon src={ClearIcon} size={24} />;
const searchIcon = <Icon src={SearchIcon} size={24} />;

const SearchField = props => {
    const {
        onChange,
        onFocus,
        closeSearch,
        handleSearchTriggerClick,
        triggerSearch,
        setTriggerSearch,
        handleSubmit
    } = props;
    const [values, setValue] = useState(' ');
    const { inputRef/* , resetForm, value */ } = useSearchField();

    // const resetButton = value ? (
    //     <Trigger action={resetForm}>{clearIcon}</Trigger>
    // ) : null;

    const handleEnter = async e => {
        var code = e.keyCode ? e.keyCode : e.which;

        if (code == 13) {
            await closeSearch(e);
            handleSearchTriggerClick();
        }
    };
    const SearchResultShow = async () => {
        await handleSubmit({ search_query: values });
        handleSearchTriggerClick();
    };
    if (triggerSearch) {
        SearchResultShow();
        setTriggerSearch(false);
    }

    return (
        <TextInput
            // after={resetButton}
            before={searchIcon}
            field="search_query"
            onFocus={onFocus}
            onValueChange={onChange}
            forwardedRef={inputRef}
            onKeyDown={e => {
                handleEnter(e);
            }}
            onChange={e => {
                setValue(e.target.value);
            }}
            placeholder="Search Product"
        />
    );
};

export default SearchField;

SearchField.propTypes = {
    onChange: func,
    onFocus: func
};
