const accountLinks = new Map()
    .set('Account', '/customer/account')
    .set('Sign In', null)
    .set('Register', '/create-account')
    .set('Order Status', null)
    .set('Returns', null);

const aboutLinks = new Map()
    .set('About Us', '/about-us')
    .set('Our Story', null)
    .set('Email Signup', null)
    .set('Give Back', null);

const helpLinks = new Map()
    .set('Help', null)
    .set('Live Chat', null)
    .set('Contact Us', '/contact')
    .set('Order Status', null)
    .set('Returns', null);

export const DEFAULT_LINKS = new Map()
    .set('account', accountLinks)
    .set('about', aboutLinks)
    .set('help', helpLinks);

export const LOREM_IPSUM =
    'Lorem ipsum dolor sit amet, consectetur adipsicing elit, sed do eiusmod tempor incididunt ut labore et dolore.';
