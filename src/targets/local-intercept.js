const { Targetables } = require('@magento/pwa-buildpack');

module.exports = targets => {
    targets.of('@magento/venia-ui').routes.tap(routes => {
        routes.push(

            {
                name: 'My Account',
                pattern: '/customer/account/:who?',
                path: require.resolve('../components/MyAccount/account.js')
            },
            {
                name: 'My Orders',
                pattern: '/order/history',
                path: require.resolve('../components/MyAccount/myOrders.js')
            },
            {
                name: 'My Wishlist',
                pattern: '/wishlist',
                path: require.resolve('../components/MyAccount/mywishlist.js')
            },
            {
                name: 'Address Book',
                pattern: '/customer/address/',
                path: require.resolve('../components/MyAccount/addressbook.js')
            },
            {
                name: 'My Reviews',
                pattern: '/review/customer/',
                path: require.resolve(
                    '../components/MyAccount/productReviews.js'
                )
            },
            {
                name: 'Newsletter Subscriptions',
                pattern: '/newsletter/manage/',
                path: require.resolve('../components/MyAccount/newsletter.js')
            },
            {
                name: 'Account Information',
                pattern: '/customer/account/edit/',
                path: require.resolve(
                    '../components/MyAccount/accountinformation.js'
                )
            },
            {
                name: 'Order Details',
                pattern: '/orderview/:who?',
                path: require.resolve('../components/MyAccount/myOrderView.js')
            },
            {
                name: 'New Address',
                pattern: '/address/new',
                path: require.resolve('../components/MyAccount/newAddress.js')
            },
            {
                name: 'Edit Address',
                pattern: '/address/edit/:who?',
                path: require.resolve('../components/MyAccount/editAddress.js')
            },
            {
                name: 'Print Invoice',
                pattern: '/printorder/:orderid?',
                path: require.resolve('../components/MyAccount/printOrder.js')
            },
            {
                name: 'Invoice',
                pattern: '/invoice/:orderid?',
                path: require.resolve('../components/MyAccount/invoice.js')
            },
            {
                name: 'Shipment',
                pattern: '/shipment/:orderid?',
                path: require.resolve('../components/MyAccount/shipments.js')
            },
            {
                name: 'Contact',
                pattern: '/contact',
                path: require.resolve('../components/ContactUs/contact.js')
            },
            {
                name: 'paypal-review',
                pattern: '/paypal-review',
                path: require.resolve(
                    '../components/CheckoutPage/paypalReview.js'
                )
            },
            {
                name: 'Refund',
                pattern: '/refunds/:orderid?',
                path: require.resolve('../components/MyAccount/refunds.js')
            },
            {
                name: 'Confirmation',
                pattern: '/customer/account/confirm',
                path: require.resolve(
                    '../components/AccountConfirmation/accountConfirmation.js'
                )
            },
            {
                name: 'Confirmation',
                pattern: '/customer/account/confirmation',
                path: require.resolve(
                    '../components/AccountConfirmation/sendConfirmationLink.js'
                )
            },
            {
                name: 'Compare Products',
                pattern: '/compare_products',
                path: require.resolve('../components/Compare/compare.js')
            },
            {
                name: 'Featured Products',
                pattern: '/featured-products/:categoryName.html',
                path: require.resolve('../RootComponents/Category/featuresProdouctContent.js')
            },
            {
                name: 'Sale Products',
                pattern: '/sale.html',
                path: require.resolve('../components/OnSale/onSale.js')
            },
            {
                name: 'Reward Point',
                pattern: '/customer/rewards/',
                path: require.resolve('../components/RewardPoint/rewardPoint.js')
            },
            {
                name: 'Return and Refund',
                pattern: '/mprma/customer/',
                path: require.resolve('../components/RMA/rma.js')
            },
            {
                name: 'Return and Refund',
                pattern: '/mprma/customer/:request_id',
                path: require.resolve('../components/RMA/rmaDetails.js')
            },
            {
                name: 'Return and Refund',
                pattern: '/mprma/customer/add-new-rma-request',
                path: require.resolve('../components/RMA/addRmaRequest.js')
            }, 
            {
                name: 'Guest Wishlist',
                pattern: '/guest-wishlist',
                path: require.resolve('../components/MyAccount/guestWishlist.js')
            }, 
            {
                name: 'Current Openings',
                pattern: '/jobboard',
                path: require.resolve('../components/JobBoard')
            }, 
            {
                name: 'My Store Credit',
                pattern: `/storecredit`,
                path: require.resolve('../components/MyAccount/creditInformation.js')
            }, 
            {
                name: 'Design Tool',
                pattern: `/design-tool`,
                path: require.resolve('../components/DesignTool/designTool.js')
            }, 
            {
                name: 'Login',
                pattern: '/login',
                path: require.resolve('../components/Login')
            },
            {
                name: 'Job Application',
                pattern: '/jobboard/jobs',
                path: require.resolve('../components/MyAccount/jobApplication.js')
            }, 
            {
                name: 'Update Mobile Number',
                pattern: '/mobilelogin/index/updatemobile/',
                path: require.resolve('../components/MyAccount/updateMobileNumber.js')
            }, 
            {
                name: 'Payment Form',
                pattern: '/payment-form',
                path: require.resolve('../components/CheckoutPage/ShippingInformation/paymentForm.js')
            }, 
            {
                name: 'Success In Process',
                pattern: `/order/success/:id`,
                path: require.resolve('../components/CheckoutPage/ThankYouPage/thankYouPage.js')
            }, 
            {
                name: 'Success In Process',
                pattern: `/payment/failure/`,
                path: require.resolve('../components/PaymentFailure/index.js')
            },
            {
                name: 'Colour Matching Disclaimer',
                pattern: `/color-matching-disclaimer`,
                path: require.resolve('../components/Disclaimer/index.js')
            },
            {
                name: 'Know More',
                pattern: `/know-more`,
                path: require.resolve('../components/BannerViewMoreContent/index.js')
            }
        );
        return routes;
    });

    const targetableFactory = Targetables.using(targets);
    // Create a TargetableModule instance that points to the getOptionType.js source
    const OptionsType = targetableFactory.module(
        'src/components/ProductOptions/getOptionType.js'
    );
    const instruction = {
        after: 'const customAttributes = {',
        insert: "color: 'swatch',"
    };
    OptionsType.spliceSource(instruction);
};
