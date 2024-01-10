import React from 'react';
import CookieConsent from 'react-cookie-consent';
import { Link } from 'react-router-dom';
import defaultClasses from './footer.css';


const Cookie = props => {
    const { lifeTime } = props;
    // const classes = mergeClasses(cookie);
    return (
        <CookieConsent
            buttonText="Allow Cookies"
            cookieName="user_allowed_save_cookie"
            expires={parseInt(lifeTime)}
            style={{ background: '#fff', alignItems: 'center', padding: '0px 20px', borderTop: '1px solid rgb(186 183 183 / 88%)' }}
            buttonStyle={{ color: '#ffffff', fontSize: '14px', margin: '0px', background: 'black', borderRadius: '4px', padding: '7px 10px', textTransform: 'uppercase',    }}
            enableDeclineButton
            declineButtonClasses = "wqefwefwf"
            declineButtonStyle	= {{color: '#ffffff', fontSize: '14px', margin: '0px', background: 'black', borderRadius: '4px', padding: '7px 10px', textTransform: 'uppercase', marginRight: "10px"   }}
        >
            <div className={defaultClasses.cookie_msg_tetxt}>
                <strong>We use cookies</strong>
                <p className={'mb-0'}>
                    {' '}
                    <span>
                        To comply with the new e-Privacy directive, we need to
                        ask for your consent to set the cookies.
                    </span>
                    <Link target="_blank" style={{ color: 'black', fontWeight: '600' }} to="/privacy-policy-cookie-restriction-mode">
                        {' '}
                        Learn more
                    </Link>
                    .
                </p>
            </div>
        </CookieConsent>
    );
};

export default Cookie;
