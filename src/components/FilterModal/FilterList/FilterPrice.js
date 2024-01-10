import React, { useState, useEffect } from 'react';
import { Util } from '@magento/peregrine';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';
import { useLocation } from 'react-router-dom';
import { colorPerRow } from '../../Gallery/item';

const FilterPrice = props => {
    const { search } = useLocation();

    const {
        onApply,
        filterApi,
        filterState,
        items,
        group,
        enableInfiniteScroll,
        setPagenum,
        filter,
        isApplying,
    } = props;
    const { removeItem, addItem } = filterApi;
    let selectedValue = '';

    if (filterState) {
        filterState.forEach(element => {
            selectedValue = element.value;
        });
    }
    var dynamicStep = 10;
    const firstItem = items[0];
    const lastItem = items[items.length - 1];
    const firstpricearr = firstItem.value.split('_');
    const lastpricearr = lastItem.value.split('_');
    const firstprice = parseFloat(
        firstpricearr[0] == '*' ? 0 : parseInt(firstpricearr[0])
    );

    const lastprice =
        firstpricearr && firstpricearr[1]
            ? parseInt(lastpricearr[1])
            // ? parseInt(lastpricearr[0]) + parseInt(firstpricearr[1])
            : parseInt(lastpricearr[0]);
 

    const { BrowserPersistence } = Util;
    const storage = new BrowserPersistence();
    const scopeConfig = storage.getItem('scope_data');
    let currentCurrency = storage.getItem('content_currency');
    if (typeof currentCurrency == 'undefined' || !currentCurrency) {
        if (typeof scopeConfig != 'undefined')
            currentCurrency = scopeConfig.default_display_currency_code;
    }
    const queryString = window.location.search;
    const queryStringArr = queryString.split('&');
    let maxValue;
    let minValue;
    queryStringArr.forEach(ele => {
        if (ele.includes('price')) {
            maxValue = ele.split('_')[1];
            minValue = ele
                .split('_')[0]
                .slice(ele.indexOf('C') + 1, ele.split('_')[0].length);
        }
    });
    let initialValue = {};
    if (selectedValue == '') {
        initialValue = {
            min:
                typeof minValue != 'undefined'
                    ? minValue
                    : firstprice,
            max:
                typeof maxValue != 'undefined'
                    ? maxValue  
                    : lastprice
        };
    }

    const [rslider, setRslider] = useState(initialValue);
    const [selectedValues, setSelectedValues] = useState({});
    const [sliderStart, setSliderStart] = useState(false);
    
    useEffect(() => {
        if (firstpricearr[0] || lastpricearr[1]) {
            setRslider({ max: +lastpricearr[1], min: +firstpricearr[0] })
        }
    }, [firstpricearr[0], lastpricearr[1]])

    if (
        selectedValue &&
        Object.keys(selectedValues).length <= 0 &&
        sliderStart == false
    ) {
        const val = selectedValue.split('_');
        const selectedPrice = { min: val[0], max: val[1] };
        setRslider(selectedPrice);
        setSelectedValues(selectedPrice);
    }

    const handleChangeComplete = async value => {
        if (enableInfiniteScroll == 1) {
            setPagenum(1);
        }
        setSliderStart(true);
        setRslider(value);
        setSelectedValues({});
        const newItem = {
            title: value.min + '-' + value.max,
            value: value.min + '_' + value.max
        };
        if (filterState) {
            for (const item of filterState) {
                removeItem({ group, item });
            }
        }
        addItem({ group, item: newItem });
        if (typeof onApply != 'undefined') {
            onApply();
        }
        setSliderStart(false);
    };

    const handleOnChange = async value => {
        setSliderStart(true);
        setRslider(value);
    };

    useEffect(() => {
        const params = new URLSearchParams(search).getAll('price[filter]');
        if (!params || !params.length) {
            setRslider(initialValue)
        }
        //eslint-disable-next-line
    }, [search])

    return (
        <div className="price_wrap">
            <InputRange
                step={dynamicStep}
                maxValue={lastprice}
                minValue={firstprice}
                value={rslider}
                onChange={value => handleOnChange(value)}
                onChangeComplete={value => handleChangeComplete(value)}
            />
            <div className='min_max_label_wrapper'>
                {/* <span>{`₹${selectedMinMaxValue.min}`}</span>
            <span>{`₹${selectedMinMaxValue.max}`}</span> */}
                <span>{firstpricearr[0]}</span>
                <span>{lastpricearr[1]}</span>
            </div>
        </div>
    );
};

export default FilterPrice;
