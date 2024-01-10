import React, { useState } from 'react';
import defaultClasses from './myAccount.css';
import Sidebar from './sidebar.js';
import {
    useDashboard,
    useCustomerOrder
} from '../../peregrine/lib/talons/MyAccount/useDashboard';
import CustomerOrder from '../../queries/getCustomerOrderList.graphql';
import { FormattedMessage, useIntl } from 'react-intl';
import { Redirect, Link } from 'src/drivers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import searchClasses from '../SearchPage/searchPage.css';
import GET_CUSTOMER_QUERY from '../../queries/getCustomer.graphql';
import { Title } from '../Head';
import Button from '../Button';
import { Eye as EyeIcon } from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { monthsForChart } from '../../util/customData';
import { useMobile } from '../../peregrine/lib/talons/Mobile/useMobile';
import LoadingIndicator from '../LoadingIndicator/indicator';
const eyeIcon = <Icon src={EyeIcon} size={20} />;

const accountOrderPerRow = 7;

const MyAccount = props => {
    const { formatMessage } = useIntl();
    const [next, setNext] = useState(accountOrderPerRow);
    const { mobileView } = useMobile();
    const talonProps = useDashboard();
    const {
        name,
        email,
        // billingAddress,
        shippingAddress,
        mobilenumber,
        isSignedIn,
        is_subscribed
    } = talonProps;

    const handleMoreAccountOrder = () => {
        setNext(next + accountOrderPerRow);
    };

    const orderProps = useCustomerOrder({
        query: CustomerOrder,
        customerQuery: GET_CUSTOMER_QUERY
    });
    const { data, loading } = orderProps;
    const subscriptionMsg = is_subscribed
        ? formatMessage({
            id: 'account.is_subscribed',
            defaultMessage: 'You are subscribed to "General Subscription". '
        })
        : formatMessage({
            id: 'account.is_not_subscribed',
            defaultMessage: "You aren't subscribed to our newsletter."
        });

    if (!isSignedIn) {
        return <Redirect to="/" />;
    }
    return (
        <div className={defaultClasses.columns}>
            <Title>{`My Account`}</Title>
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
                                                id={'account.page_title'}
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
                                                    'account.AccountInformation'
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
                                                            'account.ContactInformation'
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
                                                    <p className={'mb-1'}>{email}</p>
                                                    <p>{mobilenumber}</p>
                                                </p>
                                                <Link
                                                    className={
                                                        defaultClasses.edit
                                                    }
                                                    to="/customer/account/edit/"
                                                >
                                                    <img
                                                        src="/cenia-static/images/icons8-edit-48.png"
                                                        alt="edit"
                                                        height="20"
                                                        width="20"
                                                    // height="20"
                                                    />
                                                </Link>
                                            </div>
                                            <div
                                                className={
                                                    defaultClasses.box_actions
                                                }
                                            >
                                                <Link
                                                    to={{
                                                        pathname: '/customer/account/edit/',
                                                        state: {
                                                            password: true
                                                        }
                                                    }}
                                                    className={
                                                        // defaultClasses.action +
                                                        // ' ' +
                                                        defaultClasses.change_password
                                                    }
                                                >
                                                    <FormattedMessage
                                                        id={
                                                            'account.change_password'
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
                                                            'account.Newsletters'
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
                                                <Link
                                                    className={
                                                        defaultClasses.edit
                                                    }
                                                    to="/newsletter/manage/"
                                                >
                                                    <img
                                                        src="/cenia-static/images/icons8-edit-48.png"
                                                        alt="edit"
                                                        width="20"
                                                        height="20"
                                                    />
                                                </Link>
                                            </div>
                                            <div
                                                className={
                                                    defaultClasses.box_actions
                                                }
                                            />
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
                                                id={'account.AddressBook'}
                                                defaultMessage={' Address Book'}
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
                                                        'account.manage_address'
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
                                        {/* <div
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
                                                                            'account.DefaultBillingAddress'
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
                                                                {billingAddress &&
                                                                    billingAddress.id && (
                                                                        <Link
                                                                            className={
                                                                                // defaultClasses.action +
                                                                                // ' ' +
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
                                                                                    'account.EditAddress'
                                                                                }
                                                                                defaultMessage={
                                                                                    'Edit Address'
                                                                                }
                                                                            />
                                                                        </Link>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    )}
                                                {typeof billingAddress ==
                                                    'undefined' && (
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
                                                                        'account.noResult_text_product'
                                                                    }
                                                                    defaultMessage={
                                                                        'No Address Available!'
                                                                    }
                                                                />
                                                            </span>
                                                        </div>
                                                    )}
                                            </div>
                                        </div> */}
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
                                                                            'account.DefaultShippingAddress'
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
                                                                {shippingAddress &&
                                                                    shippingAddress.id && (
                                                                        <Link
                                                                            className={
                                                                                // defaultClasses.action +
                                                                                // ' ' +
                                                                                defaultClasses.change_password
                                                                            }
                                                                            to={
                                                                                '/address/edit/' +
                                                                                shippingAddress.id
                                                                            }
                                                                            data-ui-id="default-shipping-edit-link"
                                                                        >
                                                                            <FormattedMessage
                                                                                id={
                                                                                    'account.EditAddress'
                                                                                }
                                                                                defaultMessage={
                                                                                    'Edit Address'
                                                                                }
                                                                            />
                                                                        </Link>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    )}
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
                                                id={'account.RecentOrders'}
                                                defaultMessage={'Recent Orders'}
                                            />
                                        </strong>
                                        <Link
                                            className={defaultClasses.view}
                                            to="/order/history"
                                        >
                                            <span>
                                                <FormattedMessage
                                                    id={'account.ViewAll'}
                                                    defaultMessage={'View All'}
                                                />
                                            </span>
                                        </Link>
                                    </div>
                                    <div
                                        className={
                                            defaultClasses.recent_order_list
                                        }
                                    >
                                        <div
                                            className={
                                                defaultClasses.table_wrapper +
                                                ' ' +
                                                defaultClasses.orders_recent
                                            }
                                        >

                                            {typeof data != 'undefined' &&
                                                data.items.length != 0 && !loading ? (
                                                <div
                                                    className={
                                                        defaultClasses.table_wrapper_inner + ' ' + defaultClasses.myOrder_table_wrapper
                                                    }
                                                >
                                                    <ul
                                                        className={
                                                            defaultClasses.table_wrapper_head + " " + defaultClasses.none_header_tabele
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
                                                                    'account.Order'
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
                                                                    'account.Date'
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
                                                                    'account.ShipTo'
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
                                                                    'account.OrderTotal'
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
                                                                    'account.Status'
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
                                                                    'account.Action'
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
                                                        {data?.items?.slice(0, next)?.map(
                                                            (
                                                                val,
                                                                index
                                                            ) => {
                                                                const date = new Date(val?.created_at);
                                                                const dateSplit = val?.created_at.split(" ")
                                                                const dateMDY = date ? `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}-${monthsForChart[date.getMonth() + 1]}-${date.getFullYear()}` : 'Not available';
                                                                return (
                                                                    <ul
                                                                        key={
                                                                            index
                                                                        }
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
                                                                                mobileView ? dateSplit?.[0] : dateMDY
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
                                                                            {
                                                                                val.status
                                                                            }
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
                                                                                <Button priority='high'>
                                                                                    {eyeIcon}
                                                                                </Button>
                                                                            </Link>
                                                                        </li>
                                                                    </ul>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                </div>) :
                                                <>
                                                    {data?.items?.length !== 0 && <LoadingIndicator/>}
                                                </>
                                            }
                                            {data && data?.items?.length == 0 && (
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
                                                                'account.noResult_text_orders'
                                                            }
                                                            defaultMessage={
                                                                'You have no orders.'
                                                            }
                                                        />
                                                    </span>
                                                </div>
                                            )}
                                            <div className='mt-2'>
                                                {next &&
                                                    data?.items != undefined &&
                                                    data?.items.length !== 0 &&
                                                    // rmaDetails.total_count < rmaDetails.items.length &&
                                                    next < data?.items.length && !loading &&
                                                    <Button
                                                        type="submit"
                                                        priority="high"
                                                        onClick={handleMoreAccountOrder}
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'rewardPoint.submitButton'
                                                            }
                                                            defaultMessage={
                                                                'Lode More'
                                                            }
                                                        />
                                                    </Button>
                                                }
                                            </div>
                                        </div>
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

export default MyAccount;
