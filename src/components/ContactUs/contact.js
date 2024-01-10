import React, { useEffect, useRef, useState } from 'react';
import { mergeClasses } from '../../classify';
import {
    useContactUs,
    useFooterData,
    useHome
} from '../../../src/peregrine/lib/talons/Home/useHome';
import contactClasses from './contact.css';
import { Form } from 'informed';
import Button from '../Button';
import Field from '../Field';
import TextInput from '../TextInput';
import TextArea from '../TextArea';
// import ContactModel from './woman-gef39e9070_1280.jpg';
import { FormattedMessage } from 'react-intl';
import {
    isRequired,
    validateEmail,
    validateName,
    nameMinLength,
    nameMaxLength,
    hasLengthAtMost,
    hasLengthAtLeast,
    mobileNumberLength,
    checkOnlyNumberAllow
} from '../../util/formValidators';
import combine from '../../util/combineValidators';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faPhoneAlt, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Link, Meta, Title } from '../../components/Head';
import GET_CMSBLOCK_QUERY from '../../queries/getCmsBlocks.graphql';
import GET_HOMEPAGECONFIG_DATA from '../../queries/getHomeConfig.graphql';
import RichContent from '@magento/venia-ui/lib/components/RichContent';
import GoogleCaptcha from '../GoogleCaptcha/googleCaptcha';
// import jobBorad from '../JobBoard/jobBorad.css';
import LoadingIndicator from '../LoadingIndicator/indicator';

