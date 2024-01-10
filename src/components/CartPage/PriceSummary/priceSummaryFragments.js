import { gql } from '@apollo/client';
import { AvailableShippingMethodsCartFragment } from '../PriceAdjustments/ShippingMethods/shippingMethodsFragments.gql';

import { DiscountSummaryFragment } from './discountSummary';
import { GiftCardSummaryFragment } from './queries/giftCardSummary';
import { ShippingSummaryFragment } from './shippingSummary';
import { TaxSummaryFragment } from './taxSummary';

export const GrandTotalFragment = gql`
    fragment GrandTotalFragment on CartPrices {
        grand_total {
            currency
            value
        }
        mp_reward_segments{
            code
            title
            value
          }
    }
`;

export const PriceSummaryFragment = gql`
    fragment PriceSummaryFragment on Cart {
        id
        items {
            id
            quantity
        }
        ...ShippingSummaryFragment
        ...AvailableShippingMethodsCartFragment
        prices {
            ...TaxSummaryFragment
            ...DiscountSummaryFragment
            ...GrandTotalFragment
            subtotal_excluding_tax{
        currency
        value
      }
              subtotal_including_tax{
                currency
                value
              }
              cgst{
                code
                currency
                title
                value
              }
              sgst{
                code
                currency
                title
                value
              }
              applied_taxes{
                amount{
                  currency
                  value
                }
                label
              }
              mp_extra_fee_segments{
                code
                currency
                title
                value
              }
              mp_reward_segments{
                code
                currency
                title
                value
              }
              discounts{
                amount{
                  currency
                  value
                }
                label
              }
              grand_total{
                currency
                value
              }
              shipping_cgst{
                code
                currency
                title
                value
              }
              shipping_sgst{
                code
                currency
                title
                value
              }
              igst{
                code
                currency
                title
                value
              }
              shipping_igst{
                code
                currency
                title
                value
              }
              utgst{
                code
                currency
                title
                value
              }
              shipping_utgst{
                code
                currency
                title
                value
              }
            subtotal_excluding_tax {
                currency
                value
            }

        }
        ...GiftCardSummaryFragment
    }
    ${DiscountSummaryFragment}
    ${GiftCardSummaryFragment}
    ${GrandTotalFragment}
    ${ShippingSummaryFragment}
    ${TaxSummaryFragment}
    ${AvailableShippingMethodsCartFragment}
`;
