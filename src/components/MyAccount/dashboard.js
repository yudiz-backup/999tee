import React from 'react';
import { shape, string } from 'prop-types';
import defaultClasses from './myAccount.css';
import searchClasses from '../SearchPage/searchPage.css';
import Sidebar from './sidebar.js';
import { FormattedMessage, useIntl } from 'react-intl';

import {
    useDashboard,
    useCustomerOrder
} from '../../peregrine/lib/talons/MyAccount/useDashboard';
import CustomerOrder from '../../queries/getCustomerOrderList.graphql';
import { Redirect, Link } from 'src/drivers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { monthsForChart } from '../../util/customData';

const Dashboard = props => {
    const talonProps = useDashboard();
    const {
        name,
        email,
        billingAddress,
        shippingAddress,
        isSignedIn,
        extension_attributes
    } = talonProps;
    const { formatMessage } = useIntl();

    const orderProps = useCustomerOrder({
        query: CustomerOrder
    });
    const { data } = orderProps;
    const subscriptionMsg =
        extension_attributes && extension_attributes.is_subscribed
            ? formatMessage({
                id: 'dashboard.newsletterSubscribedMessage',
                defaultMessage:
                    'You are subscribed to "General Subscription". '
            })
            : formatMessage({
                id: 'dashboard.newsLetterNotSubscribedMessage',
                defaultMessage: "You aren't subscribed to our newsletter."
            });

    if (!isSignedIn) {
        return <Redirect to="/" />;
    }
    return (
        <div className={defaultClasses.columns}>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-12">
                        <div
                            className={
                                defaultClasses.column +
                                ' ' +
                                defaultClasses.main
                            }
                        >
                            <div className={defaultClasses.account_sideBar}>
                                <Sidebar history={props.history} />
                            </div>
                            <div className={defaultClasses.account_contentBar}>
                                <div
                                    className={
                                        defaultClasses.page_title_wrapper
                                    }
                                >
                                    <h1 className={defaultClasses.page_title}>
                                        <span className={defaultClasses.base}>
                                            <FormattedMessage
                                                id={'dashboard.title'}
                                                defaultMessage={'My Account'}
                                            />
                                        </span>
                                    </h1>
                                </div>
                                <div
                                    className={
                                        defaultClasses.block +
                                        ' ' +
                                        defaultClasses.block_dashboard_info
                                    }
                                >
                                    <div className={defaultClasses.block_title}>
                                        <strong>
                                            <FormattedMessage
                                                id={
                                                    'dashboard.AccountInformation'
                                                }
                                                defaultMessage={
                                                    'Account Information'
                                                }
                                            />
                                        </strong>
                                    </div>
                                    <div
                                        className={defaultClasses.block_content}
                                    >
                                        <div
                                            className={
                                                defaultClasses.box +
                                                ' ' +
                                                defaultClasses.box_information
                                            }
                                        >
                                            <strong
                                                className={
                                                    defaultClasses.box_title
                                                }
                                            >
                                                <span>
                                                    <FormattedMessage
                                                        id={
                                                            'dashboard.ContactInformation'
                                                        }
                                                        defaultMessage={
                                                            'Contact Information'
                                                        }
                                                    />
                                                </span>
                                            </strong>
                                            <div
                                                className={
                                                    defaultClasses.box_content
                                                }
                                            >
                                                <p
                                                    className={
                                                        defaultClasses.box_content_info
                                                    }
                                                >
                                                    <p className={'mb-1'}>
                                                        {name}
                                                    </p>
                                                    <p>{email}</p>
                                                </p>
                                            </div>
                                            <div
                                                className={
                                                    defaultClasses.box_actions
                                                }
                                            >
                                                <Link
                                                    className={
                                                        defaultClasses.action +
                                                        ' ' +
                                                        defaultClasses.edit
                                                    }
                                                    to="/accountinformation"
                                                >
                                                    <span>
                                                        <FormattedMessage
                                                            id={
                                                                'dashboard.Edit'
                                                            }
                                                            defaultMessage={
                                                                'Edit'
                                                            }
                                                        />
                                                    </span>
                                                </Link>
                                                <Link
                                                    to={{
                                                        pathname: '/customer/account/edit/',
                                                        state: {
                                                            password: true
                                                        }
                                                    }}
                                                    className={
                                                        defaultClasses.action +
                                                        ' ' +
                                                        defaultClasses.change_password
                                                    }
                                                >
                                                    <FormattedMessage
                                                        id={
                                                            'dashboard.ChangePassword'
                                                        }
                                                        defaultMessage={
                                                            'Change Password'
                                                        }
                                                    />
                                                </Link>
                                            </div>
                                        </div>
                                        <div
                                            className={
                                                defaultClasses.box +
                                                ' ' +
                                                defaultClasses.box_newsletter
                                            }
                                        >
                                            <strong
                                                className={
                                                    defaultClasses.box_title
                                                }
                                            >
                                                <span>
                                                    <FormattedMessage
                                                        id={
                                                            'dashboard.Newsletters'
                                                        }
                                                        defaultMessage={
                                                            'Newsletters'
                                                        }
                                                    />
                                                </span>
                                            </strong>
                                            <div
                                                className={
                                                    defaultClasses.box_content
                                                }
                                            >
                                                <p
                                                    className={
                                                        defaultClasses.box_content_info
                                                    }
                                                >
                                                    {subscriptionMsg}
                                                </p>
                                            </div>
                                            <div
                                                className={
                                                    defaultClasses.box_actions
                                                }
                                            >
                                                <Link
                                                    className={
                                                        defaultClasses.action +
                                                        ' ' +
                                                        defaultClasses.edit
                                                    }
                                                    to="/newsletter/manage/"
                                                >
                                                    <span>
                                                        <FormattedMessage
                                                            id={
                                                                'dashboard.Edit'
                                                            }
                                                            defaultMessage={
                                                                'Edit'
                                                            }
                                                        />
                                                    </span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className={
                                        defaultClasses.block +
                                        ' ' +
                                        defaultClasses.block_dashboard_addresses
                                    }
                                >
                                    <div className={defaultClasses.block_title}>
                                        <strong>
                                            <FormattedMessage
                                                id={'dashboard.AddressBook'}
                                                defaultMessage={'Address Book'}
                                            />
                                        </strong>
                                        <Link
                                            className={
                                                defaultClasses.manage_address
                                            }
                                            to="/customer/address/"
                                        >
                                            <span>
                                                <FormattedMessage
                                                    id={
                                                        'dashboard.manage_address'
                                                    }
                                                    defaultMessage={
                                                        'Manage Addresses'
                                                    }
                                                />
                                            </span>
                                        </Link>
                                    </div>
                                    <div
                                        className={defaultClasses.block_content}
                                    >
                                        <div
                                            className={
                                                defaultClasses.box +
                                                ' ' +
                                                defaultClasses.box_information
                                            }
                                        >
                                            <div
                                                className={
                                                    defaultClasses.box_content
                                                }
                                            >
                                                {typeof billingAddress !=
                                                    'undefined' && (
                                                        <div className={'w-100'}>
                                                            <strong
                                                                className={
                                                                    defaultClasses.box_title
                                                                }
                                                            >
                                                                <span>
                                                                    <FormattedMessage
                                                                        id={
                                                                            'dashboard.default_billing_address'
                                                                        }
                                                                        defaultMessage={
                                                                            'Default Billing Address'
                                                                        }
                                                                    />
                                                                </span>
                                                            </strong>
                                                            <div
                                                                className={
                                                                    defaultClasses.box_content
                                                                }
                                                            >
                                                                <address
                                                                    className={
                                                                        defaultClasses.box_content_info
                                                                    }
                                                                >
                                                                    {billingAddress.firstname +
                                                                        ' ' +
                                                                        billingAddress.lastname}
                                                                    <br />
                                                                    {
                                                                        billingAddress
                                                                            .street[0]
                                                                    }
                                                                    <br />
                                                                    {
                                                                        billingAddress.city
                                                                    }
                                                                    ,{' '}
                                                                    {
                                                                        billingAddress
                                                                            .region
                                                                            .region
                                                                    }
                                                                    ,{' '}
                                                                    {
                                                                        billingAddress.postcode
                                                                    }
                                                                    ,{' '}
                                                                    {
                                                                        billingAddress.country_id
                                                                    }
                                                                    <br />
                                                                    Tel:{' '}
                                                                    <a
                                                                        href={
                                                                            'tel:' +
                                                                            billingAddress.telephone
                                                                        }
                                                                    >
                                                                        {
                                                                            billingAddress.telephone
                                                                        }
                                                                    </a>
                                                                </address>
                                                            </div>
                                                            <div
                                                                className={
                                                                    defaultClasses.box_actions
                                                                }
                                                            >
                                                                <Link
                                                                    className={
                                                                        defaultClasses.action +
                                                                        ' ' +
                                                                        defaultClasses.change_password
                                                                    }
                                                                    to={
                                                                        '/address/edit/' +
                                                                        billingAddress.id
                                                                    }
                                                                    data-ui-id="default-billing-edit-link"
                                                                >
                                                                    <FormattedMessage
                                                                        id={
                                                                            'dashboard.edit_billing_address'
                                                                        }
                                                                        defaultMessage={
                                                                            'Edit Address'
                                                                        }
                                                                    />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    )}
                                                {typeof billingAddress ==
                                                    'undefined' && (
                                                        <div
                                                            className={
                                                                defaultClasses.box_information
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    searchClasses.noResult
                                                                }
                                                            >
                                                                <span
                                                                    className={
                                                                        searchClasses.noResult_icon
                                                                    }
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            faExclamationTriangle
                                                                        }
                                                                    />
                                                                </span>
                                                                <span
                                                                    className={
                                                                        'ml-2' +
                                                                        ' ' +
                                                                        searchClasses.noResult_text
                                                                    }
                                                                >
                                                                    <FormattedMessage
                                                                        id={
                                                                            'dashboard.no_billing_address'
                                                                        }
                                                                        defaultMessage={
                                                                            'you have no billing address saved.'
                                                                        }
                                                                    />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                        <div
                                            className={
                                                defaultClasses.box +
                                                ' ' +
                                                defaultClasses.box_information
                                            }
                                        >
                                            <div
                                                className={
                                                    defaultClasses.box_content
                                                }
                                            >
                                                {typeof shippingAddress !=
                                                    'undefined' && (
                                                        <div className={'w-100'}>
                                                            <strong
                                                                className={
                                                                    defaultClasses.box_title
                                                                }
                                                            >
                                                                <span>
                                                                    <FormattedMessage
                                                                        id={
                                                                            'dashboard.default_Shipping_address'
                                                                        }
                                                                        defaultMessage={
                                                                            'Default Shipping Address'
                                                                        }
                                                                    />
                                                                </span>
                                                            </strong>
                                                            <div
                                                                className={
                                                                    defaultClasses.box_content
                                                                }
                                                            >
                                                                <address
                                                                    className={
                                                                        defaultClasses.box_content_info
                                                                    }
                                                                >
                                                                    {shippingAddress.firstname +
                                                                        ' ' +
                                                                        shippingAddress.lastname}
                                                                    <br />
                                                                    {
                                                                        shippingAddress
                                                                            .street[0]
                                                                    }
                                                                    <br />
                                                                    {
                                                                        shippingAddress.city
                                                                    }
                                                                    ,{' '}
                                                                    {
                                                                        shippingAddress
                                                                            .region
                                                                            .region
                                                                    }
                                                                    ,{' '}
                                                                    {
                                                                        shippingAddress.postcode
                                                                    }
                                                                    ,{' '}
                                                                    {
                                                                        shippingAddress.country_id
                                                                    }
                                                                    <br />
                                                                    Tel:{' '}
                                                                    <a
                                                                        href={
                                                                            'tel:' +
                                                                            shippingAddress.telephone
                                                                        }
                                                                    >
                                                                        {
                                                                            shippingAddress.telephone
                                                                        }
                                                                    </a>
                                                                </address>
                                                            </div>
                                                            <div
                                                                className={
                                                                    defaultClasses.box_actions
                                                                }
                                                            >
                                                                <Link
                                                                    className={
                                                                        defaultClasses.action +
                                                                        ' ' +
                                                                        defaultClasses.change_password
                                                                    }
                                                                    to={
                                                                        '/address/edit/' +
                                                                        billingAddress.id
                                                                    }
                                                                    data-ui-id="default-shipping-edit-link"
                                                                >
                                                                    <FormattedMessage
                                                                        id={
                                                                            'dashboard.edit_billing_address'
                                                                        }
                                                                        defaultMessage={
                                                                            'Edit Address'
                                                                        }
                                                                    />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className={
                                    defaultClasses.block +
                                    ' ' +
                                    defaultClasses.block_dashboard_orders
                                }
                            >
                                <div className={defaultClasses.block_title}>
                                    <strong>
                                        <FormattedMessage
                                            id={'dashboard.RecentOrders'}
                                            defaultMessage={'Recent Orders'}
                                        />
                                    </strong>
                                    <Link
                                        className={defaultClasses.view}
                                        to="/order/history"
                                    >
                                        <span>
                                            <FormattedMessage
                                                id={'dashboard.ViewAllOrders'}
                                                defaultMessage={'View All'}
                                            />
                                        </span>
                                    </Link>
                                </div>
                                <div
                                    className={defaultClasses.recent_order_list}
                                >
                                    <div
                                        className={
                                            defaultClasses.table_wrapper +
                                            ' ' +
                                            defaultClasses.orders_recent
                                        }
                                    >
                                        {typeof data != 'undefined' && (
                                            <div
                                                className={
                                                    defaultClasses.table_wrapper_inner
                                                }
                                            >
                                                <ul
                                                    className={
                                                        defaultClasses.table_wrapper_head
                                                    }
                                                >
                                                    <li
                                                        className={
                                                            defaultClasses.item +
                                                            ' ' +
                                                            defaultClasses.head_item
                                                        }
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'dashboard.Order'
                                                            }
                                                            defaultMessage={
                                                                'Order #'
                                                            }
                                                        />
                                                    </li>
                                                    <li
                                                        className={
                                                            defaultClasses.item +
                                                            ' ' +
                                                            defaultClasses.head_item
                                                        }
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'dashboard.Date'
                                                            }
                                                            defaultMessage={
                                                                'Date'
                                                            }
                                                        />
                                                    </li>
                                                    <li
                                                        className={
                                                            defaultClasses.item +
                                                            ' ' +
                                                            defaultClasses.head_item
                                                        }
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'dashboard.ShipTo'
                                                            }
                                                            defaultMessage={
                                                                'Ship To'
                                                            }
                                                        />
                                                    </li>
                                                    <li
                                                        className={
                                                            defaultClasses.item +
                                                            ' ' +
                                                            defaultClasses.head_item
                                                        }
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'dashboard.OrderTotal'
                                                            }
                                                            defaultMessage={
                                                                'Order Total'
                                                            }
                                                        />
                                                    </li>
                                                    <li
                                                        className={
                                                            defaultClasses.item +
                                                            ' ' +
                                                            defaultClasses.head_item
                                                        }
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'dashboard.Status'
                                                            }
                                                            defaultMessage={
                                                                'Status'
                                                            }
                                                        />
                                                    </li>
                                                    <li
                                                        className={
                                                            defaultClasses.item +
                                                            ' ' +
                                                            defaultClasses.head_item
                                                        }
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'dashboard.Action'
                                                            }
                                                            defaultMessage={
                                                                'Action'
                                                            }
                                                        />
                                                    </li>
                                                </ul>
                                                <div
                                                    className={
                                                        defaultClasses.table_wrapper_body
                                                    }
                                                >
                                                    {data.map((val, index) => {
                                                        const date = new Date(notificationList?.created_at);
                                                        const dateMDY = `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}-${monthsForChart[date.getMonth() + 1]}-${date.getFullYear()}`;
                                                        return (
                                                            <ul
                                                                key={index}
                                                                className={
                                                                    defaultClasses.orders_row
                                                                }
                                                            >
                                                                <li
                                                                    mobilelabel="Order #"
                                                                    className={
                                                                        defaultClasses.item +
                                                                        ' ' +
                                                                        defaultClasses.body_item
                                                                    }
                                                                >
                                                                    {
                                                                        val.increment_id
                                                                    }
                                                                </li>
                                                                <li
                                                                    mobilelabel="Date"
                                                                    className={
                                                                        defaultClasses.item +
                                                                        ' ' +
                                                                        defaultClasses.body_item
                                                                    }
                                                                >
                                                                    {
                                                                        dateMDY
                                                                    }
                                                                </li>
                                                                <li
                                                                    mobilelabel="Ship To"
                                                                    className={
                                                                        defaultClasses.item +
                                                                        ' ' +
                                                                        defaultClasses.body_item
                                                                    }
                                                                >
                                                                    {
                                                                        val.ship_to
                                                                    }
                                                                </li>
                                                                <li
                                                                    mobilelabel="Order Total"
                                                                    className={
                                                                        defaultClasses.item +
                                                                        ' ' +
                                                                        defaultClasses.body_item
                                                                    }
                                                                >
                                                                    {
                                                                        val.grand_total
                                                                    }
                                                                </li>
                                                                <li
                                                                    mobilelabel="Status"
                                                                    className={
                                                                        defaultClasses.item +
                                                                        ' ' +
                                                                        defaultClasses.body_item
                                                                    }
                                                                >
                                                                    {val.status}
                                                                </li>
                                                                <li
                                                                    mobilelabel="Action"
                                                                    className={
                                                                        defaultClasses.item +
                                                                        ' ' +
                                                                        defaultClasses.body_item
                                                                    }
                                                                >
                                                                    <Link
                                                                        className={
                                                                            defaultClasses.body_item_link
                                                                        }
                                                                        to={
                                                                            '/orderview/' +
                                                                            val.id
                                                                        }
                                                                    >
                                                                        <FormattedMessage
                                                                            id={
                                                                                'dashboard.ViewOrder'
                                                                            }
                                                                            defaultMessage={
                                                                                'View Order'
                                                                            }
                                                                        />
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        {data && data.length == 0 && (
                                            <div
                                                className={
                                                    searchClasses.noResult
                                                }
                                            >
                                                <span
                                                    className={
                                                        searchClasses.noResult_icon
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={
                                                            faExclamationTriangle
                                                        }
                                                    />
                                                </span>
                                                <span
                                                    className={
                                                        'ml-2' +
                                                        ' ' +
                                                        searchClasses.noResult_text
                                                    }
                                                >
                                                    <FormattedMessage
                                                        id={
                                                            'dashboard.noOrderMsg'
                                                        }
                                                        defaultMessage={
                                                            'You have no orders.'
                                                        }
                                                    />
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

Dashboard.propTypes = {
    classes: shape({
        actions: string,
        root: string,
        subtitle: string,
        title: string,
        user: string
    })
};
