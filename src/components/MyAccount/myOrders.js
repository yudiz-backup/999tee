import React, { useContext, useEffect, useState } from 'react';
import { shape, string } from 'prop-types';
import defaultClasses from './myAccount.css';
import searchClasses from '../SearchPage/searchPage.css';
import Sidebar from './sidebar.js';
import { useCustomerOrder } from '../../peregrine/lib/talons/MyAccount/useDashboard';
import { FormattedMessage } from 'react-intl';
import CustomerOrder from '../../queries/getCustomerOrderList.graphql';
import { Link, Redirect } from 'src/drivers';
import MyOrderSkelton from './MyOrderSkeleton.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Title } from '../Head';
import Button from '../Button';
import { useToasts } from '@magento/peregrine';
// import { useMutation } from '@apollo/client';
import { Eye as EyeIcon, Trash as TrashIcon } from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { monthsForChart } from '../../util/customData';
import DeleteModal from '../DeleteModal';
import { useMobile } from '../../peregrine/lib/talons/Mobile/useMobile';
import { globalContext } from '../../peregrine/lib/context/global';

const eyeIcon = <Icon src={EyeIcon} size={20} />;
const trashIcon = <Icon src={TrashIcon} size={20} />;

const MyOrders = props => {
    const [deleteFlag, setDeleteFlag] = useState(false);
    const { mobileView } = useMobile();
    const [value, setValue] = useState()
    const orderProps = useCustomerOrder({
        query: CustomerOrder,
        current_page: 1,
        limit: mobileView ? 5 : 10
    });

    const {  dispatch } = useContext(globalContext);
    const { data,
        isSignedIn,
        loading,
        loadMore,
        cancleOrderData,
        // custermerOrderData,
        orderCancleMsg } = orderProps;

    const handleCancle = () => {
        setDeleteFlag(true)
        dispatch({ type: "SCROLL_DISABLE", payload: { scrollDisable: true } })
    }

    const handleMyOrderDelete = () => {
        if (deleteFlag && value) {
            cancleOrderData({
                variables: {
                    id: value?.increment_id
                }
            })
            setDeleteFlag(false)
        }
    }
    const [, { addToast }] = useToasts();

    useEffect(() => {
        if (orderCancleMsg) {
            addToast({
                type: 'info',
                message: orderCancleMsg.orderCancel.message,
                dismissable: true,
                timeout: 5000
            });
        }
    }, [orderCancleMsg]);

    const loadMoreOrder = async () => {
        if (typeof data != 'undefined') {
            loadMore({
                current_page: data.current_page + 1,
                limit: data.limit
            });
        }
    };
    if (!isSignedIn) {
        return <Redirect to="/" />;
    }
    if (!loading) {
        return (
            <div className={defaultClasses.columns}>
                <Title>{`My Orders`}</Title>
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
                                <div
                                    className={
                                        defaultClasses.account_contentBar
                                    }
                                >
                                    <div
                                        className={
                                            defaultClasses.page_title_wrapper
                                        }
                                    >
                                        <h1
                                            className={
                                                defaultClasses.page_title
                                            }
                                        >
                                            <span
                                                className={defaultClasses.base}
                                            >
                                                <FormattedMessage
                                                    id={'myOrders.page_title'}
                                                    defaultMessage={'My Orders'}
                                                />
                                            </span>
                                        </h1>
                                    </div>
                                    <div
                                        className={
                                            defaultClasses.block +
                                            ' ' +
                                            defaultClasses.block_dashboard_orders
                                        }
                                    >
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
                                                    data.items.length != 0 && (
                                                        <div
                                                            className={defaultClasses.table_wrapper_inner + ' ' + defaultClasses.myOrder_table_wrapper + ' ' + defaultClasses.my_order}
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
                                                                            'myOrders.Order'
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
                                                                            'myOrders.Date'
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
                                                                            'myOrders.ShipTo'
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
                                                                            'myOrders.OrderTotal'
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
                                                                            'myOrders.Status'
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
                                                                            'myOrders.Action'
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
                                                                {data.items.map(
                                                                    (
                                                                        val,
                                                                        index
                                                                    ) => {
                                                                        const date = val?.created_at ? new Date(val?.created_at) : '';
                                                                        const dateSplit = val?.created_at.split(" ")
                                                                        const dateMDY = date && !mobileView ?
                                                                            `${date.getDate() < 10 ? `0${date.getDate()}` :
                                                                                date.getDate()}-${monthsForChart[date.getMonth() + 1]}-${date.getFullYear()}` :
                                                                            'Not available';
                                                                        const numericPart = parseFloat(val?.grand_total.replace(/[^0-9.-]+/g, ''));
                                                                        const roundedNumber = Math.round(numericPart)
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
                                                                                        mobileView ? `${dateSplit?.[0]}` : dateMDY
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
                                                                                        "₹" + roundedNumber
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
                                                                                    <div>
                                                                                        <Link
                                                                                            className={
                                                                                                defaultClasses.body_item_link +
                                                                                                ' ' +
                                                                                                defaultClasses.order_view_linkq
                                                                                            }
                                                                                            to={
                                                                                                '/orderview/' +
                                                                                                val.id
                                                                                            }
                                                                                        >
                                                                                            <Button priority='high'>
                                                                                                {/* <FormattedMessage
                                                                                                id={
                                                                                                    'myOrders.ViewOrder'
                                                                                                }
                                                                                                defaultMessage={
                                                                                                    'View Order'
                                                                                                }
                                                                                            /> */}
                                                                                                {eyeIcon}
                                                                                            </Button>
                                                                                        </Link>
                                                                                        {/* <a
                                                                                className={
                                                                                    defaultClasses.body_item_link
                                                                                }
                                                                                href="/"
                                                                            >
                                                                                Reorder
                                                                            </a> */}
                                                                                        {val.status === "Pending" && <Link
                                                                                            className={
                                                                                                defaultClasses.body_item_link +
                                                                                                ' ' +
                                                                                                defaultClasses.order_view_linkq
                                                                                            }
                                                                                        // to={
                                                                                        //     '/orderview/' +
                                                                                        //     val.id
                                                                                        // }
                                                                                        >
                                                                                            <Button priority='high'
                                                                                                onClick={() => {
                                                                                                    handleCancle()
                                                                                                    setValue(val)
                                                                                                }
                                                                                                }>

                                                                                                {trashIcon}
                                                                                            </Button>
                                                                                        </Link>}
                                                                                    </div>
                                                                                </li>

                                                                            </ul >
                                                                        );
                                                                    }
                                                                )}
                                                            </div >
                                                            {deleteFlag && <DeleteModal
                                                                categoryFlag={deleteFlag}
                                                                setCategoryFlag={setDeleteFlag}
                                                                // id={miniCartData.cart.id}
                                                                handleDeleteItem={handleMyOrderDelete}
                                                                type='myOrder'
                                                            />}
                                                        </div >
                                                    )}
                                                {
                                                    typeof data != 'undefined' &&
                                                    data.items.length > 0 &&
                                                    data.current_page !==
                                                    data.total_count && (
                                                        <button
                                                            className={
                                                                defaultClasses.load_more_btn
                                                            }
                                                            onClick={
                                                                loadMoreOrder
                                                            }
                                                        >
                                                            <FormattedMessage
                                                                id={
                                                                    'global.loadMore'
                                                                }
                                                                defaultMessage={
                                                                    'Load More'
                                                                }
                                                            />
                                                        </button>
                                                    )
                                                }

                                                {
                                                    data &&
                                                    data.items.length == 0 && (
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
                                                                        'myOrders.noOrderMessage'
                                                                    }
                                                                    defaultMessage={
                                                                        'You have no orders.'
                                                                    }
                                                                />
                                                            </span>
                                                        </div>
                                                    )
                                                }
                                            </div >
                                        </div >
                                    </div >
                                </div >
                            </div >
                        </div >
                    </div >
                </div >
            </div >
        );
    } else {
        return (
            <div className={defaultClasses.columns}>
                <Title>{`My Orders`}</Title>
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
                                <div
                                    className={
                                        defaultClasses.account_contentBar
                                    }
                                >
                                    <div
                                        className={
                                            defaultClasses.page_title_wrapper
                                        }
                                    >
                                        <h1
                                            className={
                                                defaultClasses.page_title
                                            }
                                        >
                                            <span
                                                className={defaultClasses.base}
                                            >
                                                <FormattedMessage
                                                    id={'myOrders.MyOrder'}
                                                    defaultMessage={'My Order'}
                                                />
                                            </span>
                                        </h1>
                                    </div>
                                    <div
                                        className={
                                            defaultClasses.block +
                                            ' ' +
                                            defaultClasses.block_dashboard_orders
                                        }
                                    >
                                        <MyOrderSkelton />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

export default MyOrders;

MyOrders.propTypes = {
    classes: shape({
        actions: string,
        root: string,
        subtitle: string,
        title: string,
        user: string
    })
};
