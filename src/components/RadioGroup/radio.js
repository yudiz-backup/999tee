import React, { Component } from 'react';
import { Circle } from 'react-feather';
import { node, shape, string } from 'prop-types';
import { Radio } from 'informed';

import classify from '../../classify';
import defaultClasses from './radio.css';

/* TODO: change lint config to use `label-has-associated-control` */
/* eslint-disable jsx-a11y/label-has-for */

export class RadioOption extends Component {
    static propTypes = {
        classes: shape({
            input: string,
            label: string,
            root: string,
            icon: string
        }),
        label: node.isRequired,
        value: node.isRequired
    };

    render() {
        const { props } = this;
        const { classes, id, label, value, ...rest } = props;

        return (
            <label className={classes.root} htmlFor={id}>
             <div className={classes.group_checkbox}>
             <Radio
                    {...rest}
                    className={classes.input}
                    id={id}
                    value={value}
                />
                <span className={classes.icon}>
                    <Circle />
                </span>
             </div>
                <span className={classes.label}>
                    {label || (value != null ? value : '')}
                </span>
            </label>
        );
    }
}

/* eslint-enable jsx-a11y/label-has-for */

export default classify(defaultClasses)(RadioOption);
