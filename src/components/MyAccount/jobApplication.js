
import React, { useState } from 'react'
import { Title } from '../Head'
import jobBorad from '../JobBoard/jobBorad.css';
import Sidebar from './sidebar'
import TableClasses from './myAccount.css';
import defaultClasses from '../RewardPoint/rewardPoint.css';
import applicationDetails from '../../queries/jobBoard/applicationDetails.graphql'
import { useQuery } from '@apollo/client';
import Button from '../Button';
import { FormattedMessage } from 'react-intl';
import searchClasses from '../SearchPage/searchPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { monthsForChart } from '../../util/customData';
import { useMobile } from '../../peregrine/lib/talons/Mobile/useMobile';
import MyOrderSkelton from './MyOrderSkeleton';

const jobApplicationPerRow = 10;
const jobApplicationPerRowMobile = 5;


export default function JobBoard(props) {
    const { mobileView } = useMobile();
    const [next, setNext] = useState(mobileView ? jobApplicationPerRowMobile : jobApplicationPerRow);

    const { data: appliedJobs, loading } = useQuery(applicationDetails, {
        fetchPolicy: 'no-cache'
    })

    const handleMoreTransaction = () => {
        if (mobileView) {
            setNext(next + jobApplicationPerRowMobile);
        } else {
            setNext(next + jobApplicationPerRow);
        }
    };

    const applicationData = appliedJobs?.application?.slice(0, next)?.sort((a, b) => b?.id - a?.id)?.map(applications => {
        const date = applications && new Date(applications.created_at);
        const dateSplit = applications?.created_at.split(" ")
        const dateMDY = date ? `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}-${monthsForChart[date.getMonth() + 1]}-${date.getFullYear()}` : "Not available";
        return <ul className={TableClasses.orders_row + ' ' + TableClasses.rma_table}>
            <li mobilelabel='Job Id #' className={TableClasses.item + " " + TableClasses.body_item}>{applications.id}</li>
            <li mobilelabel='Date :' className={TableClasses.item + " " + TableClasses.body_item}>{mobileView ? dateSplit?.[0] : dateMDY}</li>
            <li mobilelabel='Category Name :' className={TableClasses.item + " " + TableClasses.body_item}>{applications.category_name}</li>
            <li mobilelabel='Email :' className={TableClasses.item + " " + TableClasses.body_item}>{applications.email}</li>
            <li mobilelabel='Position :' className={TableClasses.item + " " + TableClasses.body_item}>{applications.job}</li>
            <li mobilelabel='Application Id :' className={TableClasses.item + " " + TableClasses.body_item}>{applications.application_id}</li>
            <li mobilelabel='Job Status :' className={TableClasses.item + " " + TableClasses.body_item + " " + TableClasses.job_last_child}>{applications.job_status_applicant}</li>
        </ul>
    })

    return (
        <section className={defaultClasses.rewardPoint_page}>
            <Title>{`Job Application`}</Title>
            <div className={TableClasses.columns}>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className={TableClasses.column + ' ' + TableClasses.main} >
                                <div className={TableClasses.account_sideBar}>
                                    <Sidebar history={props.history} />
                                </div>
                                <div className={TableClasses.account_contentBar}>
                                    <div className={TableClasses.page_title_wrapper + ' ' + jobBorad.rma_title_wrapper}>
                                        <h1 className={TableClasses.page_title}>
                                            <span className={TableClasses.base}>Applied Jobs</span>
                                        </h1>
                                    </div>
                                    {!loading && appliedJobs?.application?.length !== 0 ? <div className={defaultClasses.table_section}>
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
                                                    <div className={TableClasses.table_wrapper_inner + ' ' + TableClasses.job_table_wrapper}>
                                                        <ul className={TableClasses.table_wrapper_head + ' ' + TableClasses.rma_table}>
                                                            <li className={TableClasses.item + " " + TableClasses.head_item}>job Id #</li>
                                                            <li className={TableClasses.item + " " + TableClasses.head_item}>Date</li>
                                                            <li className={TableClasses.item + " " + TableClasses.head_item}>Category Name</li>
                                                            <li className={TableClasses.item + " " + TableClasses.head_item}>Email</li>
                                                            <li className={TableClasses.item + " " + TableClasses.head_item}>Position</li>
                                                            <li className={TableClasses.item + " " + TableClasses.head_item}>Application Id</li>
                                                            <li className={TableClasses.item + " " + TableClasses.head_item}>Job Status</li>
                                                        </ul>
                                                        <div className={TableClasses.table_wrapper_body}>
                                                            {applicationData}
                                                        </div>
                                                        <div className='mt-2'>
                                                            {next &&
                                                                appliedJobs != undefined &&
                                                                next < appliedJobs?.application?.length &&
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
                                                                            'Load More'
                                                                        }
                                                                    />
                                                                </Button>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div> : !loading ? <div className={searchClasses.noResult}>
                                        <span className={searchClasses.noResult_icon}>
                                            <FontAwesomeIcon icon={faExclamationTriangle} />
                                        </span>
                                        <span className={'ml-2' + ' ' + searchClasses.noResult_text}>
                                            <FormattedMessage
                                                id={'jobApplication.noResult_text'}
                                                defaultMessage={'There are no applications.'}
                                            />
                                        </span>
                                    </div> :
                                        <MyOrderSkelton />
                                    }


                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </section >
    )
}
