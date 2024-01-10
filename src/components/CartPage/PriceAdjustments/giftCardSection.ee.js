import React, { Suspense } from 'react';

import { Section } from '../../Accordion';
import LoadingIndicator from '../../LoadingIndicator';
const GiftCards = React.lazy(() => import('../GiftCards'));
const GiftCardSection = props => {
    const { setIsCartUpdating } = props;
    return (
        <Section id={'gift_card'} title={'Apply Gift Card'}>
            <Suspense fallback={<LoadingIndicator />}>
                <GiftCards setIsCartUpdating={setIsCartUpdating} />
            </Suspense>
        </Section>
    );
};

export default GiftCardSection;
