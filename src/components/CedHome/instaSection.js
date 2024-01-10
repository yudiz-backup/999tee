import React from 'react';
import { Link } from 'react-router-dom';
import defaultClasses from './instaSection.css';
import { mergeClasses } from '../../classify';
// import Icon from '@magento/venia-ui/lib/components/Icon';
// import { Plus as PlusIcon } from 'react-feather';

// const plusIcon = <Icon src={PlusIcon} size={25} />;

export default function instaSection(props) {
    const { data, imagePerRow } = props;
    const classes = mergeClasses(defaultClasses, props.classes);

    const instaGallerySection = data?.insta?.data?.slice(0, imagePerRow);

    return (
        <>
            {instaGallerySection && <div className="container-fluid insta-features-section">
                <div className="homepage_sections_head">
                    <h2 className="homepage_section_heading">
                        Styled on Insta
                    </h2>
                </div>
                <section className="style-on-insta-grid">
                    {/* <ul className="grid-view-box"> */}
                    <ul className={classes.grid_view}>
                        {instaGallerySection?.map((instaGallery, id) => (
                            <li
                                key={id}
                                className="mb-3"
                                // style={{ breakInside: 'avoid' }}
                            >
                                {/* <ul className="inner-element">
                                    <li> */}
                                <div
                                    className={`style-insta-element ${
                                        defaultClasses.insta_hover_wrapper
                                    }`}
                                >
                                    <img
                                        className="img-box w-100"
                                        src={instaGallery.instaImage}
                                        alt=""
                                    />
                                    <div
                                        className={
                                            defaultClasses.tool_tip_wrapper
                                        }
                                    >
                                        <button />
                                     <Link to={instaGallery.productUrl} className={''} >
                                                <div className={defaultClasses.card_hover} >
                                                    <div className={defaultClasses.thumbnail_tooltip}>
                                                        <img className={` `} src={instaGallery.productImage} alt="of Dress-1" />
                                                    </div>
                                                    <div className={defaultClasses.hover_wrapper}>
                                                        <div className={defaultClasses.title}>{instaGallery.name}</div>
                                                        <div className={defaultClasses.title}>{instaGallery.price}</div>
                                                    </div>
                                                    <div className="fs-tag-arrow">
                                                    </div>
                                                </div>
                                            </Link>
                                    </div>
                          
                                </div>
                                {/* </li>
                                </ul> */}
                            </li>
                        ))}
                    </ul>
                    {/* {next && data && data.insta && data.insta.data.length && next < data.insta.data.length && (
                        <button
                            className={classes.loadmore}
                            onClick={handleMoreImage}
                        >
                            {plusIcon}
                        </button>
                    )} */}
                </section>
            </div>}
        </>
    );
}