const Contact = props => {
    const classes = mergeClasses(contactClasses, props.classes);
    const talonProps = useContactUs();
    const captchaToken = useRef(null);
    const [loading, setLoading] = useState(false);

    const meta_description = META_DESCRIPTION;
    const c_url = window.location.href;
    const siteName = window.location.hostname;
    const title = `${'Contact Us'}`;
    const { formRef, handleSubmit, responseData } = talonProps;
    let errorMessage = '';
    let successMessage = '';
    if (typeof responseData != 'undefined') {
        if (!responseData.status) {
            errorMessage = responseData.message;
        }
        successMessage = responseData.message;
    }

    useEffect(() => {
        if (responseData) {
            setLoading(false);
        }
    }, [responseData]);

    const homepageData = useHome({
        query: GET_HOMEPAGECONFIG_DATA
    });

    const { HomeConfigData } = homepageData;
    let contactUsIdentifier = 'contact-page-content';
    if (typeof HomeConfigData != 'undefined') {
        for (var i = 0; i < HomeConfigData.length; i++) {
            if (HomeConfigData[i]['name'] == 'contact-page-content')
                contactUsIdentifier = HomeConfigData[i]['value'];
        }
    }

    const contactUsDatas = useFooterData({
        footerQuery: GET_CMSBLOCK_QUERY,
        footerIdentifiers: contactUsIdentifier
    });

    // let contactUsDeliveryIdentifier = 'contact-page-delivery';
    // if (typeof HomeConfigData != 'undefined') {
    //     for (i = 0; i < HomeConfigData.length; i++) {
    //         if (HomeConfigData[i]['name'] == 'contact-page-delivery')
    //             contactUsDeliveryIdentifier = HomeConfigData[i]['value'];
    //     }
    // }

    // const contactUsDeliveryDatas = useFooterData({
    //     footerQuery: GET_CMSBLOCK_QUERY,
    //     footerIdentifiers: contactUsDeliveryIdentifier
    // });

    let contactUsPageBannerIdentifier = 'contact-page-banner';
    if (typeof HomeConfigData != 'undefined') {
        for (i = 0; i < HomeConfigData.length; i++) {
            if (HomeConfigData[i]['name'] == 'contact-page-banner')
                contactUsPageBannerIdentifier = HomeConfigData[i]['value'];
        }
    }

    const contactUsPageBannerimg = useFooterData({
        footerQuery: GET_CMSBLOCK_QUERY,
        footerIdentifiers: contactUsPageBannerIdentifier
    });

    const { footerData } = contactUsDatas;
    const { footerData: contactUsPageBannerImage } = contactUsPageBannerimg;

    async function handleFormSubmit(e) {
        const resultToken = await captchaToken?.current?.getToken();
        handleSubmit(e, resultToken);
        setLoading(true);
    }

    return (
        <div className={classes.contact_page_wrapper + ' ' + 'p-0'}>
            <Title>{title}</Title>
            <Meta name="robots" content={'INDEX,FOLLOW'} />
            <Meta name="description" content={meta_description} />
            <Link rel="canonical" href={c_url} />
            <Meta name="og:type" content={'Website'} />
            <Meta
                property="og:image"
                content="/cenia-static/icons/cenia_square_512.png"
            />
            <Meta name="og:title" content={'Contact Us'} />
            <Meta name="og:description" content={meta_description} />
            <Meta name="og:url" content={c_url} />
            <Meta name="og:site_name" content={siteName} />
            <Meta name="twitter:card" content={'summary_large_image'} />
            <Meta name="twitter:description" content={meta_description} />
            <Meta name="twitter:title" content={title} />
            <Meta
                name="twitter:image"
                content={'/cenia-static/icons/cenia_square_512.png'}
            />
            <Meta name="twitter:site" content={siteName} />
            <Meta name="twitter:url" content={c_url} />
            {!loading ? (<>
                <RichContent html={contactUsPageBannerImage} />
                <div className="container">
                    <div className={classes.contact_desc_wrapper}>
                        <div class="row no-gutters">
                            {/* <div className="col-lg-6">
                                <div className={classes.contact_page_model}>
                                    <img src={ContactModel} alt="contact model" />
                                </div>
                            </div> */}
                            <div className="col-12">
                                <div className={classes.contact_right_desc}>
                                    <RichContent html={footerData} />
                                    {/* <RichContent html={contactUsDeliveryData} /> */}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={classes.contact_page_form}>
                        <div className={'row'}>
                            <div className="col-12">
                                <h3 className={classes.content_page_heading}>
                                    <FormattedMessage
                                        id={'contact.content_page_heading'}
                                        defaultMessage={'Leave Us Feedback'}
                                    />
                                </h3>
                                <Form
                                    ref={formRef}
                                    id="contact-form"
                                    className={
                                        classes.root +
                                        ' ' +
                                        classes.contact_form
                                    }
                                    onSubmit={async e => {
                                        await handleFormSubmit(e);
                                    }}
                                // getApi={value => formRef.current = value}
                                >
                                    <div className="form-group row">
                                        <GoogleCaptcha ref={captchaToken} />
                                        <div className="col-md-6">
                                            <div
                                                className={classes.input_field}
                                            >
                                                <Field
                                                    label="First Name*"
                                                    required={true}
                                                >
                                                    <TextInput
                                                        field="name"
                                                        autoComplete="given-name"
                                                        validate={combine([
                                                            value =>
                                                                isRequired(
                                                                    value,
                                                                    'First Name'
                                                                ),
                                                            [
                                                                hasLengthAtMost,
                                                                nameMaxLength
                                                            ],
                                                            [
                                                                hasLengthAtLeast,
                                                                nameMinLength
                                                            ],
                                                            validateName
                                                        ])}
                                                        validateOnBlur
                                                    />
                                                </Field>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div
                                                className={classes.input_field}
                                            >
                                                <Field
                                                    label="Last Name*"
                                                    required={true}
                                                >
                                                    <TextInput
                                                        field="lastname"
                                                        autoComplete="family-name"
                                                        validate={combine([
                                                            value =>
                                                                isRequired(
                                                                    value,
                                                                    'Last Name'
                                                                ),
                                                            [
                                                                hasLengthAtMost,
                                                                nameMaxLength
                                                            ],
                                                            [
                                                                hasLengthAtLeast,
                                                                nameMinLength
                                                            ],
                                                            validateName
                                                        ])}
                                                        validateOnBlur
                                                    />
                                                </Field>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <div className="col-md-6">
                                            <div
                                                className={classes.input_field}
                                            >
                                                <Field
                                                    label="Email*"
                                                    required={true}
                                                >
                                                    <TextInput
                                                        field="email"
                                                        autoComplete="email"
                                                        validate={combine([
                                                            value =>
                                                                isRequired(
                                                                    value,
                                                                    'Email'
                                                                ),
                                                            validateEmail
                                                        ])}
                                                        validateOnBlur
                                                    />
                                                </Field>
                                            </div>
                                        </div>
                                        <div
                                            className="col-md-6"
                                            required={true}
                                        >
                                            <div
                                                className={classes.input_field}
                                            >
                                                <Field label="Mobile Number*">
                                                    <TextInput
                                                        field="telephone"
                                                        validate={combine([
                                                            value =>
                                                                isRequired(
                                                                    value,
                                                                    'Moblie Number',
                                                                    mobileNumberLength
                                                                ),
                                                            value =>
                                                                checkOnlyNumberAllow(
                                                                    value,
                                                                    'Moblie Number'
                                                                )
                                                        ])}
                                                        maxLength={
                                                            mobileNumberLength
                                                        }
                                                        validateOnBlur
                                                    />
                                                </Field>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <div className="col-md-12">
                                            <div
                                                className={classes.input_field}
                                            >
                                                <Field
                                                    label="What’s on your mind?*"
                                                    required={true}
                                                >
                                                    <TextArea
                                                        field="comment"
                                                        validate={value =>
                                                            isRequired(
                                                                value,
                                                                'Comment'
                                                            )
                                                        }
                                                        validateOnBlur
                                                    />
                                                </Field>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <div className="col-md-12">
                                            <div className={classes.error}>
                                                {errorMessage}
                                            </div>
                                            <div className={classes.success}>
                                                {successMessage}
                                            </div>
                                            <div className={classes.actions}>
                                                <Button
                                                    type="submit"
                                                    priority="high"
                                                >
                                                    <FormattedMessage
                                                        id={'contact.submit'}
                                                        defaultMessage={
                                                            'Submit'
                                                        }
                                                    />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </>
            ) : (
                <LoadingIndicator />
            )}
        </div>
    );
};

export default Contact;
