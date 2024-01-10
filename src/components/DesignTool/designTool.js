import { useQuery } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import designToolContent from '../../queries/designToolPage.graphql';
import Button from '../Button/button';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import IFrameModal from '../DesignTool';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { isMobileView } from '../../util/helperFunction';


function DesignTool(props) {
    const { data, loading, error } = useQuery(designToolContent);
    const [shown, setShown] = useState(false);
    const [{ isSignedIn }] = useUserContext();
    const [{ cartId }] = useCartContext();
    const mobileView = isMobileView();


    useEffect(() => {
        if (shown) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'visible';
        }

        async function handleClick(e) {
            if (
                shown &&
                document.getElementById('iFrameWrapper') &&
                !document.getElementById('iFrameWrapper').contains(e.target)
            ) {
                setShown(true);
            }
        }
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [shown]);

    const token = localStorage.getItem('token');

    return (
        <>
            <div className='pb-1'>
                {data?.cmsBlocks?.items && !loading && (
                    //  <div dangerouslySetInnerHTML={{_html: data?.cmsBlocks?.items?.[0]?.content}}></div>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: data?.cmsBlocks?.items?.[0]?.content
                        }}
                        className='pt-4'
                    />
                )}
                {!mobileView && !loading && <div className='text-center mt-4 mb-4'>
                    {/* <p className='mb-2'>Lets ready to design</p> */}
                    {shown ? (
                        isSignedIn ? (
                            <IFrameModal
                                src={`${process.env.MAGENTO_BACKEND_URL}/productdesigner/index/index/id/200/cart_id/${cartId}/token/${token}`}
                                setShown={setShown}
                            />
                        ) : (
                            <IFrameModal
                                src={`${process.env.MAGENTO_BACKEND_URL}/productdesigner/index/index/id/200/cart_id/${cartId}`}
                                setShown={setShown}
                            />
                        )
                    ) : null}
                    <span>
                        <Button
                            onClick={() => {
                                setShown(!shown);
                            }}
                            priority="high"
                            type="submit"
                            disabled
                        >
                            Coming Soon
                        </Button>
                    </span>
                </div>}
            </div>
        </>
    );
}

export default DesignTool;
