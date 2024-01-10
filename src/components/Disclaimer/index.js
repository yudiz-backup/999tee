import React from 'react'
import GET_CMSBLOCK_QUERY from '../../queries/getCmsBlocks.graphql';
import { useFooterData, useHome } from '../../peregrine/lib/talons/Home/useHome';
import GET_HOMEPAGECONFIG_DATA from '../../queries/getHomeConfig.graphql';
import RichContent from '../RichContent/richContent';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from './disclaimer.css';

export default function Disclaimer(props) {
    const classes = mergeClasses(defaultClasses, props.classes);

    const homepageData = useHome({
        query: GET_HOMEPAGECONFIG_DATA
    });

    const { HomeConfigData } = homepageData;

    let disclaimerIdentifier = 'disclaimer';
    if (typeof HomeConfigData != 'undefined') {
        for (var i = 0; i < HomeConfigData.length; i++) {
            if (HomeConfigData[i]['name'] == 'disclaimer')
            disclaimerIdentifier = HomeConfigData[i]['value'];
        }
    }

    const disclaimerInfo = useFooterData({
        footerQuery: GET_CMSBLOCK_QUERY,
        footerIdentifiers: disclaimerIdentifier
    });
    
    const { footerData: disclaimerData } = disclaimerInfo;

    return (
        <div className='container'>
            <div className={classes.disclaimer_content}>
                <RichContent html={disclaimerData} />
            </div>
        </div>
    );
}
