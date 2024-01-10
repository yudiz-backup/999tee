import React, { useState, useEffect } from 'react';
import Button from '../Button';
// import { Form } from 'informed';
// import Checkbox from '../Checkbox';
import defaultClasses from './rewardPoint.css';
import TableClasses from '../MyAccount/myAccount.css';
import Sidebar from '../MyAccount/sidebar.js';
import { Title } from '../Head';
import getRewardPointConfig from '../../queries/rewardPoint/rewardPointConfig.graphql'
// import rewardPointSubscribeUpdate from '../../queries/rewardPoint/rewardPointSubscribeUpdate.graphql'
import { /* useMutation, */ useQuery } from "@apollo/client";
import { FormattedMessage } from 'react-intl';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { Redirect } from 'src/drivers';
import searchClasses from '../SearchPage/searchPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { globalContext } from '../../peregrine/lib/context/global';
// import { isRequired } from '../../util/formValidators';
import { monthsForChart, statusArr } from '../../util/customData';
import { useMobile } from '../../peregrine/lib/talons/Mobile/useMobile';

const transactionPerRow = 3;

export default function RewardPoint(props) {
    const [next, setNext] = useState(transactionPerRow);
    // const [expireSubscribe, setExpireSubscribe] = useState(false)
    // const [updateSubscribe, setUpdateSubscribe] = useState(false)
    // const [updateExpireSubscribe, setUpdateExpireSubscribe] = useState()
    const { state, dispatch } = React.useContext(globalContext)

    const { mobileView } = useMobile();

    const handleMoreTransaction = () => {
        setNext(next + transactionPerRow);
    };

    const { data, refetch: rewardPointUpdateData } = useQuery(getRewardPointConfig, {
        fetchPolicy: "no-cache",
    })

    // const [rewardPointSubscribe] = useMutation(rewardPointSubscribeUpdate, {
    //     fetchPolicy: "no-cache",
    //     onCompleted: (data) => {
    //         setUpdateExpireSubscribe(data)
    //     },
    //     variables: {
    //         isExpire: expireSubscribe,
    //         isUpdate: updateSubscribe
    //     }
    // })

    // const handleSubmit = () => {
    //     if (updateSubscribe && expireSubscribe) {
    //         rewardPointSubscribe()
    //         setExpireSubscribe(false)
    //         setUpdateSubscribe(false)
    //     }
    // }

    useEffect(() => {
        rewardPointUpdateData()
    }, [])

    useEffect(() => {
        if (state && state.orderNumberInfo) {
            dispatch({
                type: 'ORDER_NUMBER',
                payload: { orderNumberInfo: '' }
            });
        }
    }, [state])

    const [{ isSignedIn }] = useUserContext();

    const rewardPointData = data && data.customer && data.customer.mp_reward

    if (!isSignedIn) {
        return <Redirect to="/" />;
    }

    const rewardTransationData = rewardPointData &&
        rewardPointData.transactions &&
        rewardPointData.transactions.items.slice(0, next) &&
        rewardPointData?.transactions?.items?.sort((a, b) =>
            b?.transaction_id - a?.transaction_id)?.slice(0, next)?.map(item => {
                const date = new Date(item.created_at);
                const dateSplit = item?.created_at.split(" ")
                // const expiry_date = item.expiration_date && new Date(item.expiration_date);
                const dateMDY = date ? `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}-${monthsForChart[date?.getMonth() + 1]}-${date.getFullYear()}` : "Not available";
                // const expirydateMDY = expiry_date ? `${expiry_date.getDate() < 10 ? `0${expiry_date.getDate()}` : expiry_date.getDate()}-${monthsForChart[expiry_date?.getMonth() + 1]}-${expiry_date.getFullYear()}` : "-";
                return <ul className={TableClasses.orders_row}>
                    <li mobilelabel='Order Ids #' className={TableClasses.item + " " + TableClasses.body_item}>{item.order_id}</li>
                    <li mobilelabel='Date :' className={TableClasses.item + " " + TableClasses.body_item}>{mobileView ? dateSplit?.[0] : dateMDY}</li>
                    <li mobilelabel='Comment :' className={TableClasses.item + " " + TableClasses.body_item}>{item.comment}</li>
                    <li mobilelabel='Amount :' className={TableClasses.item + " " + TableClasses.body_item}>₹ {item.point_amount}</li>
                    <li mobilelabel='Status :' className={TableClasses.item + " " + TableClasses.body_item}>{statusArr[item.status]}</li>
                    {/* <li mobilelabel='Expire Date :' className={TableClasses.item + " " + TableClasses.body_item}>{expirydateMDY}</li> */}
                </ul>
            })
    return (
        <section className={defaultClasses.rewardPoint_page}>
            <Title>{`Reward Points`}</Title>
            <div className={TableClasses.columns}>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className={TableClasses.column + ' ' + TableClasses.main} >
                                <div className={TableClasses.account_sideBar}>
                                    <Sidebar history={props.history} />
                                </div>
                                <div className={TableClasses.account_contentBar}>
                                    <div className={TableClasses.page_title_wrapper}>
                                        <h1 className={TableClasses.page_title}>
                                            <span className={TableClasses.base}>
                                                <FormattedMessage
                                                    id={'rewardPoint.rewardPointTitle'}
                                                    defaultMessage={'Reward Points'}
                                                />
                                            </span>
                                        </h1>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="row justify-content-center align-items-center">
                                                {['Available Balance', 'Total Earned', 'Total Spent'].map((category, index) => (
                                                    <div key={index} className="col-lg-4 col-sm-6">
                                                        <div>
                                                            {mobileView && <h6 className=' mb-2'>
                                                                <FormattedMessage
                                                                    id={`rewardPoint.${category.toLowerCase().replace(/\s/g, '')}`}
                                                                    defaultMessage={category}
                                                                />
                                                            </h6>}
                                                            <div className={defaultClasses.rewardPoint_item}>
                                                                <span>{rewardPointData && rewardPointData[`point_${category.split(" ").pop().toLowerCase()}`]} {rewardPointData && rewardPointData[`point_${category.split(" ").pop().toLowerCase()}`] !== 0 ? "Points" : "Point"}</span>
                                                            </div>
                                                            {!mobileView && <h6>
                                                                <FormattedMessage
                                                                    id={`rewardPoint.${category.toLowerCase().replace(/\s/g, '')}`}
                                                                    defaultMessage={category}
                                                                />
                                                            </h6>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={"col-lg-6" + " " + defaultClasses.rewardPoint_address}>
                                            <div className="homepage_sections_head">
                                                <h2 className="homepage_section_heading">
                                                    <FormattedMessage
                                                        id={'rewardPoint.rewardinformation'}
                                                        defaultMessage={'Reward Information'}
                                                    />
                                                </h2>
                                            </div>
                                            <div className="card">
                                                <div className="card-header">
                                                    <FormattedMessage
                                                        id={'rewardPoint.currentexchangerates'}
                                                        defaultMessage={'Current Exchange Rates'}
                                                    />
                                                </div>
                                                <div className="card-body">
                                                    <p className="card-text">
                                                        {rewardPointData && rewardPointData.current_exchange_rates && rewardPointData.current_exchange_rates.earning_rate}
                                                    </p>
                                                    <p className="card-text">
                                                        {rewardPointData && rewardPointData.current_exchange_rates && rewardPointData.current_exchange_rates.spending_rate}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={defaultClasses.table_section + " " + "col-lg-12"}>
                                            <div className="homepage_sections_head">
                                                <h2 className="homepage_section_heading">
                                                    <FormattedMessage
                                                        id={'rewardPoint.recenttransactions'}
                                                        defaultMessage={'Recent Transactions'}
                                                    />
                                                </h2>
                                                {/* <button>View all</button> */}
                                            </div>
                                            <div
                                                className={
                                                    TableClasses.block + " " + TableClasses.block_dashboard_orders
                                                }
                                            >
                                                <div className={TableClasses.recent_order_list}>
                                                    <div
                                                        className={
                                                            TableClasses.table_wrapper +
                                                            " " +
                                                            TableClasses.orders_recent
                                                        }
                                                    >
                                                        <div className={TableClasses.table_wrapper_inner + ' ' + TableClasses.trt_table + ' ' + TableClasses.rma_points_header}>
                                                            <ul className={TableClasses.table_wrapper_head}>
                                                                <li className={TableClasses.item + " " + TableClasses.head_item}>Order Ids #</li>
                                                                <li className={TableClasses.item + " " + TableClasses.head_item}>Date</li>
                                                                <li className={TableClasses.item + " " + TableClasses.head_item}>Comment</li>
                                                                <li className={TableClasses.item + " " + TableClasses.head_item}>Amount</li>
                                                                <li className={TableClasses.item + " " + TableClasses.head_item}>Status</li>
                                                                {/* <li className={TableClasses.item + " " + TableClasses.head_item}>Expire Date</li> */}
                                                            </ul>
                                                            {!rewardPointData?.transactions?.total_count == 0 && <>
                                                                <div className={TableClasses.table_wrapper_body}>
                                                                    {rewardTransationData}
                                                                </div>
                                                                <div className='mt-2'>
                                                                    {next &&
                                                                        rewardTransationData != undefined &&
                                                                        rewardPointData.transactions.items.length &&
                                                                        next < rewardPointData.transactions.items.length &&
                                                                        < Button
                                                                            type="submit"
                                                                            priority="high"
                                                                            onClick={handleMoreTransaction}
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
                                                            </>}
                                                            {rewardPointData && rewardPointData.transactions.total_count == 0 && (
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
                                                                                'rewardPoint.notransaction'
                                                                            }
                                                                            defaultMessage={
                                                                                'You have no Transction.'
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
                                        {/* <div className={"col-lg-8" + " " + defaultClasses.rewardPoint_email}>
                                            <div className="homepage_sections_head">
                                                <h2 className="homepage_section_heading">
                                                    <FormattedMessage
                                                        id={'rewardPoint.emailnotification'}
                                                        defaultMessage={'Email Notification'}
                                                    />
                                                </h2>
                                            </div>
                                            <Form>
                                                <div className={defaultClasses.subscribe}>
                                                    <Checkbox
                                                        id="subscribe_balance"
                                                        field="subscribe_balance"
                                                        isDisplayOwnLabel={true}
                                                        onClick={() => setExpireSubscribe(!expireSubscribe)}
                                                        validate={value => isRequired(value, 'Subscribe Balance')}
                                                        label={<span>
                                                            <FormattedMessage
                                                                id={'rewardPoint.emailnotificationbalanceupdate'}
                                                                defaultMessage={'Subscribe to balance update'}
                                                            />
                                                        </span>}
                                                    />
                                                    <Checkbox
                                                        id="subscribe_notification"
                                                        field="subscribe_notification"
                                                        isDisplayOwnLabel={true}
                                                        onClick={() => setUpdateSubscribe(!updateSubscribe)}
                                                        validate={value => isRequired(value, 'Subscribe Notification')}
                                                        label={
                                                            <span>
                                                                <FormattedMessage
                                                                    id={'rewardPoint.expirationnotification'}
                                                                    defaultMessage={'Subscribe to points expiration notification'}
                                                                />
                                                            </span>
                                                        }
                                                    />
                                                </div>
                                                <div
                                                    className={
                                                        defaultClasses.product_ratingform_submit + " " + "my-4"
                                                    }
                                                >
                                                    <Button
                                                        priority="high"
                                                        type="submit"
                                                        onClick={handleSubmit}
                                                    >
                                                        <FormattedMessage
                                                            id={'rewardPoint.submit'}
                                                            defaultMessage={'Save'}
                                                        />
                                                    </Button>
                                                </div>
                                            </Form>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
}