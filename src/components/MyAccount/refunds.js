import React from 'react';
import { shape, string } from 'prop-types';
import Classes from './myAccount.css';
import defaultClasses from './myOrderView.css';
import invoiceClasses from './invoice.css';
import Sidebar from './sidebar.js';
import { useRefunds } from '../../peregrine/lib/talons/MyAccount/useDashboard';
import { FormattedMessage } from 'react-intl';
import RefundsQuery from '../../queries/getRefunds.graphql';
import { Redirect, Link } from 'src/drivers';
import { useParams } from 'react-router-dom';
import { monthsForChart } from '../../util/customData';
import Button from '@magento/venia-ui/lib/components/Button';

const Refunds = props => {
    const { orderid } = useParams();
    const orderId = orderid;
    const RefundsProps = useRefunds({
        query: RefundsQuery,
        orderId
    });
    const { data, isSignedIn } = RefundsProps;
    if (!isSignedIn) {
        return <Redirect to="/" />;
    }

    const date = new Date(data?.order_date);
    const dateMDY = date && `${date.getDate() < 10 ? `0${date.getDate()}` :
        date.getDate()}-${monthsForChart[date.getMonth() + 1]}-${date.getFullYear()}`;


    return (
        <div className={defaultClasses.columns}>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-12">
                        <div className={Classes.column + ' ' + Classes.main}>
                            <div className={Classes.account_sideBar}>
                                <Sidebar
                                    history={props.history}
                                    activePath={'/order/history'}
                                />
                            </div>
                            {typeof data != 'undefined' && (
                                <div
                                    className={
                                        Classes.account_contentBar +
                                        ' ' +
                                        defaultClasses.column +
                                        ' ' +
                                        defaultClasses.main
                                    }
                                >
                                    <div
                                        className={
                                            defaultClasses.page_title_wrapper
                                        }
                                    >
                                        <div
                                            className={
                                                'd-flex align-items-center'
                                            }
                                        >
                                            <h1
                                                className={
                                                    defaultClasses.page_title
                                                }
                                            >
                                                <span
                                                    className={
                                                        defaultClasses.base
                                                    }
                                                >
                                                    {'Order # ' +
                                                        data.order_number}
                                                </span>
                                            </h1>
                                            <span
                                                className={
                                                    defaultClasses.order_status
                                                }
                                            >
                                                {data.order_status}
                                            </span>
                                        </div>
                                        <div
                                            className={
                                                defaultClasses.order_date
                                            }
                                        >
                                            <span>{dateMDY}</span>
                                        </div>
                                        <div
                                            className={
                                                defaultClasses.actions_toolbar +
                                                ' ' +
                                                defaultClasses.order_actions_toolbar
                                            }
                                        >
                                            <div
                                                className={
                                                    defaultClasses.actions +
                                                    ' ' +
                                                    defaultClasses.print
                                                }
                                            >
                                                <span
                                                    className={
                                                        defaultClasses.action +
                                                        ' ' +
                                                        defaultClasses.print
                                                    }
                                                >
                                                    <Link
                                                        to={{
                                                            pathname:
                                                                '/printorder/' +
                                                                orderId
                                                        }}
                                                    >
                                                        <Button priority='low'>
                                                            <FormattedMessage
                                                                id={
                                                                    'refund.PrintOrder'
                                                                }
                                                                defaultMessage={
                                                                    'Print Invoice'
                                                                }
                                                            />
                                                        </Button>
                                                    </Link>
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className={
                                                defaultClasses.actions_toolbar +
                                                ' ' +
                                                defaultClasses.order_actions_toolbar
                                            }
                                        >
                                            <div
                                                className={
                                                    defaultClasses.actions
                                                }
                                            >
                                                {/* <span>
                                                    <span className={defaultClasses.reorder_action}>Reorder</span>
                                                </span> */}
                                                <span
                                                    className={
                                                        defaultClasses.print_link +
                                                        ' ' +
                                                        'ml-0'
                                                    }
                                                >
                                                    <span>
                                                        <Link
                                                            to={{
                                                                pathname:
                                                                    '/orderview/' +
                                                                    orderId
                                                            }}
                                                        >
                                                            <FormattedMessage
                                                                id={
                                                                    'refund.ItemOrdered'
                                                                }
                                                                defaultMessage={
                                                                    'Item ordered'
                                                                }
                                                            />
                                                        </Link>
                                                    </span>
                                                </span>

                                                {data &&
                                                    data.hasInvoices ==
                                                    true && (
                                                        <span
                                                            className={
                                                                defaultClasses.action +
                                                                ' ' +
                                                                defaultClasses.print_link
                                                            }
                                                        >
                                                            <Link
                                                                to={{
                                                                    pathname:
                                                                        '/invoice/' +
                                                                        orderId
                                                                }}
                                                            >
                                                                <FormattedMessage
                                                                    id={
                                                                        'refund.Invoice'
                                                                    }
                                                                    defaultMessage={
                                                                        'Invoice'
                                                                    }
                                                                />
                                                            </Link>
                                                        </span>
                                                    )}
                                                {data &&
                                                    data.hasShipments ==
                                                    true && (
                                                        <span
                                                            className={
                                                                defaultClasses.action +
                                                                ' ' +
                                                                defaultClasses.print_link
                                                            }
                                                        >
                                                            <Link
                                                                to={{
                                                                    pathname:
                                                                        '/shipment/' +
                                                                        orderId
                                                                }}
                                                            >
                                                                <FormattedMessage
                                                                    id={
                                                                        'refund.Shipment'
                                                                    }
                                                                    defaultMessage={
                                                                        'Shipment'
                                                                    }
                                                                />
                                                            </Link>
                                                        </span>
                                                    )}
                                                {data &&
                                                    data.hasCreditmemos ==
                                                    true && (
                                                        <span
                                                            className={
                                                                defaultClasses.active +
                                                                ' ' +
                                                                defaultClasses.action +
                                                                ' ' +
                                                                defaultClasses.print_link
                                                            }
                                                        >
                                                            <Link
                                                                to={{
                                                                    pathname:
                                                                        '/refunds/' +
                                                                        orderId
                                                                }}
                                                            >
                                                                <FormattedMessage
                                                                    id={
                                                                        'refund.Refunds'
                                                                    }
                                                                    defaultMessage={
                                                                        'Refunds'
                                                                    }
                                                                />
                                                            </Link>
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                    <ul
                                        className={
                                            defaultClasses.items +
                                            ' ' +
                                            defaultClasses.order_links
                                        }
                                    >
                                        <li
                                            className={
                                                'nav' +
                                                ' ' +
                                                defaultClasses.item +
                                                ' ' +
                                                defaultClasses.current
                                            }
                                        >
                                            <strong>
                                                <FormattedMessage
                                                    id={'refund.ItemsOrdered'}
                                                    defaultMessage={
                                                        'Items Ordered'
                                                    }
                                                />
                                            </strong>
                                        </li>
                                    </ul>
                                    <div
                                        className={
                                            defaultClasses.order_details_items +
                                            ' ' +
                                            defaultClasses.ordered
                                        }
                                    >
                                        <div
                                            className={
                                                defaultClasses.order_title +
                                                ' ' +
                                                'd-flex' +
                                                ' ' +
                                                'justify-content-between'
                                            }
                                        >
                                            <strong>
                                                <FormattedMessage
                                                    id={'refund.Refunds'}
                                                    defaultMessage={'Refunds'}
                                                />
                                            </strong>
                                            <span
                                                className={
                                                    defaultClasses.action +
                                                    ' ' +
                                                    defaultClasses.back
                                                }
                                            >
                                                <span>
                                                    <Link
                                                        to={{
                                                            pathname:
                                                                '/order/history'
                                                        }}
                                                    >
                                                        <Button priority='high'>
                                                            <FormattedMessage
                                                                id={
                                                                    'refund.BackToOrders'
                                                                }
                                                                defaultMessage={
                                                                    'Back to My Orders'
                                                                }
                                                            />
                                                        </Button>
                                                    </Link>
                                                </span>
                                            </span>
                                        </div>

                                        <div
                                            className={
                                                defaultClasses.data +
                                                ' ' +
                                                'table' +
                                                ' ' +
                                                defaultClasses.table_order_items
                                            }
                                            id="my-orders-table"
                                            summary="Items Ordered"
                                        >
                                            {data.refunds.map(
                                                (refundVal, refundIndex) => {
                                                    return (
                                                        <div
                                                            key={refundIndex}
                                                            className={
                                                                'clearfix' +
                                                                ' ' +
                                                                invoiceClasses.table_wrapper +
                                                                ' ' +
                                                                defaultClasses.order_items
                                                            }
                                                        >
                                                            <p
                                                                className={
                                                                    invoiceClasses.invoice_order_title
                                                                }
                                                            >
                                                                {'Refund #' +
                                                                    refundVal.increment_id}
                                                            </p>
                                                            <ul
                                                                className={
                                                                    Classes.table_wrapper_head +
                                                                    ' ' +
                                                                    defaultClasses.table_head
                                                                }
                                                            >
                                                                <li
                                                                    className={
                                                                        defaultClasses.name +
                                                                        ' ' +
                                                                        Classes.item
                                                                    }
                                                                >
                                                                    <FormattedMessage
                                                                        id={
                                                                            'refund.ProductName'
                                                                        }
                                                                        defaultMessage={
                                                                            'Product Name'
                                                                        }
                                                                    />
                                                                </li>
                                                                <li
                                                                    className={
                                                                        defaultClasses.sku +
                                                                        ' ' +
                                                                        Classes.item
                                                                    }
                                                                >
                                                                    <FormattedMessage
                                                                        id={
                                                                            'refund.SKU'
                                                                        }
                                                                        defaultMessage={
                                                                            'SKU'
                                                                        }
                                                                    />
                                                                </li>
                                                                <li
                                                                    className={
                                                                        defaultClasses.price +
                                                                        ' ' +
                                                                        Classes.item
                                                                    }
                                                                >
                                                                    <FormattedMessage
                                                                        id={
                                                                            'refund.Price'
                                                                        }
                                                                        defaultMessage={
                                                                            'Price'
                                                                        }
                                                                    />
                                                                </li>
                                                                <li
                                                                    className={
                                                                        defaultClasses.qty +
                                                                        ' ' +
                                                                        Classes.item
                                                                    }
                                                                >
                                                                    <FormattedMessage
                                                                        id={
                                                                            'refund.QtyRefunded'
                                                                        }
                                                                        defaultMessage={
                                                                            'Qty Refunded'
                                                                        }
                                                                    />
                                                                </li>
                                                                <li
                                                                    className={
                                                                        defaultClasses.subtotal +
                                                                        ' ' +
                                                                        Classes.item
                                                                    }
                                                                >
                                                                    <FormattedMessage
                                                                        id={
                                                                            'refund.Subtotal'
                                                                        }
                                                                        defaultMessage={
                                                                            'Subtotal'
                                                                        }
                                                                    />
                                                                </li>
                                                            </ul>
                                                            <div
                                                                key={
                                                                    refundIndex
                                                                }
                                                                className={
                                                                    Classes.table_wrapper_body
                                                                }
                                                            >
                                                                {refundVal.item.map(
                                                                    (
                                                                        val,
                                                                        index
                                                                    ) => {
                                                                        return (
                                                                            <ul
                                                                                className={
                                                                                    Classes.orders_row +
                                                                                    ' ' +
                                                                                    defaultClasses.order_view
                                                                                }
                                                                                index={
                                                                                    index
                                                                                }
                                                                                id="order-item-row-111"
                                                                            >
                                                                                <li
                                                                                    className={
                                                                                        'col' +
                                                                                        ' ' +
                                                                                        defaultClasses.name
                                                                                    }
                                                                                    data-th="Product Name"
                                                                                >
                                                                                    <strong
                                                                                        className={
                                                                                            defaultClasses.product +
                                                                                            ' ' +
                                                                                            defaultClasses.product_item_name
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            val.product_name
                                                                                        }
                                                                                    </strong>
                                                                                    {val &&
                                                                                        val.options &&
                                                                                        val.options.map(
                                                                                            (
                                                                                                optionVal,
                                                                                                optionIndex
                                                                                            ) => {
                                                                                                return (
                                                                                                    <div
                                                                                                        key={
                                                                                                            optionIndex
                                                                                                        }
                                                                                                        className={
                                                                                                            defaultClasses.optionLabel
                                                                                                        }
                                                                                                    >
                                                                                                        <dt>
                                                                                                            {
                                                                                                                optionVal.label
                                                                                                            }
                                                                                                        </dt>
                                                                                                        <dd
                                                                                                            className={
                                                                                                                defaultClasses.optionValue
                                                                                                            }
                                                                                                        >
                                                                                                            {
                                                                                                                optionVal.value
                                                                                                            }
                                                                                                        </dd>
                                                                                                    </div>
                                                                                                );
                                                                                            }
                                                                                        )}
                                                                                </li>
                                                                                <li
                                                                                    className={
                                                                                        'col' +
                                                                                        ' ' +
                                                                                        defaultClasses.sku
                                                                                    }
                                                                                    data-th="SKU"
                                                                                >
                                                                                    {
                                                                                        val.sku
                                                                                    }
                                                                                </li>
                                                                                <li
                                                                                    className={
                                                                                        'col' +
                                                                                        ' ' +
                                                                                        defaultClasses.price
                                                                                    }
                                                                                    data-th="Price"
                                                                                >
                                                                                    <span
                                                                                        className={
                                                                                            defaultClasses.price_excluding_tax
                                                                                        }
                                                                                        data-label="Excl. Tax"
                                                                                    >
                                                                                        <span
                                                                                            className={
                                                                                                defaultClasses.cart_price
                                                                                            }
                                                                                        >
                                                                                            <span
                                                                                                className={
                                                                                                    defaultClasses.price
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    val.price
                                                                                                }
                                                                                            </span>
                                                                                        </span>
                                                                                    </span>
                                                                                </li>
                                                                                <li
                                                                                    className={
                                                                                        'col' +
                                                                                        ' ' +
                                                                                        defaultClasses.qty
                                                                                    }
                                                                                    data-th="Qty"
                                                                                >
                                                                                    <ul
                                                                                        className={
                                                                                            defaultClasses.items_qty
                                                                                        }
                                                                                    >
                                                                                        <li
                                                                                            className={
                                                                                                defaultClasses.item
                                                                                            }
                                                                                        >
                                                                                            <span
                                                                                                className={
                                                                                                    defaultClasses.content
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    val.qty_refunded
                                                                                                }
                                                                                            </span>
                                                                                        </li>
                                                                                    </ul>
                                                                                </li>
                                                                                <li
                                                                                    className={
                                                                                        'col' +
                                                                                        ' ' +
                                                                                        defaultClasses.subtotal
                                                                                    }
                                                                                    data-th="Subtotal"
                                                                                >
                                                                                    <span
                                                                                        className={
                                                                                            defaultClasses.price_excluding_tax
                                                                                        }
                                                                                        data-label="Excl. Tax"
                                                                                    >
                                                                                        <span
                                                                                            className={
                                                                                                defaultClasses.cart_price
                                                                                            }
                                                                                        >
                                                                                            <span
                                                                                                className={
                                                                                                    defaultClasses.price
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    val.subtotal
                                                                                                }
                                                                                            </span>{' '}
                                                                                        </span>
                                                                                    </span>
                                                                                </li>
                                                                            </ul>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                            <div
                                                                className={
                                                                    defaultClasses.table_footer
                                                                }
                                                            >
                                                                <div
                                                                    className={
                                                                        defaultClasses.subtotal
                                                                    }
                                                                >
                                                                    <span
                                                                        className={
                                                                            defaultClasses.mark
                                                                        }
                                                                    >
                                                                        <FormattedMessage
                                                                            id={
                                                                                'refund.Subtotal'
                                                                            }
                                                                            defaultMessage={
                                                                                'Subtotal'
                                                                            }
                                                                        />
                                                                    </span>
                                                                    <span
                                                                        className={
                                                                            defaultClasses.amount
                                                                        }
                                                                    >
                                                                        <span
                                                                            className={
                                                                                defaultClasses.price
                                                                            }
                                                                        >
                                                                            {
                                                                                data.subtotal
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                </div>

                                                                {(data.discount_amount !=
                                                                    '0') && (
                                                                        <div
                                                                            className={
                                                                                defaultClasses.shipping
                                                                            }
                                                                        >
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.mark + ' ' + defaultClasses.discount_amount
                                                                                }
                                                                            >
                                                                                {data.discount_description
                                                                                    ? 'Discount (' +
                                                                                    data.discount_description +
                                                                                    ')'
                                                                                    : 'Discount'}
                                                                            </span>
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.amount
                                                                                }
                                                                            >
                                                                                <span
                                                                                    className={
                                                                                        defaultClasses.price
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        data.discount_amount
                                                                                    }
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                {(data.cgst_amount !== '0' &&
                                                                    data.cgst_amount !== '₹0' &&
                                                                    data?.cgst_amount) && (
                                                                        <div
                                                                            className={
                                                                                defaultClasses.shipping
                                                                            }
                                                                        >
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.mark
                                                                                }
                                                                            >
                                                                                Cgst
                                                                            </span>
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.amount
                                                                                }
                                                                            >
                                                                                <span
                                                                                    className={
                                                                                        defaultClasses.price
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        data.cgst_amount
                                                                                    }
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                {(data.sgst_amount !== '0' &&
                                                                    data.sgst_amount !== '₹0' &&
                                                                    data?.sgst_amount) && (
                                                                        <div
                                                                            className={
                                                                                defaultClasses.shipping
                                                                            }
                                                                        >
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.mark
                                                                                }
                                                                            >
                                                                                Sgst
                                                                            </span>
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.amount
                                                                                }
                                                                            >
                                                                                <span
                                                                                    className={
                                                                                        defaultClasses.price
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        data.sgst_amount
                                                                                    }
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                {(data.igst_amount !== '0' &&
                                                                    data.igst_amount !== '₹0' &&
                                                                    data?.igst_amount) && (
                                                                        <div
                                                                            className={
                                                                                defaultClasses.shipping
                                                                            }
                                                                        >
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.mark
                                                                                }
                                                                            >
                                                                                Igst
                                                                            </span>
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.amount
                                                                                }
                                                                            >
                                                                                <span
                                                                                    className={
                                                                                        defaultClasses.price
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        data.igst_amount
                                                                                    }
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                {data.shipping != '0' && (
                                                                    <div
                                                                        className={
                                                                            defaultClasses.shipping
                                                                        }
                                                                    >
                                                                        <span
                                                                            className={
                                                                                defaultClasses.mark
                                                                            }
                                                                        >
                                                                            Shipping &amp;
                                                                            Handling
                                                                        </span>
                                                                        <span
                                                                            className={
                                                                                defaultClasses.amount
                                                                            }
                                                                        >
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.price
                                                                                }
                                                                            >
                                                                                {
                                                                                    data.shipping
                                                                                }
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {(data.shipping_cgst_amount !== '0' &&
                                                                    data.shipping_cgst_amount !== '₹0' &&
                                                                    data?.shipping_cgst_amount) && (
                                                                        <div
                                                                            className={
                                                                                defaultClasses.shipping
                                                                            }
                                                                        >
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.mark
                                                                                }
                                                                            >
                                                                                Shipping Cgst
                                                                            </span>
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.amount
                                                                                }
                                                                            >
                                                                                <span
                                                                                    className={
                                                                                        defaultClasses.price
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        data.shipping_cgst_amount
                                                                                    }
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                {(data.shipping_sgst_amount !== '0' &&
                                                                    data.shipping_sgst_amount !== "₹0" &&
                                                                    data?.shipping_sgst_amount) && (
                                                                        <div
                                                                            className={
                                                                                defaultClasses.shipping
                                                                            }
                                                                        >
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.mark
                                                                                }
                                                                            >
                                                                                Shipping Sgst
                                                                            </span>
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.amount
                                                                                }
                                                                            >
                                                                                <span
                                                                                    className={
                                                                                        defaultClasses.price
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        data.shipping_sgst_amount
                                                                                    }
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                {(data.shipping_igst_amount !== '0' &&
                                                                    data.shipping_igst_amount !== "₹0" &&
                                                                    data?.shipping_igst_amount) && (
                                                                        <div
                                                                            className={
                                                                                defaultClasses.shipping
                                                                            }
                                                                        >
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.mark
                                                                                }
                                                                            >
                                                                                Shipping Igst
                                                                            </span>
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.amount
                                                                                }
                                                                            >
                                                                                <span
                                                                                    className={
                                                                                        defaultClasses.price
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        data.shipping_igst_amount
                                                                                    }
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                {(data.applied_store_credit !== '0' &&
                                                                    data.applied_store_credit !== "₹0" &&
                                                                    data?.applied_store_credit) && (
                                                                        <div
                                                                            className={
                                                                                defaultClasses.shipping
                                                                            }
                                                                        >
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.mark
                                                                                }
                                                                            >
                                                                                Store Credit
                                                                            </span>
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.amount
                                                                                }
                                                                            >
                                                                                <span
                                                                                    className={
                                                                                        defaultClasses.price
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        data.applied_store_credit
                                                                                    }
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                {(data.gift_wrap !== '0' &&
                                                                    data.gift_wrap !== "₹0" &&
                                                                    data?.gift_wrap) && (
                                                                        <div
                                                                            className={
                                                                                defaultClasses.shipping
                                                                            }
                                                                        >
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.mark
                                                                                }
                                                                            >
                                                                                Gift Wrap
                                                                            </span>
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.amount
                                                                                }
                                                                            >
                                                                                <span
                                                                                    className={
                                                                                        defaultClasses.price
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        data.gift_wrap
                                                                                    }
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                    )}


                                                                {(data.mp_extra_fee !== '0' &&
                                                                    data.mp_extra_fee !== '₹0' &&
                                                                    data?.mp_extra_fee) && (
                                                                        <div
                                                                            className={
                                                                                defaultClasses.shipping
                                                                            }
                                                                        >
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.mark
                                                                                }
                                                                            >
                                                                                COD Fee
                                                                            </span>
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.amount
                                                                                }
                                                                            >
                                                                                <span
                                                                                    className={
                                                                                        defaultClasses.price
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        data.mp_extra_fee
                                                                                    }
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                {data.tax != '0' && (
                                                                    <div
                                                                        className={
                                                                            defaultClasses.shipping
                                                                        }
                                                                    >
                                                                        <span
                                                                            className={
                                                                                defaultClasses.mark
                                                                            }
                                                                        >
                                                                            <FormattedMessage
                                                                                id={
                                                                                    'myOrderView.Tax'
                                                                                }
                                                                                defaultMessage={
                                                                                    'Tax'
                                                                                }
                                                                            />
                                                                        </span>
                                                                        <span
                                                                            className={
                                                                                defaultClasses.amount
                                                                            }
                                                                        >
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.price
                                                                                }
                                                                            >
                                                                                {data.tax}
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div
                                                                    className={
                                                                        defaultClasses.grand_total
                                                                    }
                                                                >
                                                                    <span
                                                                        className={
                                                                            defaultClasses.mark
                                                                        }
                                                                    >
                                                                        <strong>
                                                                            <FormattedMessage
                                                                                id={
                                                                                    'refund.Grand Total'
                                                                                }
                                                                                defaultMessage={
                                                                                    'Grand Total'
                                                                                }
                                                                            />
                                                                        </strong>
                                                                    </span>
                                                                    <span
                                                                        className={
                                                                            defaultClasses.amount
                                                                        }
                                                                    >
                                                                        <strong>
                                                                            <span
                                                                                className={
                                                                                    defaultClasses.price
                                                                                }
                                                                            >
                                                                                {
                                                                                    refundVal.grand_total
                                                                                }
                                                                            </span>
                                                                        </strong>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Refunds;

Refunds.propTypes = {
    classes: shape({
        actions: string,
        root: string,
        subtitle: string,
        title: string,
        user: string
    })
};
