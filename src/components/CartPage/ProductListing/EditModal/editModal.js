import React, { useEffect, useState } from 'react';
import { X as CloseIcon } from 'react-feather';
import { useEditModal } from 'src/peregrine/lib/talons/CartPage/ProductListing/EditModal/useEditModal';

import { mergeClasses } from '../../../../classify';
import Icon from '../../../Icon';
import { Portal } from '../../../Portal';
import defaultClasses from './editModal.css';
import ProductDetail from './productDetail';
import ProductForm from './productForm';

/**
 * A child component of the ProductListing component.
 * This component renders an edit modal for a product.
 *
 * @param {Object} props
 * @param {Object} props.item Product to edit.
 * See [productListingFragments.js]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/ProductListing/productListingFragments.js}
 * for a list of properties for this object.
 * @param {Function} props.setIsCartUpdating Function for setting the updating state of the cart.
 * @param {Object} props.classes CSS className overrides.
 * See [editModal.css]{@link https://github.com/magento/pwa-studio/blob/develop/packages/venia-ui/lib/components/CartPage/ProductListing/EditModal/editModal.css}
 * for a list of classes you can override.
 *
 * @returns {React.Element}
 *
 * @example <caption>Importing into your project</caption>
 * import EditModal from "@magento/venia-ui/lib/components/CartPage/ProductListing/EditModal";
 */
const EditModal = props => {
    const { item, setIsCartUpdating } = props;
    const talonProps = useEditModal();
    const { handleClose, isOpen, setVariantPrice, variantPrice } = talonProps;
    const classes = mergeClasses(defaultClasses, props.classes);
    const [img,setImg]=useState('')
    const rootClass = isOpen ? classes.root_open : classes.root;
    const body = document.querySelector('body')
    useEffect(()=>{
        if(isOpen){
            body.classList.add('scroll-hidden-cart')
        }else{
            body.classList.remove('scroll-hidden-cart')
            setImg('')
        }
    },[isOpen])

    const bodyComponent = item ? (
        <div className={classes.body} key={item.id}>
            <ProductDetail item={item} variantPrice={variantPrice} img={img} />
            <ProductForm
                item={item}
                setImg={setImg}
                setIsCartUpdating={setIsCartUpdating}
                setVariantPrice={setVariantPrice}
                handleCloseEvent={handleClose}
            />
        </div>
    ) : null;
    return (
        <Portal>
            <aside className={rootClass}>
                <div className={classes.header}>
                    <span className={classes.headerText}>Edit Item</span>
                    <button
                        className={classes.closeButton}
                        onClick={()=>{
                            handleClose()
                            setImg('')
                        } }
                    >
                        <Icon src={CloseIcon} />
                    </button>
                </div>
                {bodyComponent}
            </aside>
        </Portal>
    );
};

export default EditModal;
