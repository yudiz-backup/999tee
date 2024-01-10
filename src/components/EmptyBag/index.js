import React from 'react'
import { Trash as TrashIcon } from 'react-feather';
import Button from '../Button';
import Icon from '../Icon';

export default function EmptyBag(props) {

  const {
    handleEmptyCart, 
    classes,
    loading, 
    emptycartLoading, 
    isPriceUpdating, 
    isItemLoadingWhileShippingApplied
  } = props;

  return (
    <Button
        onClick={handleEmptyCart}
        priority="high"
        className={classes.checkoutButton}
        disabled={loading || emptycartLoading || isPriceUpdating || isItemLoadingWhileShippingApplied}
        >
            <Icon
                size={16}
                src={TrashIcon}
                classes={{ icon: classes.checkoutIcon }}
            />
        Empty Bag
    </Button>
  )
}
