import React from 'react';
import { render } from 'react-dom';
import '../src/components/custome.css'
import store from './store';
import app from '@magento/peregrine/lib/store/actions/app';
import Adapter from '@magento/venia-ui/lib/components/Adapter';
import { registerSW } from './registerSW';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.slim.min';
import 'popper.js/dist/umd/popper';
import 'bootstrap/dist/js/bootstrap.min';
import 'slick-carousel/slick/slick.css';
// server rendering differs from browser rendering
const isServer = !globalThis.document;

// TODO: on the server, the http request should provide the origin
// const origin = isServer
//     ? process.env.MAGENTO_BACKEND_URL
//     : process.env.MAGENTO_BACKEND_URL;

// const origin = "https://backend-staging.999tee.com/"

const origin = isServer
    ? process.env.MAGENTO_BACKEND_URL
    : globalThis.location.origin;

// on the server, components add styles to this set and we render them in bulk
const styles = new Set();

const tree = <Adapter origin={origin} store={store} styles={styles} />;

if (isServer) {
    // TODO: ensure this actually renders correctly
    import('react-dom/server').then(({ default: ReactDOMServer }) => {
        console.log(ReactDOMServer.renderToString(tree));
    });
} else {
    render(tree, document.getElementById('root'));
    registerSW();

    globalThis.addEventListener('online', () => {
        store.dispatch(app.setOnline());
    });
    globalThis.addEventListener('offline', () => {
        store.dispatch(app.setOffline());
    });
}
