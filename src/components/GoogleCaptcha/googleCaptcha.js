import { useQuery } from '@apollo/client';
import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import ReCAPTCHA from 'react-google-recaptcha';
import googleCaptchaKey from '../../queries/googleCaptchaKey/googleCaptchaKey.graphql';

const GoogleCaptcha = forwardRef((props, ref) => {
    const { data } = useQuery(googleCaptchaKey)
    const captchaRef = useRef(null)

    useImperativeHandle(
        ref,
        () => ({
            async getToken() {
                try {
                    const resultToken = await captchaRef?.current?.executeAsync()
                    return resultToken || '';
                } catch (error) {
                    console.log("Error", error)
                    return "";
                }
            }
        }),
    )

    return (
        <>
            {data?.getRecaptchaKey?.siteKey && <ReCAPTCHA
                size="invisible"
                ref={captchaRef}
                sitekey={data?.getRecaptchaKey?.siteKey}
            />}
        </>
    )


})

export default GoogleCaptcha;
