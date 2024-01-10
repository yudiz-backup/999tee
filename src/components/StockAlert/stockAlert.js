import React, { useEffect, useState } from 'react'
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import defaultClasses from '../AccountMenu/accountMenu.css';
import Button from '../Button';

export default function StockAlert(props) {
    const {
        MpProductAlertNotifyInStock,
        MpProductAlertCustomerNotifyInStock,
        alertBoxClose,
        setAlertBoxClose,
        isSignedIn,
        stockAlertData,
        emailAlert,
        setEmailAlert,
        notifyGuestUser,
        notifyCustmer,
    } = props

    const [errMsg, setErrMsg] = useState(false)

    const classes = mergeClasses(defaultClasses, props.classes);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSignedIn) {
            notifyCustmer()
        } else {
            if (emailAlert) {
                notifyGuestUser(emailAlert)
            }
        }
        if ((MpProductAlertNotifyInStock && emailAlert) || (MpProductAlertCustomerNotifyInStock && isSignedIn)) {
            setAlertBoxClose(true)
            if (MpProductAlertNotifyInStock && emailAlert) {
                setEmailAlert("")
            }
        }
        if (!emailAlert) {
            setErrMsg(true)
        }
    };

    const handleChange = (e) => {
        setEmailAlert(e.target.value)
    };

    useEffect(() => {
        if (emailAlert) {
            setErrMsg(false)
        }
    }, [emailAlert])

    const popupSetting = stockAlertData && stockAlertData.popup_setting
    return (
        <>
            {!alertBoxClose && <div className={"modal fade bd-example-modal-lg" + ' ' + classes.root_open + ' ' + classes.stork_alert} id="exampleModal" tabindex="-1" role="dialog" data-backdrop="false" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">{popupSetting && popupSetting.heading_text}</h5>
                            <div className={classes.close_madal_btn}>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                        </div>
                        <div className="modal-body">
                            <p>{popupSetting && popupSetting.description}</p>
                            <form onSubmit={handleSubmit} className={classes.notify_btn_input_box}>
                                {!isSignedIn &&

                                    <div className="form-group m-0">
                                        <>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder={popupSetting && popupSetting.place_holder}
                                                onChange={(e) => handleChange(e)}
                                                className={classes.form_input + ' ' + "form-control"}
                                            />
                                            {errMsg && <p className='text-danger text-left'>Please enter email address.</p>}
                                        </>
                                    </div>
                                }
                                <Button priority='high' type="submit"  ><span>{stockAlertData && stockAlertData.button_text}</span></Button>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <p>{popupSetting && popupSetting.footer_content}</p>
                        </div>
                    </div>
                </div>
            </div>}
        </>
    )
}
