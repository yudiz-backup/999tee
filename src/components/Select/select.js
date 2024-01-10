import React, { Component, Fragment } from 'react';
import { arrayOf, node, number, oneOfType, shape, string } from 'prop-types';
import { BasicSelect, Option, asField } from 'informed';
import { compose } from 'redux';

import classify from '../../classify';
import { FieldIcons, Message } from '../Field';
import defaultClasses from './select.css';

import Icon from '../Icon';
import { ChevronDown as ChevronDownIcon } from 'react-feather';

const arrow = <Icon src={ChevronDownIcon} size={24} />;

class Select extends Component {
    static propTypes = {
        classes: shape({
            input: string
        }),
        field: string.isRequired,
        fieldState: shape({
            value: oneOfType([number, string])
        }),
        items: arrayOf(
            shape({
                key: oneOfType([number, string]),
                label: string,
                value: oneOfType([number, string])
            })
        ),
        message: node
    };

    render() {
        const {
            classes,
            fieldState,
            items,
            message,
            selectPostfix = '',
            ...rest
        } = this.props;
        
        const options = items.map(
            ({
                disabled = null,
                hidden = null,
                label, content,
                __typename,
                name,
                order_number,
                id,
                category_id,
                value
            }, index) => {
                return <>
                    {/* <Option value=''>Selcet Country</Option> */}
                    <Option
                        disabled={disabled}
                        hidden={hidden}
                        key={
                            value ||
                            id ||
                            __typename === "GiftWrapCategoryOutput" && category_id || index
                        }
                        value={value || id || __typename === "GiftWrapCategoryOutput" && category_id || ''}
                    >
                        {label ||
                            content ||
                            order_number ||
                            __typename === "GiftWrapCategoryOutput" && name ||
                            (value != null ? value : '') || (!label && !value && index === 0 && selectPostfix ? `Select ${selectPostfix}` : !label && !value && index === 0 ? 'Select Option' : '')
                        }
                    </Option>
                </>
            }
        );

        const inputClass = fieldState.error
            ? classes.input_error
            : classes.input;

        return (
            <Fragment>
                <FieldIcons after={arrow}>
                    <BasicSelect
                        {...rest}
                        fieldState={fieldState}
                        className={inputClass}
                    >
                        {options}
                    </BasicSelect>
                </FieldIcons>
                <Message fieldState={fieldState}>{message}</Message>
            </Fragment>
        );
    }
}

export default compose(
    classify(defaultClasses),
    asField
)(Select);
