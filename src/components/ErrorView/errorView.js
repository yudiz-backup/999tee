import React from 'react';
import defaultClasses from './error.css';
import PropTypes, { shape, string } from 'prop-types';
import { Title } from '../Head';
import { Link } from 'src/drivers';
import Button from '@magento/venia-ui/lib/components/Button';

const ErrorView = () => {
    return (
        <div className={defaultClasses.page_not_find}>
            <Title>{'404 not found'}</Title>
            <div className={'container' + ' ' + defaultClasses.container}>
                <div className={'row align-items-center'}>
                    <div className='col-12 col-lg-6 col-md-6 col-sm-6'>
                        <div className={defaultClasses.error_logo + ' ' + 'text-center text-md-right'}>
                            <img
                                src="/noProductsFound-e9n.png"
                                className={'img-fluid'}
                                alt="noProductsFound"
                            />
                        </div>
                    </div>
                    <div className='col-12 col-lg-6 col-md-6 col-sm-6 mt-3 mt-md-0 text-center text-md-left'>
                        <div >
                            <h1>404</h1>
                            <h3>OOPS! PAGE NOT BE FOUND</h3>
                            <p>
                                Sorry but the page you are looking for does not
                                exist, have been removed. name changed or it
                                temporarily unavailable
                            </p>
                          
                           <div className='mt-3'>
                           <Link to="/">
                            <Button priority='high'>
                                <span>
                                Back to HomePage
                                </span>
                                </Button>
                                </Link>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

ErrorView.propTypes = {
    children: PropTypes.node.isRequired,
    classes: shape({
        root: string
    })
};

export default ErrorView;
