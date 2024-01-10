import React from 'react';
import Slider from 'react-slick';
import { mergeClasses } from '../../classify';
import defaultClasses from './testimonials.css';


const Testimonials = props => {

    const { data } = props

    const classes = mergeClasses(defaultClasses, props.classes);
    var settings = {
        dots: true,
        infinite: true,
        autoplay: true,
        speed: 4000,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,

    };

    return (
        <div>
            <div className={classes.testimonials}>
                <div className='container'>
                    <h2 className={classes.testimonials_title}>Testimonials</h2>
                    <div className={classes.testimonials_inner}>
                        <Slider {...settings}>
                            {data?.getTestimonialdata?.data?.map(item => <div>
                                <div className={classes.testimonials_desc} key={item?.id}>
                                    <p>{item?.text}</p>
                                    <span className={classes.author}>- {item?.auther}</span>
                                </div>
                            </div>)}
                        </Slider>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Testimonials;
