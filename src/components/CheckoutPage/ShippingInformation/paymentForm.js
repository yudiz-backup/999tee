import React, { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { mergeClasses } from '../../../classify'
import paymentForm from '../ShippingInformation/paymentForm.css'
import payGif from '../../../../cenia-static/images/payment-animation.gif'
function PaymentForm() {
  const classes = mergeClasses(paymentForm)
    const form = useRef()
    const { state } = useLocation()
      useEffect(() => {
        form.current.submit()
      }, [])
    return (
      <>
    <div className={classes.payment_processing}>
   <div className={classes.payment_img_section}>
    <img src={payGif} alt="" />
    <h2>Payment Processing</h2>
   </div>
    </div>
        <form ref={form}  action={state?.url}  method='post'>
            <input type="hidden" name="amount" value={state?.fields?.amount} />
            <input type="hidden" name="city" value={state?.fields?.city} />
            <input type="hidden" name="country" value={state?.fields?.country} />
            <input type="hidden" name="curl" value={state?.fields?.curl} />
            <input type="hidden" name="email" value={state?.fields?.email} />
            <input type="hidden" name="firstname" value={state?.fields?.firstname} />
            <input type="hidden" name="furl" value={state?.fields?.furl} />
            <input type="hidden" name="hash" value={state?.fields?.hash} />
            <input type="hidden" name="key" value={state?.fields?.key} />
            <input type="hidden" name="lastname" value={state?.fields?.lastname} />
            <input type="hidden" name="phone" value={state?.fields?.phone} />
            <input type="hidden" name="productinfo" value={state?.fields?.productinfo} />
            <input type="hidden" name="state" value={state?.fields?.state} />
            <input type="hidden" name="surl" value={state?.fields?.surl} />
            <input type="hidden" name="txnid" value={state?.fields?.txnid} />
            <input type="hidden" name="udf1" value={state?.fields?.udf1} />
            <input type="hidden" name="udf5" value={state?.fields?.udf5} />
            <input type="hidden" name="zip" value={state?.fields?.zip} />
          </form>
      </>
    )
}

export default PaymentForm