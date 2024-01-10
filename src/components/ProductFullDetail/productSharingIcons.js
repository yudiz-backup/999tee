import React from 'react';
import {
    FacebookShareButton,
    // FacebookIcon,
    // InstapaperShareButton,
    // InstapaperIcon,
    PinterestShareButton,
    // PinterestIcon,
    WhatsappShareButton,
    // WhatsappIcon,
    EmailShareButton,
    TwitterShareButton,
    LinkedinShareButton,
    XIcon

    // EmailIcon
} from 'react-share';
import { resourceUrl } from 'src/drivers';
import facebook_icon from '../../../cenia-static/icons/facebook-icon.svg';
import fbIc from '../../../cenia-static/icons/facebook.png'
import pinterest_icon from '../../../cenia-static/icons/pinterest-icon.svg';
import whatsapp_icon from '../../../cenia-static/icons/whatsapp-icon.svg';
import email_icon from '../../../cenia-static/icons/mail-icon.svg';
import twitter_icon from '../../../cenia-static/icons/twitter.svg';
import linkedin_icon from '../../../cenia-static/icons/linkedin.svg';
//import defaultClasses from './productFullDetail.css';

function ProductSharingIcons(props) {
    const { classes, productDetails, image } = props;

    return (
        <div className={classes.social_share_wrap}>
            <FacebookShareButton
                url={window.location.href}
                quote={productDetails.name}
                hover="true"
                hashtag={productDetails.name}
                className={classes.social_btn + ' ' + classes.facebook_btn}
            >
                {/* <FacebookIcon round={true} size={25} /> */}
                <img src={facebook_icon} alt="facebook_icon" />
            </FacebookShareButton>

            <PinterestShareButton
                media={resourceUrl(image, {
                    type: 'image-product',
                    width: 500
                })}
                url={window.location.href}
                description={productDetails.name}
                className={classes.social_btn}
            >
                {/* <PinterestIcon round={true} size={25} /> */}
                <img src={pinterest_icon} alt="pinterest_icon" />
            </PinterestShareButton>

            <TwitterShareButton
                separator={' :: '}
                openShareDialogOnClick="true"
                url={window.location.href}
                className={classes.social_btn}
            >
                <img src={twitter_icon} alt="twitter_icon" />
                {/* <XIcon size={32} round /> */}
            </TwitterShareButton>

            <LinkedinShareButton
                separator={' :: '}
                openShareDialogOnClick="true"
                url={window.location.href}
                className={classes.social_btn}
            >
                <img src={linkedin_icon} alt="linkedin_icon" />
                {/* <LinkedinIcon size={32} round /> */}
            </LinkedinShareButton>

            <WhatsappShareButton
                separator={' :: '}
                openShareDialogOnClick="true"
                url={window.location.href}
                className={classes.social_btn}
            >
                {/* <WhatsappIcon round={false} size={25} /> */}
                <img src={whatsapp_icon} alt="whatsapp_icon" />
            </WhatsappShareButton>

            <EmailShareButton
                separator={' :: '}
                openShareDialogOnClick="true"
                url={window.location.href}
                className={classes.social_btn}
            >
                {/* <EmailIcon round={false} size={25} /> */}
                <img src={email_icon} alt="mail_icon" />
            </EmailShareButton>
        </div>
    );
}

export default ProductSharingIcons;
