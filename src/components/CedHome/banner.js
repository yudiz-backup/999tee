import React from 'react';
import { useCmsBlock } from '../../peregrine/lib/talons/Home/useHome';
import RichContent from '@magento/venia-ui/lib/components/RichContent';

import GET_CMSBLOCK_QUERY from '../../queries/getCmsBlocks.graphql';

const Banner = props => {
    const { identifier, showBanner } = props;

    const cmsBlockData = useCmsBlock({
        query: GET_CMSBLOCK_QUERY,
        identifier: identifier,
        showBanner: showBanner
    });
    const { cmsBlock } = cmsBlockData;
    let cmsBlockHtml = '';
    if (cmsBlock) {
        cmsBlockHtml = cmsBlock;
    }

    return <RichContent html={cmsBlockHtml} />;
};

export default Banner;
