import React from 'react';
import ContentLoader from 'react-content-loader';

const BannerSkelton = props => {
    const { mobileView } = props;

    if (!mobileView) {
        return (
            <ContentLoader height={350} width={1000} speed={0.9}>
                <rect height="160" x="20" width="310" y="30" />
                <rect height="160" x="340" width="310" y="30" />
                <rect height="160" x="660" width="310" y="30" />

                <rect height="160" x="20" width="310" y="205" />
                <rect height="160" x="340" width="310" y="205" />
                <rect height="160" x="660" width="310" y="205" />
            </ContentLoader>
        );
    } else {
        return (
            <ContentLoader height={320} width={400} speed={0.9}>
                <rect height="150" x="25" width="175" y="0" />
                <rect height="150" x="205" width="175" y="0" />

                <rect height="150" x="25" width="175" y="170" />
                <rect height="150" x="205" width="175" y="170" />

                <rect height="150" x="25" width="175" y="190" />
                <rect height="150" x="205" width="175" y="190" />
            </ContentLoader>
        );
    }
};
export default BannerSkelton;
