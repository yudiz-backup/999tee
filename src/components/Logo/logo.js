import React from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { mergeClasses } from '../../classify';
import Image from '../Image';
import header_logo_src from '../../queries/logo.graphql';
import secure_base_media_url from '../../queries/baseMediaUrl.graphql';
import { useQuery } from '@apollo/client';

/**
 * A component that renders a logo in the header.
 *
 * @typedef Logo
 * @kind functional component
 *
 * @param {props} props React component props
 *
 * @returns {React.Element} A React component that displays a logo.
 */
const Logo = props => {
    const { height, width } = props;
    const classes = mergeClasses({}, props.classes);
    const { formatMessage } = useIntl();

    const title = formatMessage({ id: 'logo.title' });

    const { data: baseMediaUrl } = useQuery(secure_base_media_url)
    const imgURL = baseMediaUrl?.storeConfig?.secure_base_media_url
    const { data: logoUrl } = useQuery(header_logo_src)
    const logoURL = logoUrl?.storeConfig?.header_logo_src

    return (
        <Image
            alt={title}
            classes={{ image: classes.logo }}
            height={height}
            src={`${imgURL}logo/${logoURL}`}
            width={width}
        />
    );
};

/**
 * Props for {@link Logo}
 *
 * @typedef props
 *
 * @property {Object} classes An object containing the class names for the
 * Logo component.
 * @property {string} classes.logo classes for logo
 * @property {number} height the height of the logo.
 */
Logo.propTypes = {
    classes: PropTypes.shape({
        logo: PropTypes.string
    }),
    height: PropTypes.number,
    width: PropTypes.number
};

Logo.defaultProps = {
    height: 44,
    width: 148
};

export default Logo;
