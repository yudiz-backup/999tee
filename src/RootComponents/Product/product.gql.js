import { gql } from '@apollo/client';

export const GET_PRODUCT_DETAIL_QUERY = gql`
    query getProductDetailForProductPage($urlKey: String!) {
        products(filter: { url_key: { eq: $urlKey } }) {
            items {
                # Once graphql-ce/1027 is resolved, use a ProductDetails fragment
                # here instead.
                __typename
                categories {
                    id
                    breadcrumbs {
                        category_id
                    }
                }
                description {
                    html
                }
                id
                mp_sizechart
                mp_sizeChart{
                rule_content
                template_styles
                }
                media_gallery_entries {
                    id
                    label
                    position
                    disabled
                    file
                    media_type
                    content {
                        base64_encoded_data
                        type
                        name
                    }
                    video_content {
                        media_type
                        video_provider
                        video_url
                        video_title
                        video_description
                        video_metadata
                    }
                    types
                }
                meta_description
                meta_title
                meta_keyword
                name
                structureData {
                    gtin8
                    offers {
                        type
                        priceCurrency
                        price
                        itemOffered
                        availability
                        url
                        offerCount
                        highPrice
                        lowPrice
                        offers {
                            type
                            name
                            price
                            sku
                            image
                        }
                    }
                }
                price_range {
                    minimum_price {
                        regular_price {
                            value
                            currency
                        }
                        final_price {
                            value
                            currency
                        }
                        discount {
                            amount_off
                            percent_off
                        }
                    }
                    maximum_price {
                        regular_price {
                            value
                            currency
                        }
                        final_price {
                            value
                            currency
                        }
                        discount {
                            amount_off
                            percent_off
                        }
                    }
                }
                sku
                stock_status
                only_x_left_in_stock
                stock_status_data {
                    qty
                    low_stock_qty
                    stock_status
                }
                rating_summary
                review_count
                small_image {
                    url
                }
                url_key
                url_suffix
                ... on CustomizableProductInterface {
                    options {
                        title
                        required
                        sort_order
                        option_id
                        ... on CustomizableDropDownOption {
                            value {
                                option_type_id
                                sku
                                price
                                price_type
                                sort_order
                                title
                                uid
                            }
                        }

                        ... on CustomizableRadioOption {
                            value {
                                option_type_id
                                price_type
                                price
                                sku
                                sort_order
                                title
                                uid
                            }
                        }
                        ... on CustomizableCheckboxOption {
                            value {
                                option_type_id
                                price_type
                                price
                                sku
                                sort_order
                                title
                                uid
                            }
                        }
                        ... on CustomizableMultipleOption {
                            value {
                                option_type_id
                                price_type
                                price
                                sku
                                sort_order
                                title
                                uid
                            }
                        }

                        ... on CustomizableAreaOption {
                            areaValue: value {
                                max_characters
                                price_type
                                price
                                uid
                            }
                        }

                        ... on CustomizableFieldOption {
                            textValue: value {
                                max_characters
                                price_type
                                price
                                uid
                            }
                        }
                    }
                }
                ... on ConfigurableProduct {
                    configurable_options {
                        attribute_code
                        attribute_id
                        id
                        label
                        values {
                            default_label
                            label
                            store_label
                            use_default_value
                            value_index
                            swatch_data {
                                ... on ImageSwatchData {
                                    thumbnail
                                }
                                value
                            }
                        }
                    }
                    variants {
                        attributes {
                            code
                            value_index
                        }
                        product {
                            id
                            media_gallery_entries {
                                id
                                disabled
                                file
                                label
                                position
                            }
                            sku
                            stock_status
                            only_x_left_in_stock
                            stock_status_data {
                                qty
                                low_stock_qty
                                stock_status
                            }
                            price_range {
                                minimum_price {
                                    regular_price {
                                        value
                                        currency
                                    }
                                    final_price {
                                        value
                                        currency
                                    }
                                    discount {
                                        amount_off
                                        percent_off
                                    }
                                }
                                maximum_price {
                                    regular_price {
                                        value
                                        currency
                                    }
                                    final_price {
                                        value
                                        currency
                                    }
                                    discount {
                                        amount_off
                                        percent_off
                                    }
                                }
                            }
                        }
                    }
                }

                ... on BundleProduct {
                    dynamic_sku
                    dynamic_price
                    dynamic_weight
                    price_view
                    ship_bundle_items
                    bundleItems: items {
                        option_id
                        title
                        sku
                        type
                        required
                        position
                        options {
                            id
                            label
                            quantity
                            can_change_quantity
                            price
                            price_type
                            is_default
                            position
                            product {
                                id
                                name
                                sku
                                stock_status
                                __typename
                                price_range {
                                    minimum_price {
                                        final_price {
                                            value
                                            currency
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;
