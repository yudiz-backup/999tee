import React from 'react';
import { shape, string } from 'prop-types';
import { useFooter } from '../../peregrine/lib/talons/Footer/useFooter';
import { mergeClasses } from '../../classify';
import defaultClasses from './footer.css';
import { DEFAULT_LINKS } from './sampleData';
import GET_STORE_CONFIG_DATA from '../../queries/getStoreConfigData.graphql';
import NewsLetter from '../NewsLetter';
// import { Instagram, Facebook } from 'react-feather';
import {
    useFooterData,
    useHome
} from '../../peregrine/lib/talons/Home/useHome';
import RichContent from '../../components/RichContent';
import GET_CMSBLOCK_QUERY from '../../queries/getCmsBlocks.graphql';
import GET_HOMEPAGECONFIG_DATA from '../../queries/getHomeConfig.graphql';

import { Link, useLocation, useHistory } from 'react-router-dom';
// import Icon from '../Icon';
import Logo from '../Logo';
import { useQuery } from '@apollo/client';
import storeConfig from '../../queries/addFooterImgCard.graphql'

const Footer = props => {
    const history = useHistory();
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        if (pathname === '/') {
            window.scrollbar.scrollTo(0, 0, 800); // 500 is the speed of the scroll
        } else {
            history.push('/');
        }

    };
    // const instagramIcon = <Icon src={Instagram} size={24} />;
    // const facebookIcon = <Icon src={Facebook} size={24} />;

    const { pathname } = useLocation();
    const classes = mergeClasses(defaultClasses, props.classes);
    const talonProps = useFooter({
        query: GET_STORE_CONFIG_DATA
    });

    const { data } = useQuery(storeConfig)

    const { copyrightText } = talonProps;
    const homepageData = useHome({
        query: GET_HOMEPAGECONFIG_DATA
    });

    const { HomeConfigData } = homepageData;
    let footerIdentifier = 'ced-pwa-footer';
    if (typeof HomeConfigData != 'undefined') {
        for (var i = 0; i < HomeConfigData.length; i++) {
            if (HomeConfigData[i]['name'] == 'ced_pwa_footer')
                footerIdentifier = HomeConfigData[i]['value'];
        }
    }

    let footerSocialIconIdentifier = 'footer-contact-details';
    if (typeof HomeConfigData != 'undefined') {
        for (var a = 0; a < HomeConfigData.length; a++) {
            if (HomeConfigData[a]['name'] == 'footer-contact-details')
                footerSocialIconIdentifier = HomeConfigData[a]['value'];
        }
    }

    let footerSignUpandSaveIdentifier = 'sign-up-save';
    if (typeof HomeConfigData != 'undefined') {
        for (var b = 0; b < HomeConfigData.length; b++) {
            if (HomeConfigData[b]['name'] == 'sign-up-save')
                footerSignUpandSaveIdentifier = HomeConfigData[b]['value'];
        }
    }

    const footerDatas = useFooterData({
        footerQuery: GET_CMSBLOCK_QUERY,
        footerIdentifiers: footerIdentifier
    });

    const footerSocialIcons = useFooterData({
        footerQuery: GET_CMSBLOCK_QUERY,
        footerIdentifiers: footerSocialIconIdentifier
    });

    const footerSignUpandSave = useFooterData({
        footerQuery: GET_CMSBLOCK_QUERY,
        footerIdentifiers: footerSignUpandSaveIdentifier
    });

    const { footerData } = footerDatas;

    if (pathname.includes('printorder')) {
        return (
            <footer className={classes.root}>
                <div className={classes.bottom_footer}>
                    <div className={'container'}>
                        <div className={'row'}>
                            <div className={'col-12'}>
                                <p className={classes.copyright}>
                                    {copyrightText}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }

    return (
        <>
            <footer className={classes.root}>
                <div className="container">
                    <div className="row">
                        <div className="col-md-3">
                            <div className={classes.logo}>
                                <Link style={{ display: 'inline-block' }} onClick={scrollToTop} to="/"><Logo /></Link>
                            </div>
                            <RichContent html={footerSocialIcons && footerSocialIcons.footerData} />
                            <div className={classes.copyright}>
                                <ul className={classes.payment_icons}>
                                    <RichContent html={data && data.storeConfig && data.storeConfig.absolute_footer} />
                                </ul>
                                <p className='text-left'>{copyrightText}</p>
                            </div>
                        </div>
                        <div className="col-md-5">
                            <div className={classes.footer_item}>
                                <RichContent html={footerData} />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className={classes.footer_item}>
                                {/* <RichContent html={footerSignUpandSave?.footerDataTitle} /> */}
                                <div className={classes.footer_item + ' ' + classes.footer_item_subscribe}>
                                    <NewsLetter footerSignUpandSave={footerSignUpandSave} />
                                </div>
                            </div>
                        </div>
                        {/* <div className={'col-lg-12'}>
                            <RichContent html={footerSocialIcons && footerSocialIcons.footerData} />
                            <div className={classes.copyright}>
                                <ul className={classes.payment_icons}>
                                    <RichContent html={data && data.storeConfig && data.storeConfig.absolute_footer} />
                                </ul>
                                <p >{copyrightText}</p>
                            </div>
                        </div> */}
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;

Footer.defaultProps = {
    links: DEFAULT_LINKS
};

Footer.propTypes = {
    classes: shape({
        root: string
    })
};
