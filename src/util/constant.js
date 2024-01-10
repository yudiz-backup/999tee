export const onlinePaymentMode = 'online';
export const offlinePaymentMode = 'offline';

export const paymentCodeWithPaymentMode = {
    payu: onlinePaymentMode,
    // stripe_payments: onlinePaymentMode,
    // stripe_payments_checkout: onlinePaymentMode,
    checkmo: offlinePaymentMode,
    cashondelivery: offlinePaymentMode
}

export const stockStatusLabel = {
    "OUT_OF_STOCK": "Out of Stock",
    "IN_STOCK": "In Stock",
    "LOW_STOCK": "Low Stock",
}
