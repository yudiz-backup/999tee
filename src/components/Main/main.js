import React, { Suspense, useContext, useEffect, useRef, /* , useState */useState } from 'react';
import { Route, useHistory } from 'src/drivers';
import { bool, shape, string } from 'prop-types';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Header from '../Header';
import defaultClasses from './main.css';
import Scrollbar from 'smooth-scrollbar';
import { useFooter } from '../../peregrine/lib/talons/Footer/useFooter';
import GET_STORE_CONFIG_DATA from '../../queries/getStoreConfigData.graphql';
import { isMobileView } from '../../util/helperFunction';
import { globalContext } from '../../peregrine/lib/context/global';
import PopupModal from '../Modal/Modals/popupModal';
// import GoogleCaptcha from '../GoogleCaptcha/googleCaptcha';

const MobileLinks = React.lazy(() => import('./mobileLinks'));
const Footer = React.lazy(() => import('../Footer'));
const PushNotification = React.lazy(() => import('./pushNotification'));
const Cookie = React.lazy(() => import('../Footer/cookie'));

// let prevLocation;

const Main = props => {

    // const [scrollFlag, setScrollFlag] = useState(false);
    const containerRef = useRef(null);
    const history = useHistory();

    const { state: contextInfo } = useContext(globalContext);
    const [scroll, setScroll] = useState();
    const prevLocation = useRef(null);
    const scrollbar = useRef(null);

    const mobile = isMobileView();
    useEffect(() => {
        scrollbar.current = Scrollbar.init(containerRef.current, {
            damping: mobile ? 0.01 : 0.06
        });

        const home_scrollbar = Scrollbar.init(document.querySelector('.main-smooth_bar-3La'));
        window.scrollbar = home_scrollbar;

        if (contextInfo?.scrollDisable?.scrollDisable === true) {
            scrollbar.current.track.xAxis.element.hidden = true;
            scrollbar.current.track.yAxis.element.hidden = true;
        }
        // Listen for route changes and reset the scroll position
        const unlisten = history.listen((location) => {
            prevLocation.current = history.location;
            if (prevLocation.current.pathname !== location?.pathname) {
                scrollbar.current.setPosition(0, 0);
            }
            // Update the previous location for the next iteration
            prevLocation.current = location;
        });

        setScroll(scrollbar.current)
        return () => {
            scrollbar.current.destroy();
            unlisten();
        };
    }, [history, mobile]);

    const talonProps = useFooter({
        query: GET_STORE_CONFIG_DATA
    });

    // const handleClick = () => {
    //     if (!scrollFlag) setScrollFlag(true);
    // };

    // useEffect(() => {
    //     document.addEventListener('scroll', handleClick);
    //     return () => {
    //         document.removeEventListener('scroll', handleClick);
    //     };
    // });

    const { cookieRestriction, cookieLifetime } = talonProps;

    const cookie =
        cookieRestriction == 1 ? (
            <Suspense fallback={''}>
                <Route>
                    <Cookie lifeTime={cookieLifetime} />
                </Route>
            </Suspense>
        ) : null;

    const { children, isMasked, mobileView } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    const rootClass = isMasked ? classes.root_masked : classes.root;
    const pageClass = isMasked ? classes.page_masked : classes.page;
    const token = localStorage.getItem('notification-token');

    return (
        <>
            <main className={window.location.pathname !== '/login' ? rootClass : `${rootClass + " " + classes.authentication_page }`} style={{ overflow: 'hidden' }}>
                <Header scroll={scroll} />
                <PopupModal
                    contextInfo={contextInfo}
                />
                <div ref={containerRef} style={{ width: '100%', height: contextInfo?.scrollDisable?.scrollDisable === true ? 'unset' : '100vh', overflow: 'hidden' }} className={classes.smooth_bar}>
                    <div style={{ width: '100%' }}>
                        <div className={pageClass + ' ' + classes.banner}>
                            {children}
                        </div>
                        {window.location.pathname !== '/login' &&
                            <React.Suspense fallback={null}>
                                <Footer />
                            </React.Suspense>
                        }
                        {!token && (
                            <React.Suspense fallback={null}>
                                <PushNotification />
                            </React.Suspense>
                        )}
                    </div>
                </div>
                {mobileView && (
                    <div className={classes.banner}>
                        <React.Suspense fallback={null}>
                            <MobileLinks />
                        </React.Suspense>
                    </div>
                )}
                {!mobileView && cookie}
            </main>
        </>
    );
};

export default Main;

Main.propTypes = {
    classes: shape({
        page: string,
        page_masked: string,
        root: string,
        root_masked: string
    }),
    isMasked: bool
};
