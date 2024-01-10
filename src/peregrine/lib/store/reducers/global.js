export default (state = {
    isSignInFromCheckoutPage: false
}, action) => {
    switch (action.type) {
        case 'UPDATE_PRICE_SUMMARY_DATA':
            return {
                ...state,
                priceSummaryData: action.payload.priceSummaryData
            };
        case 'RMA_CUSTOMER_DETAILS':
            return {
                ...state,
                customerDetails: action.payload.customerDetails
            };
        case 'UPDATE_HEADER_PROMOTION_BAR_VISIBLE':
            return {
                ...state,
                isHeaderPromotionBarVisible: action.payload
            };
        case 'ORDER_NUMBER':
            return {
                ...state,
                orderNumberInfo: action.payload
            };
        case 'WISHLIST_COUNT':
            return {
                ...state,
                wishlistCount: action.payload
            };
        case 'PRICE_SUMMARY_DETAIL':
            return {
                ...state,
                priceSummaryDetail: {
                    ...state.priceSummaryDetail,
                    ...action.priceSummaryDetail
                },
                priceSummaryData: {
                    ...state.priceSummaryData,
                    ...action.priceSummaryData
                }
            };
        case 'MOBILE_NUMBER':
            return {
                ...state,
                mobileNumber: action?.payload?.mobileNumber,
                otpNumber: action?.payload?.otpNumber
            };
        case 'REGISTER_DATA':
            return {
                ...state,
                registeredData: action.payload
            };
        case 'IS_SIGNIN_FROM_CHECKOUT_PAGE':
            return {
                ...state,
                isSignInFromCheckoutPage: action.payload
            };
        case 'COUPON_CODE':
            return {
                ...state,
                coupon_code: action.payload
            };
        case 'STORE_CREDIT':
                return {
                    ...state,
                    store_credit: action.payload
                };
        case 'DISABLE_CHECKOUT_BUTTON':
            return {
                ...state,
                disable: action.payload
            };
        case 'USER_DETAILS':
            return {
                ...state,
                loginUserDetails: { ...state.loginUserDetails, ...action.payload }
            };
        case 'ADD_TO_CART_NOTIFICATION':
            return {
                ...state,
                addToCartNotification: { ...state.addToCartNotification, ...action.payload }
            };
        case 'SCROLL_DISABLE':
                return {
                    ...state,
                    scrollDisable: action.payload,
                };
        case 'DESIGN_TOOL_NOTIFICATION':
                return {
                    ...state,
                    designToolNotification: action.payload
                }; 
        case 'SIZE_CHART_MODAL':
                return {
                    ...state,
                    sizeChartModal: { ...state.sizeChartModal, ...action.payload }
                };
        case 'COUPON_CODE_MODAL':
                return {
                    ...state,
                    couponCodeModal: { ...state.couponCodeModal, ...action.payload }
                };
        case 'GOOGLE_CAPTCHA':
                return {
                    ...state,
                    googleCaptcha: action.payload
                };
        default:
            return state;
    }
};
