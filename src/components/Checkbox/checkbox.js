import React, { Component, Fragment } from 'react';
import { bool, node, shape, string } from 'prop-types';
import { BasicCheckbox, asField } from 'informed';
import { compose } from 'redux';

import classify from '../../classify';
import { Message } from '../Field';
import { CheckSquare, Square } from 'react-feather';
import defaultClasses from './checkbox.css';
import { Link } from 'src/drivers';

/* TODO: change lint config to use `label-has-associated-control` */
/* eslint-disable jsx-a11y/label-has-for */

const checkedIcon = <CheckSquare />;
const uncheckedIcon = <Square />;

export class Checkbox extends Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //       count: false
    //     };
    //   }
    constructor(props) {
        super(props);
        this.state = { colorCode: '' };

    }

    getColorCode() {
        if (this.props.item && this.props.item.group === 'color') {
            const colorDataItem = this.props.item.data.find(i => {
                const iValueId = i.colorValueId;
                const value = this.props.value
                return iValueId.toString() === value.toString()
            })
            if (colorDataItem) {
                this.setState({ colorCode: colorDataItem.colorCode })
            }
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (props.item && props.item.group === 'color') {
            const colorDataItem = props.item.data.find(i => {
                const iValueId = i.colorValueId;
                const value = props.value
                return iValueId.toString() === value.toString()
            })
            if (colorDataItem) {
                return { ...state, colorCode: colorDataItem.colorCode }
            } else {
                return null;
            }
        }
    }

    componentDidMount() {
        this.getColorCode();
    }

    static propTypes = {
        classes: shape({
            icon: string,
            input: string,
            label: string,
            message: string,
            root: string
        }),
        field: string.isRequired,
        fieldState: shape({
            value: bool
        }).isRequired,
        id: string,
        label: node.isRequired,
        message: node,
        customIcons: shape({
            check: node.isRequired,
            uncheck: node.isRequired
        })
    };

    render() {
        const {
            classes,
            fieldState,
            id,
            label,
            message,
            link,
            linkName,
            FilterColorIcon,
            linkNameColor,
            isDisplayOwnLabel = false,
            ...rest
        } = this.props;

        const { value: checked } = fieldState;
        const icon = checked ? checkedIcon : uncheckedIcon;
        return (
            <Fragment>
                <label className={classes.root + ' ' + classes.check_box} htmlFor={id}>
                    <BasicCheckbox
                        {...rest}
                        className={classes.input}
                        fieldState={fieldState}
                        id={id}
                        label={isDisplayOwnLabel ? label : ''}
                    />
                    <span className={classes.icon}>
                        {FilterColorIcon ? (
                            <FilterColorIcon
                                checked={checked}
                                color={this.state.colorCode}
                            />
                        ) : (
                            icon
                        )}
                    </span>
                    <div className={classes.checkboxItem}>
                        {rest.item &&
                            (rest.item.group !== "color") ? (
                            <span className={classes.label}>{label}</span>
                        ) : (
                            <span />
                        )}
                    {this.props?.hideAnchor ? '' : <Link to={link} target="_blank" style={{ color: linkNameColor }}>{linkName}</Link>}
                    </div>
                </label>
                <Message fieldState={fieldState}>{message}</Message>
            </Fragment>
        );
    }
}

/* eslint-enable jsx-a11y/label-has-for */

export default compose(
    classify(defaultClasses),
    asField
)(Checkbox);
