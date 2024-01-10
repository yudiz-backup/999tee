import React, { useState } from 'react'
import { Title } from '../Head';
import { Link } from 'src/drivers';
import defaultClasses from '../RewardPoint/rewardPoint.css';
import TableClasses from '../MyAccount/myAccount.css';
import Sidebar from './sidebar';
import { FormattedMessage } from 'react-intl';
import creditBalanceInfo from '../../queries/creditAmount/creditBalanceInfo.graphql'
import { useQuery } from '@apollo/client';
import { Price } from '@magento/peregrine';
import { monthsForChart } from '../../util/customData';
import Button from '../Button';
import searchClasses from '../SearchPage/searchPage.css';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMobile } from '../../peregrine/lib/talons/Mobile/useMobile';

const transactionPerRow = 5;

export default function CreditInformation(props) {
    const [next, setNext] = useState(transactionPerRow);
    const { mobileView } = useMobile();

    const { data: creditBalance } = useQuery(creditBalanceInfo, {
        fetchPolicy: 'no-cache'
    })

    const handleBalanceHistory = () => {
        setNext(next + transactionPerRow);
    };


    const newArray = creditBalance && [...creditBalance.customer.storecredit_history_credit]

    const creditBalanceHistoryInfo = newArray?.sort((a, b) =>
        b?.history_id - a?.history_id)?.slice(0, next)?.map(info => {
            const date = new Date(info.created_time);
            const dateSplit = info?.created_time.split(" ")
            const dateMDY = date ? `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}-${monthsForChart[date?.getMonth() + 1]}-${date.getFullYear()}` : "Not available";
            return <ul className={TableClasses.orders_row}>
                <li mobilelabel='ID :' className={TableClasses.item + " " + TableClasses.body_item}>{info?.history_id}</li>
                <li mobilelabel='Action :' className={TableClasses.item + " " + TableClasses.body_item}> {info?.type}</li>
                <li mobilelabel='Balance Change :' className={TableClasses.item + " " + TableClasses.body_item}>
                    <Price
                        value={info?.change_amount}
                        currencyCode={"INR"}
                    />
                </li>
                <li mobilelabel='Balance :' className={TableClasses.item + " " + TableClasses.body_item}>
                    <Price
                        value={info?.balance_amount}
                        currencyCode={"INR"}
                    />
                </li>
                <li mobilelabel='Date :' className={TableClasses.item + " " + TableClasses.body_item}>{mobileView ? dateSplit?.[0] : dateMDY}</li>
                <li mobilelabel='Addtinal Info :' className={TableClasses.item + " " + TableClasses.body_item}>
                    <Link to={info?.creditmemo_id !== 0 && info?.order_id ? `/refunds/${info?.order_id}` : info?.creditmemo_id === 0 && info?.order_id ? `/orderview/${info?.order_id}` : "-"}>
                        {info?.creditmemo_id !== 0 && info?.order_id ? `Credit Memo #${info?.creditmemo_id}` : info?.creditmemo_id === 0 && info?.order_id ? `Order #${info?.order_id}` : "-"}
                    </Link>
                </li>
            </ul>
        })

    return (
        <section className={defaultClasses.rewardPoint_page}>
            <Title>{`My Store Credit`}</Title>
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
                                                    id={'storecrdeit.title'}
                                                    defaultMessage={'Store Credit Information'}
                                                />
                                            </span>
                                        </h1>
                                    </div>
                                    <div className={TableClasses.store_wrap}>
                                        <h4 style={{ textTransform: 'uppercase' }}>
                                            <FormattedMessage
                                                id={'storecrdeit.balanceinformation'}
                                                defaultMessage={'Current Balance'}
                                            />
                                        </h4>
                                        <h6 className='text-left pt-3 pb-3'>
                                            <FormattedMessage
                                                id={'storecrdeit.balance'}
                                                defaultMessage={'Your Balance is'}
                                            /> : <Price
                                                value={creditBalance ? creditBalance?.customer?.storecredit_credit?.balance_amount : 0}
                                                currencyCode={"INR"}
                                            />
                                        </h6>
                                    </div>
                                    <h4 style={{ textTransform: 'uppercase' }}>
                                        <FormattedMessage
                                            id={'storecrdeit.balancehistory'}
                                            defaultMessage={'Balance History'}
                                        />
                                    </h4>
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
                                                <div className={TableClasses.table_wrapper_inner + ' ' + TableClasses.trt_table}>
                                                    <ul className={TableClasses.table_wrapper_head}>
                                                        <li className={TableClasses.item + " " + TableClasses.head_item}>ID</li>
                                                        <li className={TableClasses.item + " " + TableClasses.head_item}>Action</li>
                                                        <li className={TableClasses.item + " " + TableClasses.head_item}>Balance Change</li>
                                                        <li className={TableClasses.item + " " + TableClasses.head_item}>Balance</li>
                                                        <li className={TableClasses.item + " " + TableClasses.head_item}>Date</li>
                                                        <li className={TableClasses.item + " " + TableClasses.head_item}>Additinal Info</li>
                                                    </ul>
                                                    <div className={TableClasses.table_wrapper_body}>
                                                        {creditBalanceHistoryInfo}
                                                    </div>
                                                    <div className='mt-2'>
                                                        {next &&
                                                            next <= creditBalance?.customer?.storecredit_history_credit?.length &&
                                                            <Button
                                                                type="submit"
                                                                priority="high"
                                                                onClick={handleBalanceHistory}
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
                                                {creditBalance?.customer?.storecredit_history_credit?.length === 0 && <div
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
                                                                'storecrdeit.nohistory'
                                                            }
                                                            defaultMessage={
                                                                'You have no Balance History.'
                                                            }
                                                        />
                                                    </span>
                                                </div>}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    )
}
