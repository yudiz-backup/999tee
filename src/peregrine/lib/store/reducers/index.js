import app from '@magento/peregrine/lib/store/reducers/app';
import cart from '@magento/peregrine/lib/store/reducers/cart';
import catalog from '@magento/peregrine/lib/store/reducers/catalog';
import checkout from '@magento/peregrine/lib/store/reducers/checkout';
import user from '@magento/peregrine/lib/store/reducers/user';
import ced from './ced';
const reducers = {
    app,
    cart,
    catalog,
    checkout,
    user,
    ced
};

export default reducers;
