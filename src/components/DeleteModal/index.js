import React, { useContext } from 'react';
import { clearIcon } from '../CreateAccount/createAccount';
import cedClasses from '../ProductFullDetail/productFullDetail.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Button from '../Button';
import { globalContext } from '../../peregrine/lib/context/global';

export default function DeleteModal(props) {
    const classes = mergeClasses(cedClasses, props.classes);
    const { dispatch } = useContext(globalContext);

    const {
        categoryFlag,
        setCategoryFlag,
        id,
        handleDeleteItem,
        type,
        val,
        isDeleteFromMinicart = false,
        product,
        configurable_options
    } = props;
    const handleClose = () => {
        setCategoryFlag(false);
        dispatch({ type: 'SCROLL_DISABLE', payload: { scrollDisable: false } });
    };

    return (
        <section>
            <div
                style={
                    categoryFlag ? { display: 'block' } : { display: 'none' }
                }
                className={
                    categoryFlag
                        ? classes.add_gift_form +
                          '  ' +
                          'modal fade show' +
                          ' ' +
                          classes.jobBoradActiveModal
                        : null
                }
                data-backdrop="static"
                data-keyboard="false"
                tabIndex="-1"
                aria-labelledby="staticBackdropLabel"
                aria-hidden="true"
            >
                <div className={classes.overlay} />
                <div
                    className={
                        classes.are_sure_modal +
                        ' ' +
                        'modal-dialog modal-dialog-centered'
                    }
                >
                    <div
                        className={
                            classes.modal_content + ' ' + 'modal-content'
                        }
                    >
                        <div
                            className={
                                classes.modal_header + ' ' + 'modal-header'
                            }
                        >
                            <h5
                                style={{ fontSize: '16px' }}
                                className="modal-title"
                                id="staticBackdropLabel"
                            >
                                {type === 'minicart' || type === 'shopping'
                                    ? 'Are you sure you want to empty shopping bag ?'
                                    : type === 'addressbook'
                                    ? 'Are you sure you want to delete this address ?'
                                    : type === 'myOrder'
                                    ? 'Are you sure you want to cancel this order ?'
                                    : 'Are you sure you want to delete this item ?'}
                            </h5>
                            <div className={'text-right'}>
                                <button
                                    type="submit"
                                    data-dismiss="modal"
                                    onClick={handleClose}
                                >
                                    {clearIcon}
                                </button>
                            </div>
                        </div>
                        {/* <div className="modal-body"></div> */}
                        <div
                            className={
                                classes.sure_footer +
                                ' ' +
                                'modal-footer mr-auto'
                            }
                        >
                            <Button
                                priority="high"
                                type="submit"
                                data-dismiss="modal"
                                onClick={() => {
                                    if (isDeleteFromMinicart) {
                                        setCategoryFlag(false);
                                        dispatch({
                                            type: 'SCROLL_DISABLE',
                                            payload: { scrollDisable: false }
                                        });
                                    }

                                    window.dataLayer.push({
                                        event: 'remove_from_cart',
                                        data: [
                                            {
                                                name: product?.name || '',
                                                sku: product?.sku || '',
                                                id: product?.id || '',
                                                URL:
                                                    window?.location
                                                        ?.pathname || '',
                                                size:
                                                    configurable_options?.filter(
                                                        item =>
                                                            item?.option_label?.toLowerCase() ===
                                                            'size'
                                                    )?.[0]?.value_label || '',
                                                size_value:
                                                    configurable_options?.filter(
                                                        item =>
                                                            item?.option_label?.toLowerCase() ===
                                                            'size'
                                                    )?.[0]?.value_id || '',
                                                color:
                                                    configurable_options?.filter(
                                                        item =>
                                                            item?.option_label?.toLowerCase() ===
                                                            'colour'
                                                    )?.[0]?.value_label || '',
                                                color_value:
                                                    configurable_options?.filter(
                                                        item =>
                                                            item?.option_label?.toLowerCase() ===
                                                            'colour'
                                                    )?.[0]?.value_id || '',
                                                cart_id:
                                                    localStorage.getItem(
                                                        'cart_id'
                                                    ) || ''
                                            }
                                        ]
                                    });

                                    handleDeleteItem(id, val);
                                }}
                            >
                                {' '}
                                Yes
                            </Button>
                            <Button
                                type="reset"
                                data-dismiss="modal"
                                onClick={handleClose}
                            >
                                {' '}
                                No
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
