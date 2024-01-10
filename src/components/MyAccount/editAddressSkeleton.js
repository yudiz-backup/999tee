import React from 'react';
import ContentLoader from 'react-content-loader';

function AddressSkeleton() {
    return (
        <ContentLoader
            height={900}
            width={1300}
            speed={0.9}
            backgroundColor={'#e6e6e6'}
            foregroundColor={'#f6f6f6'}
        >
            <rect height="40" x="150" width="300" y="50" />
            <rect height="40" x="150" width="300" y="100" />
            <rect height="40" x="150" width="300" y="150" />
            <rect height="40" x="150" width="300" y="200" />
            <rect height="40" x="150" width="300" y="250" />
            <rect height="40" x="150" width="300" y="300" />
            <rect height="40" x="150" width="300" y="350" />

            <rect height="50" x="500" width="400" y="50" />

            <rect height="40" x="530" width="550" y="130" rx="2" />
            <rect height="40" x="530" width="550" y="190" rx="2" />
            <rect height="40" x="530" width="550" y="250" rx="2" />
            <rect height="40" x="530" width="550" y="310" rx="2" />
            <rect height="40" x="530" width="550" y="370" rx="2" />

            <rect height="45" x="530" width="200" y="450" rx="2" />
        </ContentLoader>
    );
}
export default AddressSkeleton;
