import React from 'react';
import Slider from 'react-slick';
import './customSliderStyle.css';

const CustomSlider = React.forwardRef(({ settings, items }, ref) => {
    return <Slider {...settings} ref={ref}>{items}</Slider>;
})

export default CustomSlider;
