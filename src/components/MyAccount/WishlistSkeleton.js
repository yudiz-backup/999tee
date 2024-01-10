import React from 'react';
import ContentLoader from 'react-content-loader';

function WishlistSkelton() {
    return (
        <ContentLoader height={900} width={700} speed={0.9}>
            <rect height="250" x="0" width="200" y="50" />
            <rect height="20" x="0" width="180" y="310" />
            <rect height="20" x="0" width="170" y="335" />
            <rect height="20" x="0" width="160" y="360" />

            <rect height="250" x="230" width="200" y="50" />
            <rect height="20" x="230" width="180" y="310" />
            <rect height="20" x="230" width="170" y="335" />
            <rect height="20" x="230" width="160" y="360" />

            <rect height="250" x="460" width="200" y="50" />
            <rect height="20" x="460" width="180" y="310" />
            <rect height="20" x="460" width="170" y="335" />
            <rect height="20" x="460" width="160" y="360" />

            <rect height="250" x="0" width="200" y="400" />
            <rect height="20" x="0" width="180" y="655" />
            <rect height="20" x="0" width="170" y="680" />
            <rect height="20" x="0" width="160" y="705" />

            <rect height="250" x="230" width="200" y="400" />
            <rect height="20" x="230" width="180" y="655" />
            <rect height="20" x="230" width="170" y="680" />
            <rect height="20" x="230" width="160" y="705" />

            <rect height="250" x="460" width="200" y="400" />
            <rect height="20" x="460" width="180" y="655" />
            <rect height="20" x="460" width="170" y="680" />
            <rect height="20" x="460" width="160" y="705" />
        </ContentLoader>
    );
}
export default WishlistSkelton;
