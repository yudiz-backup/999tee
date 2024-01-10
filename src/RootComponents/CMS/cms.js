import React, { Fragment } from 'react';
import { useQuery } from '@apollo/client';
import cmsPageQuery from '../../queries/getCmsPage.graphql';
import { fullPageLoadingIndicator } from '../../components/LoadingIndicator';
import { number } from 'prop-types';
import CedHome from '../../components/CedHome/home';
import GET_HOMEPAGECONFIG_DATA from '../../queries/getHomeConfig.graphql';
import { useHome } from '../../peregrine/lib/talons/Home/useHome';
import { mergeClasses } from '../../classify';
import defaultClasses from './cms.css';
import { Meta, Link, Title } from '../../components/Head';
import RichContent from '@magento/venia-ui/lib/components/RichContent';

const CMSPage = props => {
    const { id } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    const { loading, error, data } = useQuery(cmsPageQuery, {
        variables: {
            id: Number(id),
            onServer: true
        }
    });
    const homepageData = useHome({
        query: GET_HOMEPAGECONFIG_DATA
    });

    const { HomeConfigData } = homepageData;
    let licenseValidate = '';
    let homePage = 'home';
    const c_url = window.location.href;

    if (typeof HomeConfigData != 'undefined') {
        for (var i = 0; i < HomeConfigData.length; i++) {
            if (HomeConfigData[i]['name'] == 'license') {
                licenseValidate = HomeConfigData[i]['value'];
            } else if (HomeConfigData[i]['name'] == 'home_page') {
                homePage = HomeConfigData[i]['value'];
            } else {
                continue;
            }
        }
    }
    licenseValidate = 1;
    if (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error(error);
        }
        return <div>Page Fetch Error</div>;
    }

    if (loading) {
        return fullPageLoadingIndicator;
    }

    if (!data) {
        return null;
    }

    const { content_heading, title, meta_title } = data.cmsPage;

    const metaDescription =
        data && data.cmsPage && data.cmsPage.meta_description
            ? data.cmsPage.meta_description
            : META_DESCRIPTION;
    const metaKeywords =
        data && data.cmsPage && data.cmsPage.meta_keywords
            ? data.cmsPage.meta_keywords
            : META_KEYWORDS;
    const pagetitle = `${meta_title ? meta_title : title}`;

    const siteName = window.location.hostname;

    const headingElement =
        content_heading !== '' ? (
            <div className={classes.pageHeading}>
                <h1 hidden={true} className={classes.heading}>
                    {content_heading}
                </h1>
            </div>
        ) : null;

    const seoData = [];
    seoData.push(
        <React.Fragment key={'seo'}>
            <Meta name="robots" content={'INDEX,FOLLOW'} />
            <Meta name="description" content={metaDescription} />
            <Meta name="keywords" content={metaKeywords} />
            <Link rel="canonical" href={c_url} />
            <Meta name="og:type" content={'Website'} />
            <Meta
                property="og:image"
                content="/cenia-static/icons/cenia_square_512.png"
            />
            <Meta name="og:title" content={pagetitle} />
            <Meta name="og:description" content={metaDescription} />
            <Meta name="og:url" content={c_url} />
            <Meta name="og:site_name" content={siteName} />
            <Meta name="twitter:card" content={'summary_large_image'} />
            <Meta name="twitter:description" content={metaDescription} />
            <Meta name="twitter:title" content={pagetitle} />
            <Meta
                name="twitter:image"
                content={'/cenia-static/icons/cenia_square_512.png'}
            />
            <Meta name="twitter:site" content={siteName} />
            <Meta name="twitter:url" content={c_url} />
        </React.Fragment>
    );

    if (data) {
        // Only render <RichContent /> if the page isn't empty and doesn't contain the default CMS Page text.

        if (
            typeof HomeConfigData != 'undefined' &&
            licenseValidate &&
            homePage == data.cmsPage.url_key
        ) {
            return (
                <div>
                    {seoData}
                    {headingElement}
                    <CedHome HomepageConfig={HomeConfigData} />
                </div>
            );
        }

        if (
            data.cmsPage.content &&
            data.cmsPage.content.length > 0 &&
            !data.cmsPage.content.includes('CMS homepage content goes here.')
        ) {
            return (
                <Fragment>
                    <Title>{pagetitle}</Title>
                    {seoData}
                    {headingElement}
                    <RichContent html={data.cmsPage.content} />
                </Fragment>
            );
        }
    }

    return null;
};

CMSPage.propTypes = {
    id: number
};

export default CMSPage;
