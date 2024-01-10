import React, { useState, useEffect } from 'react';
import { clearIcon } from '../CreateAccount/createAccount'
import cedClasses from '../ProductFullDetail/productFullDetail.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import  couponmodal  from '../CouponModal/CouponModal.css'
import CouponGif from '../../../cenia-static/images/couponGif.gif'
export default function CouponModal(props) {
    const classes = mergeClasses(cedClasses, couponmodal, props.classes)

    const { categoryFlag, setCategoryFlag, id, handleDeleteItem, type } = props
    const handleClose = () => {
        setCategoryFlag(false)
    }

    return (
        <section >
            {/* <button
                // onClick={removeItem}
                type="button"
                className={classes.deleteButton}
                // disabled={isDeleting}
                data-toggle="modal" data-target="#staticBackdrop"
            >
                <Icon
                    size={16}
                    src={TrashIcon}
                    classes={{ icon: classes.editIcon }}
                />
            </button> */}
            <div 
            // className={classes.add_gift_form + "  " + "modal fade"} id="staticBackdrop"
            className={categoryFlag ? classes.add_gift_form + "  " + "modal fade show" + " " + classes.jobBoradActiveModal : null}
            data-backdrop="static" data-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className={classes.overlay} />
                <div style={{maxWidth: '360px'}} className={classes.are_sure_modal + ' ' + 'modal-dialog modal-dialog-centered'}>
                    <div className={classes.modal_content + ' ' + 'modal-content'}>
                      
                        {/* <div className="modal-body"></div> */}
                        <div className={classes.sure_footer + ' ' + 'modal-footer mr-auto'} >
                        <button
                                    type='submit'
                                    data-dismiss="modal"
                                    onClick={handleClose}
                                >
                                    {clearIcon}
                                </button>
                            <h3 className='text-success m-0'>Congratulations</h3>
                            <h5>You got <span>&#8377; {props?.discount}</span>  off</h5>
                                <img src={CouponGif} alt="" />
                                <h5><span>{props?.label}</span></h5>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}