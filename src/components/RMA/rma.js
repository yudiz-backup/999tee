import { Title } from '../Head';
import React, { useState, useEffect } from 'react'
import { Link } from 'src/drivers';
import Sidebar from '../MyAccount/sidebar';
import TableClasses from '../MyAccount/myAccount.css';
import defaultClasses from '../RewardPoint/rewardPoint.css';
import Button from '../Button';
import { FormattedMessage } from 'react-intl';
import { useMutation, useQuery } from '@apollo/client';
import getRmaCustomerDetails from '../../queries/RMA/getRmaCustomerDetails.graphql'
import { useDashboard } from '../../peregrine/lib/talons/MyAccount/useDashboard';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { Redirect, useHistory } from '../../drivers';
import rmaCancleRequest from '../../queries/RMA/rmaCancleRequest.graphql'
import { useToasts } from '@magento/peregrine';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import searchClasses from '../SearchPage/searchPage.css';
import { monthsForChart, statusObj } from '../../util/customData';
import { Eye as EyeIcon } from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { useMobile } from '../../peregrine/lib/talons/Mobile/useMobile';

const eyeIcon = <Icon src={EyeIcon} size={20} />;

const rmaItemsPerRow = 10;
const rmaItemsPerRowMobile = 5

export default function Rma(props) {
    const { mobileView } = useMobile();
    const [next, setNext] = useState(mobileView ? rmaItemsPerRowMobile : rmaItemsPerRow);
    const [cancelId, setCancelId] = useState()
    const [isConfirm, setIsConfirm] = useState(false)
    const talonProps = useDashboard();
    const [{ isSignedIn }] = useUserContext();
    const [, { addToast }] = useToasts();
    const history = useHistory();

    const [rmaCancleItem, { data: confirmData, error }] = useMutation(rmaCancleRequest)

    useEffect(() => {
        if (!isSignedIn) {
            history.push('/')
        }
    }, [isSignedIn])


    useEffect(() => {
        if (confirmData && confirmData.mpRMARequestCancel) {
            refetch({
                fetchPolicy: "no-cache",
                email: email,
            })
        }
    }, [confirmData])

    useEffect(() => {
        if (isConfirm) {
            rmaCancleItem({
                variables: {
                    id: +cancelId
                }
            });
            setIsConfirm(false)
        }
    }, [isConfirm])

    const handleMoreTransaction = () => {
        if (mobileView) {
            setNext(next + rmaItemsPerRowMobile);
        } else {
            setNext(next + rmaItemsPerRow);
        }
    };

    useEffect(() => {
        if (
            confirmData && confirmData.mpRMARequestCancel
        ) {
            addToast({
                type: 'info',
                message: "Your request is canceled",
                dismissable: true,
                timeout: 5000
            });
        }
    }, [
        addToast, error, confirmData
    ]);

    const { email } = talonProps

    const { data, refetch, loading } = useQuery(getRmaCustomerDetails, {
        fetchPolicy: "no-cache",
        email: email
    })

    if (!isSignedIn) {
        return <Redirect to="/" />;
    }

    const rmaDetails = data && data.customer && data.customer.mp_rma

    return (
        <section className={defaultClasses.rewardPoint_page + ' ' + defaultClasses.ramtable_page}>
            <Title>{`Return and Refund`}</Title>
            <div className={TableClasses.columns}>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className={TableClasses.column + ' ' + TableClasses.main} >
                                <div className={TableClasses.account_sideBar}>
                                    <Sidebar history={props.history} />
                                </div>
                                <div className={TableClasses.account_contentBar}>
                                    <div className={TableClasses.page_title_wrapper + ' ' + defaultClasses.rma_title_wrapper}>
                                        <h1 className={TableClasses.page_title}>
                                            <span className={TableClasses.base}>
                                                <FormattedMessage
                                                    id={'sidebar.RAM'}
                                                    defaultMessage={'Return and Refund'}
                                                />
                                            </span>
                                        </h1>
                                        <Button type="submit" priority="high">
                                            <Link to={{
                                                pathname:
                                                    '/mprma/customer/add-new-rma-request'

                                            }}>
                                                <FormattedMessage
                                                    id={'rma.addnewrequest'}
                                                    defaultMessage={'Add New RMA Request'}
                                                />
                                            </Link>
                                        </Button>
                                    </div>
                                    <div className="row">
                                        <div className={defaultClasses.table_section + " " + "col-lg-12"}>
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
                                                        {data &&
                                                            rmaDetails &&
                                                            rmaDetails &&
                                                            rmaDetails.total_count !== 0 &&
                                                            rmaDetails.items ?
                                                            <div className={TableClasses.table_wrapper_inner + ' ' + TableClasses.myOrder_table_wrapper}>
                                                                <ul className={TableClasses.table_wrapper_head}>
                                                                    <li className={TableClasses.item + " " + TableClasses.head_item}>Request ID</li>
                                                                    <li className={TableClasses.item + " " + TableClasses.head_item}>Order Increment ID</li>
                                                                    <li className={TableClasses.item + " " + TableClasses.head_item}>Request Status</li>
                                                                    <li className={TableClasses.item + " " + TableClasses.head_item}>Created Date</li>
                                                                    <li className={TableClasses.item + " " + TableClasses.head_item}>Update Date</li>
                                                                    <li className={TableClasses.item + " " + TableClasses.head_item}>Action</li>
                                                                </ul>
                                                                <div className={TableClasses.table_wrapper_body}>
                                                                    {rmaDetails &&
                                                                        rmaDetails.items &&
                                                                        rmaDetails.items.sort().reverse() &&
                                                                        rmaDetails.items.sort().reverse().slice(0, next) &&
                                                                        rmaDetails.items.sort().reverse().slice(0, next).map((rmaItmeDetails) => {
                                                                            const date = new Date(rmaItmeDetails?.created_at);
                                                                            const dateSplit = rmaItmeDetails?.created_at.split(" ")
                                                                            const updated_date = rmaItmeDetails.updated_at && new Date(rmaItmeDetails.updated_at);
                                                                            const updatedDateSplit = rmaItmeDetails?.updated_at.split(" ")
                                                                            const dateMDY = date ? `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}-${monthsForChart[date?.getMonth() + 1]}-${date.getFullYear()}` : "Not available";
                                                                            const updateMDY = updated_date ? `${updated_date.getDate() + 1 < 10 ? `0${updated_date.getDate() + 1}` : updated_date.getDate()}-${monthsForChart[updated_date?.getMonth() + 1]}-${updated_date.getFullYear()}` : "Not available";
                                                                            return (
                                                                                <ul className={TableClasses.orders_row}>
                                                                                    <li mobilelabel='Request ID' className={TableClasses.item + " " + TableClasses.body_item}>{rmaItmeDetails.request_id}</li>
                                                                                    <li mobilelabel='Order Increment ID' className={TableClasses.item + " " + TableClasses.body_item}>{rmaItmeDetails.order_increment_id}</li>
                                                                                    <li mobilelabel='Request Status' className={TableClasses.item + " " + TableClasses.body_item}>{statusObj[rmaItmeDetails.status_id]}</li>
                                                                                    <li mobilelabel='Created Date' className={TableClasses.item + " " + TableClasses.body_item}>{mobileView ? dateSplit?.[0] : dateMDY}</li>
                                                                                    <li mobilelabel='Update Date' className={TableClasses.item + " " + TableClasses.body_item}>{mobileView ? updatedDateSplit?.[0] : updateMDY}</li>
                                                                                    <li mobilelabel="Action" className={TableClasses.item + ' ' + TableClasses.body_item}>

                                                                                        <Link className={TableClasses.body_item_link} to={{
                                                                                            pathname:
                                                                                                '/mprma/customer/' + rmaItmeDetails.request_id,
                                                                                            state: {
                                                                                                rmaDetails, statusObj
                                                                                            }
                                                                                        }}>
                                                                                            <Button priority='high'>
                                                                                                {eyeIcon}
                                                                                            </Button >
                                                                                        </Link >

                                                                                        {
                                                                                            rmaItmeDetails.status_id === 1 ||
                                                                                            rmaItmeDetails.is_canceled === 1 &&
                                                                                            <>
                                                                                                <span className="mx-2">|</span>
                                                                                                <button type="submit" data-toggle="modal" data-target="#rmacancel" onClick={() => setCancelId(rmaItmeDetails.request_id)} >
                                                                                                    <Button priority='high'>
                                                                                                        Cancel
                                                                                                    </Button>
                                                                                                </button>
                                                                                            </>
                                                                                        }
                                                                                    </li >

                                                                                </ul >)
                                                                        })}
                                                                </div >
                                                                <div className={defaultClasses.rma_items_status}>
                                                                    <div>
                                                                        <span>
                                                                            <strong> {rmaDetails && rmaDetails.total_count}</strong>
                                                                            {(rmaDetails && rmaDetails.total_count === 0 ||
                                                                                rmaDetails && rmaDetails.total_count === 1) ?
                                                                                " item" : " items"
                                                                            }
                                                                        </span>
                                                                        <div className='mt-2'>
                                                                            {next &&
                                                                                rmaDetails &&
                                                                                rmaDetails.items.sort().reverse() != undefined &&
                                                                                rmaDetails.items.length &&
                                                                                // rmaDetails.total_count < rmaDetails.items.length &&
                                                                                next < rmaDetails.items.length &&
                                                                                <Button
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
                                                                    </div>
                                                                </div>
                                                            </div >
                                                            :
                                                            <>
                                                                {<div className={searchClasses.noResult}>
                                                                    <span className={searchClasses.noResult_icon}>
                                                                        <FontAwesomeIcon icon={faExclamationTriangle} />
                                                                    </span>
                                                                    <span className={'ml-2' + ' ' + searchClasses.noResult_text}>
                                                                        <FormattedMessage
                                                                            id={'rma.noResult_text'}
                                                                            defaultMessage={'There are no RMA request.'}
                                                                        />
                                                                    </span>
                                                                </div>}
                                                            </>
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
                </div >
            </div >
            <div className={defaultClasses.rma_modal + ' ' + "modal fade"} id="rmacancel" tabindex="-1" aria-labelledby="rmacancelLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="rmacancelLabel">Do you want to cancel this request?</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                {/* <span aria-hidden="true">&times;</span> */}
                            </button>
                        </div>
                        <div className="modal-footer">
                            <Button type="submit" priority="high" data-dismiss="modal">Cancel</Button>
                            <Button
                                onClick={() => setIsConfirm(true)}
                                type="submit"
                                data-dismiss="modal"
                                priority="high">
                                Ok
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    )
}
