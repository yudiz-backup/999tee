export async function displayRazorpay({
    amount,
    name,
    currency,
    rzpOrderId,
    email,
    address,
    referrer,
    setRazoerPaymentDetail,
    setModalClosed
}) {

    const options = {
        key: process.env.RAZOERPAY_KEY,
        amount: amount, // Amount in paise (100 paise = 1 INR)
        currency: currency,
        name: name,
        description: "",
        order_id: rzpOrderId,
        handler: async function (response) {
            const data = {
                orderCreationId: rzpOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
            };
            setRazoerPaymentDetail(data)
        },
        prefill: {
            name: name,
            email: email,
        },
        notes: {
            address: address,
            referrer: referrer,
        },
        theme: {
            color: "#000",
        },
        modal: {
            ondismiss: function () {
                setModalClosed(true)
                // Handle logic when the user closes the Razorpay modal
            },
        }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
}