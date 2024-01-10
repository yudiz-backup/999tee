import { gql } from '@apollo/client';
import { CartPageFragment } from './cartPageFragments.gql';

export const GET_CART_DETAILS = gql`
    query getCartDetails($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            storecredit_applied {
                base_bss_storecredit_amount
            }
            ...CartPageFragment
        }
    }
    ${CartPageFragment}
`;
