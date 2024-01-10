import React from 'react'
import { Link } from 'react-router-dom';
import defaultClasses from '../../components/PaymentFailure/faildPayment.css';
import Button from '../Button';
import payment_icon from '../../../cenia-static/icons/payment.svg';


export default function index() {
  return (
    <div className={defaultClasses.payment_faild}>
      <img src={payment_icon} alt="payment-icon"  />
      <h3>Payment Failed</h3>
      <Link to='/'>
        <Button priority='high'>
          <span>Back to HomePAGE</span>
        </Button>
      </Link>
    </div>
  )
}
