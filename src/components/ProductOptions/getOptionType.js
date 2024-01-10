const customAttributes = {
    bg_color: 'swatch'
};

export default ({ attribute_code: code } = {}) => customAttributes[code];
