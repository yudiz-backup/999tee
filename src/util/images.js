import { resourceUrl } from 'src/drivers';

/**
 * This is specific to the Venia store-front sample data.
 */
export const DEFAULT_WIDTH_TO_HEIGHT_RATIO = 4 / 5;

export const imageWidths = new Map(
    Object.entries({
        ICON: 40,
        THUMBNAIL: 80,
        SMALL: 160,
        REGULAR: 320,
        LARGE: 640,
        LARGER: 960,
        XLARGE: 1280,
        XXLARGE: 1600,
        XXXLARGE: 2560
    })
);

export const generateUrl = (imageURL, mediaBase) => (width, height) =>{
    if(!imageURL){
        return ''
    }
    return resourceUrl(imageURL, {
        type: mediaBase,
        width,
        height,
        fit: 'cover'
    })};

export const generateUrlFromContainerWidth = (
    imageURL,
    containerWidth,
    type = 'image-product',
    ratio = DEFAULT_WIDTH_TO_HEIGHT_RATIO
) => {
    const intrinsicWidth = window.devicePixelRatio * containerWidth;

    /**
     * Find the best width that is closest to the intrinsicWidth.
     */
    const actualWidth = Array.from(imageWidths, ([, value]) => value).reduce(
        (prev, curr) => {
            if (prev) {
                return Math.abs(intrinsicWidth - curr) <
                    Math.abs(intrinsicWidth - prev)
                    ? curr
                    : prev;
            } else {
                return curr;
            }
        },
        null
    );

    return generateUrl(imageURL, type)(actualWidth, actualWidth / ratio);
};

export const generateSrcset = (imageURL, type, ratio) => {
    if (!imageURL || !type) return '';

    const imageRatio = ratio || DEFAULT_WIDTH_TO_HEIGHT_RATIO;
    const generateSrcsetUrl = generateUrl(imageURL, type);

    const imageUrl = Array.from(imageWidths, ([, value]) => value)
        .map(
            width =>
                `${generateSrcsetUrl(
                    width,
                    Math.round(width / imageRatio)
                )} ${width}w`
        )
        .join(',\n');

    return imageUrl
};
