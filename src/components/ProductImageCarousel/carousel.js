import React, { useState, useEffect, useRef } from 'react';
import { arrayOf, bool, number, shape, string } from 'prop-types';
import { useProductImageCarousel } from '@magento/peregrine/lib/talons/ProductImageCarousel/useProductImageCarousel';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import { resourceUrl } from 'src/drivers';
import '../ProductFullDetail/productFullDetail.css';

const DEFAULT_IMAGE_WIDTH = 640;
const IMAGE_SIZES = new Map();
IMAGE_SIZES.set('small', DEFAULT_IMAGE_WIDTH);

/**
 * Carousel component for product images
 * Carousel - Component that holds number of images
 * where typically one image visible, and other
 * images can be navigated through previous and next buttons
 *
 * @typedef ProductImageCarousel
 * @kind functional component
 *
 * @param {props} props
 *
 * @returns {React.Element} React carousel component that displays a product image
 */
const ProductImageCarousel = props => {
    const imageGalleryRef = useRef();
    const isAlreadyZoomInRef = useRef(false);
    const { images } = props;
    const [classSelector, setClassSelector] = useState({ check: false });
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [displaySlideIndex, setDisplaySlideIndex] = useState(0);

    const talonProps = useProductImageCarousel({
        images
    });
    var body = document.body;

    const { sortedImages } = talonProps;

    const imageGallerySlideCenter = document && document.querySelector('.image-gallery-slide.center');

    useEffect(() => {
        classSelector.check
            ? body.classList.add('static_header_bottomtool')
            : body.classList.remove('static_header_bottomtool');
    });


    const imageGallerySlides = document && document.querySelector(' .image-gallery-slides');
    const imageGalleryImage = document && document.querySelector('.image-gallery-slide.center .image-gallery-image');

    useEffect(() => {
        if (imageGallerySlideCenter && isFullScreen && imageGallerySlides && imageGalleryImage) {
            imageGallerySlides.style.height = '100%';
            imageGallerySlides.style.overflowX = 'hidden';
            imageGallerySlides.style.overflowY = 'scroll';
            imageGalleryImage.style.height = '120vh';
            imageGalleryImage.style.transitionDuration = '0.7s';
            imageGalleryImage.style.maxHeight = 'none';
            imageGallerySlideCenter.addEventListener('click', (e) => {
                if(isAlreadyZoomInRef.current){
                    isAlreadyZoomInRef.current = false
                    imageGalleryImage.style.cursor = 'zoom-in';
                    imageGallerySlideCenter.style.transform = 'scale(1)';
                } else {
                    isAlreadyZoomInRef.current = true
                    imageGallerySlideCenter.style.transform = 'scale(2)';
                    imageGallerySlideCenter.style.transformOrigin = `${e.clientX}px ${e.clientY}px`;
                    imageGallerySlideCenter.style.transitionDuration = '0.7s';
                    imageGalleryImage.style.cursor = 'grab';
                }
            });
        } else {
            if (imageGallerySlideCenter && imageGallerySlideCenter.style) {
                imageGallerySlideCenter.style.transform = 'none';
                imageGallerySlideCenter.style.overflow = 'hidden';
            }
            if(imageGalleryImage && imageGalleryImage.style){
                imageGalleryImage.style.height = 'auto';
                imageGalleryImage.style.cursor = 'zoom-in';
            }
            if(imageGallerySlides && imageGallerySlides.style) {
                imageGallerySlides.style.overflowY = 'hidden';
            }
        }
        return () => {
            if (imageGallerySlideCenter && imageGallerySlideCenter.style) {
                imageGallerySlideCenter.style.transform = 'none';
                imageGallerySlideCenter.style.overflow = 'hidden';
            }
            if(imageGalleryImage && imageGalleryImage.style){
                imageGalleryImage.style.height = 'auto';
                imageGalleryImage.style.cursor = 'zoom-in';
            }
            if(imageGallerySlides && imageGallerySlides.style) {
                imageGallerySlides.style.overflowY = 'hidden';
            }
        };
    }, [isFullScreen, displaySlideIndex]);

    useEffect(() => {
        if (imageGalleryRef && imageGalleryRef.current && isFullScreen) {
            imageGalleryRef.current.fullScreen();
        }
    }, [isFullScreen]);
    
    // function to render youtube video for product page using iframe
    const _renderVideo = item => {
        if (item && item.embedUrl && item.embedUrl.indexOf('embed') === -1) {
            const EmbedUrl = item.embedUrl;
            if (EmbedUrl && EmbedUrl.includes('watch')) {
                var modifiedUrl;
                modifiedUrl =
                    'https://www.youtube.com/embed/' +
                    EmbedUrl.slice(EmbedUrl.indexOf('=') + 1, EmbedUrl.length);
            } else {
                modifiedUrl =
                    'https://www.youtube.com/embed/' +
                    EmbedUrl.slice(
                        EmbedUrl.lastIndexOf('/') + 1,
                        EmbedUrl.length
                    );
            }
        }
        return (
            <div>
                <div className="video-wrapper">
                    <span className="close-video" />
                    <iframe
                        title={'productVideo'}
                        src={modifiedUrl ? modifiedUrl : item.embedUrl}
                        allowFullScreen
                    />
                </div>
            </div>
        );
    };
    var imagesCed = [];

    sortedImages.forEach((element, index) => {
        imagesCed[index] = {};
        if (element['media_type'] != 'external-video') {
            imagesCed[index]['original'] = resourceUrl(element.file, {
                type: 'image-product',
                width: 700
            });
            imagesCed[index]['thumbnail'] = resourceUrl(element.file, {
                type: 'image-product',
                width: 88,
                height: 110
            });
        } else if (element['media_type'] == 'external-video') {
            imagesCed[index]['original'] = resourceUrl(element.file, {
                type: 'image-product',
                width: 700
            });
            imagesCed[index]['thumbnail'] = resourceUrl(element.file, {
                type: 'image-product',
                width: 88,
                height: 110
            });
            imagesCed[index]['renderItem'] = _renderVideo.bind(this);
            imagesCed[index]['embedUrl'] =
                element['video_content']['video_url'];
            imagesCed[index]['description'] =
                element['video_content']['video_description'];
        }
    });

    const changeClass = value => {
        setClassSelector(prevState => ({
            check: !prevState.check
        }));
        if (!value) {
            setIsFullScreen(false);
        }
    };

    return (
        <ImageGallery
            ref={imageGalleryRef}
            showPlayButton={false}
            items={imagesCed}
            slideOnThumbnailOver={false}
            additionalClass={'custom_slider'}
            thumbnailClass={'custom_thumbnail'}
            originalClass={'custom_image'}
            thumbnailPosition={'bottom'}
            originalAlt={'product-image'}
            thumbnailAlt={'thumbnail-image'}
            onScreenChange={changeClass}
            showNav={isFullScreen ? true : false}
            showFullscreenButton={isFullScreen ? true : false}
            onClick={() => {
                if (!isFullScreen) {
                    setIsFullScreen(true);
                }
            }}
            onSlide={currentIndex => setDisplaySlideIndex(currentIndex)}
        />
    );
};

/**
 * Props for {@link ProductImageCarousel}
 *
 * @typedef props
 *
 * @property {Object} classes An object containing the class names for the
 * ProductImageCarousel component
 * @property {string} classes.currentImage classes for visible image
 * @property {string} classes.imageContainer classes for image container
 * @property {string} classes.nextButton classes for next button
 * @property {string} classes.previousButton classes for previous button
 * @property {string} classes.root classes for root container
 * @property {Object[]} images Product images input for Carousel
 * @property {string} images.label label for image
 * @property {string} image.position Position of image in Carousel
 * @property {bool} image.disabled Is image disabled
 * @property {string} image.file filePath of image
 */
ProductImageCarousel.propTypes = {
    classes: shape({
        carouselContainer: string,
        currentImage: string,
        currentImage_placeholder: string,
        imageContainer: string,
        nextButton: string,
        previousButton: string,
        root: string
    }),
    images: arrayOf(
        shape({
            label: string,
            position: number,
            disabled: bool,
            file: string.isRequired
        })
    ).isRequired
};

export default ProductImageCarousel;
