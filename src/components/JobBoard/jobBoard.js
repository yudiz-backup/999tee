import { Title } from '../Head'
import React, { useState, useEffect, useContext } from 'react'
import jobBorad from './jobBorad.css';
import TableClasses from '../MyAccount/myAccount.css';
import defaultClasses from '../RewardPoint/rewardPoint.css';
import Button from '@magento/venia-ui/lib/components/Button';
import { JobBoardModal } from './JobBoardModal';
import { JobStatusModal } from './JobStatusModal';
import { JobViewModal } from './JobViewModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRupeeSign, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { FormattedMessage } from 'react-intl';
import jobCategoriesList from '../../queries/jobBoard/jobCategoriesList.graphql'
import avialableJobs from '../../queries/jobBoard/avialableJobs.graphql'
import applyJob from '../../queries/jobBoard/applyJob.graphql'
import GET_CMSBLOCK_QUERY from '../../queries/getCmsBlocks.graphql';
import uniqueIdForApplyJob from '../../queries/jobBoard/uniqueIdForApplyJob.graphql'
import GET_HOMEPAGECONFIG_DATA from '../../queries/getHomeConfig.graphql';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { useDashboard } from '../../peregrine/lib/talons/MyAccount/useDashboard';
import { salaryType, experienceObj } from '../../util/customData';
import LoadingIndicator from '../LoadingIndicator';
import { useFooterData, useHome } from '../../peregrine/lib/talons/Home/useHome';
import RichContent from '../RichContent/richContent';
import { globalContext } from '../../peregrine/lib/context/global';

export default function JobBoard() {
    const [isSelected, setIsSelected] = useState()
    const [isOpen, setIsOpen] = useState(false);
    const [jobStatus, setJobStatus] = useState(false);
    const [jobview, setJobView] = useState(false);
    const [avialableJobsList, setAvialableJobsList] = useState([])
    const [empData, SetEmpData] = useState()
    const [applyJobEmp, setApplyJobEmp] = useState()
    const [uniqueIdInfo, setUniqueIdInfo] = useState()
    const [uniqueIdValue, setUniqueIdValue] = useState()
    const [resumeValidation, setResumeValidation] = useState(false)
    const [errorMsg, setErrorMsg] = useState(false);
    const [base64, setBase64] = useState({
        file: "",
        url: ""
    })

    const { dispatch } = useContext(globalContext);
    const { email, firstname, lastname } = useDashboard();

    const { data: categoriesList, loading: listLoading } = useQuery(jobCategoriesList)
    const categoriesListData = categoriesList && categoriesList.jobcategories

    const [avialableJobsData, { loading }] = useLazyQuery(avialableJobs, {
        onCompleted: (data) => {
            setAvialableJobsList(data)
        }
    })

    const [applyJobInfo, { error }] = useMutation(applyJob, {
        onCompleted: (data) => {
            if (data) {
                setApplyJobEmp(data)
                setBase64()
                SetEmpData()
            }
        }
    })

    const [checkJobStatus, { error: jobStautsError }] = useLazyQuery(uniqueIdForApplyJob, {
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            if (data) {
                setUniqueIdInfo(data)
            }
        }
    })

    useEffect(() => {
        if (isSelected) {
            avialableJobsData({
                variables: {
                    categoryName: isSelected.name.toString()
                }
            })

        }
    }, [isSelected])

    const filecontent = base64 && base64.url
    const avialableJobsDesignation = avialableJobsList && avialableJobsList.jobs &&
        avialableJobsList.jobs.map((designation) =>
            designation.designation)

    const createPost = async () => {
        try {
            await applyJobInfo({
                variables: {
                    name: empData.firstname || firstname,
                    filecontent: filecontent,
                    address: empData.address,
                    qualification: empData.qualification,
                    firstname: empData?.firstname?.charAt(0)?.toUpperCase() + empData?.firstname?.slice(1) || firstname?.charAt(0)?.toUpperCase() + firstname?.slice(1),
                    lastname: empData?.lastname?.charAt(0)?.toUpperCase() + empData?.lastname?.slice(1) || lastname?.charAt(0)?.toUpperCase() + lastname?.slice(1),
                    email: empData.email || email,
                    experience: empData.experience,
                    position: empData.current_position ? empData.current_position : "",
                    company: empData.current_company ? empData.current_company : "",
                    positionForApply: empData.position || avialableJobsDesignation[0],
                }
            })
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleSubmit = () => {
        if (empData && filecontent) {
            setIsOpen(false)
            setBase64()
            createPost()
            setResumeValidation(false)
        }
        if (!filecontent) {
            setResumeValidation(true)
        }
        dispatch({ type: "SCROLL_DISABLE", payload: { scrollDisable: false } })
    }

    const handleApplyClose = () => {
        setIsOpen(false)
        setBase64()
        setResumeValidation(false)
        setErrorMsg(false)
        dispatch({ type: "SCROLL_DISABLE", payload: { scrollDisable: false } })
    }

    const handleJSClose = () => {
        setJobStatus(false)
        setUniqueIdValue()
        setUniqueIdInfo()
        setErrorMsg(false)
        dispatch({ type: "SCROLL_DISABLE", payload: { scrollDisable: false } })
    }
    const handleViewClose = () => {
        setJobView(false)
        setErrorMsg(false)
        dispatch({ type: "SCROLL_DISABLE", payload: { scrollDisable: false } })
    }

    const handleCheckJobStatus = () => {
        checkJobStatus({
            variables: {
                uniqueId: uniqueIdValue.toString()
            }
        })
        setJobStatus(false)
        setUniqueIdValue()
        setUniqueIdInfo()
        dispatch({ type: "SCROLL_DISABLE", payload: { scrollDisable: false } })
    }

    // const handleViewShow = () => {
    //     setJobView(true)
    //     setApplyJobEmp()
    // };
    const handleJSShow = () => {
        setJobStatus(true)
        setUniqueIdInfo()
        setApplyJobEmp()
        dispatch({ type: "SCROLL_DISABLE", payload: { scrollDisable: true } })
    };
    const handleShow = () => {
        setIsOpen(true)
        setApplyJobEmp()
        dispatch({ type: "SCROLL_DISABLE", payload: { scrollDisable: true } })
    };

    useEffect(() => {
        if (categoriesListData && categoriesListData.length) {
            setIsSelected(categoriesListData[0])
        }
    }, [categoriesListData])

    const homepageData = useHome({
        query: GET_HOMEPAGECONFIG_DATA
    });

    const { HomeConfigData } = homepageData;

    let currentOpeningIdentifier = 'career-top-section';
    if (typeof HomeConfigData != 'undefined') {
        for (var i = 0; i < HomeConfigData.length; i++) {
            if (HomeConfigData[i]['name'] == 'career-top-section')
                currentOpeningIdentifier = HomeConfigData[i]['value'];
        }
    }

    const currentOpeningInfo = useFooterData({
        footerQuery: GET_CMSBLOCK_QUERY,
        footerIdentifiers: currentOpeningIdentifier
    });

    const { footerData: currentOpeningData } = currentOpeningInfo;

    return (
        <section className={defaultClasses.rewardPoint_page}>
            <RichContent html={currentOpeningData} />

            <div className="container-fluid">
                {!listLoading ? <div className="row">
                    <div className="col-lg-9 mx-auto">
                        {/* <Title>{`Current Openings`}</Title> */}

                        <div className={TableClasses.jobBorad_section}>
                            <div>
                                {!loading && <div className={TableClasses.page_title_wrapper + ' ' + jobBorad.rma_title_wrapper}>
                                    {/* <h1 className={TableClasses.page_title}>
                                        <span className={TableClasses.base}>
                                            <FormattedMessage
                                                id={'sidebar.jobboard'}
                                                defaultMessage={'Current Openings'}
                                            />
                                        </span>
                                    </h1> */}
                                    <p className={jobBorad.status_btn}>{error && error.message}</p>
                                    {jobStautsError &&
                                        jobStautsError.message &&
                                        <p className={jobBorad.status_btn}>Please enter valid Application ID</p>}

                                    {applyJobEmp &&
                                        applyJobEmp.applyJob &&
                                        applyJobEmp.applyJob.uniqueId && <p className={jobBorad.succes_status_btn}>Application applied successfully. Your Unique id is <span className={jobBorad.status_btn}>{applyJobEmp &&
                                            applyJobEmp.applyJob &&
                                            applyJobEmp.applyJob.uniqueId}.
                                        </span> Please note and by this you can check your job status.
                                        </p>}
                                    {uniqueIdInfo &&
                                        uniqueIdInfo.jobStatusByUid &&
                                        uniqueIdInfo.jobStatusByUid.job_status && <p className={jobBorad.succes_status_btn}>Your application is "{uniqueIdInfo &&
                                            uniqueIdInfo.jobStatusByUid &&
                                            uniqueIdInfo.jobStatusByUid.job_status}". </p>}
                                </div>}
                                {!loading ? <div className={jobBorad.jobTab + ' ' + 'row'}>
                                    <div className="col-md-3 ">
                                        <ul className={defaultClasses.job_tabe + ' ' + 'nav flex-column nav-tabs'} id="myTab" role="tablist">
                                            {categoriesListData &&
                                                categoriesListData.map((categoriesName, index) =>
                                                    <li className="nav-item" role="presentation">
                                                        <button
                                                            className={isSelected && +isSelected.entity_id === +categoriesName.entity_id ? "nav-link active" : "nav-link"}
                                                            key={index}
                                                            onClick={() => setIsSelected(categoriesName)}
                                                        >
                                                            {categoriesName.name}
                                                        </button>
                                                    </li>
                                                )}
                                        </ul>
                                    </div>
                                    <div className="col-md-9 ">
                                        <div className={jobBorad.career_portal}>
                                            <div className={jobBorad.jobTabContent + " " + "tab-content"} id="myTabContent">
                                                <div className="tab-pane fade show active" id="human" role="tabpanel" aria-labelledby="human-tab">
                                                    {/* <div className="row">
                                                    <div className="col-lg-6"> */}
                                                    <div className={jobBorad.cart}>
                                                        {avialableJobsList &&
                                                            avialableJobsList.jobs &&
                                                            avialableJobsList.jobs.map((jobsData) => {
                                                                return <>
                                                                    <div className={jobBorad.job_cart}>
                                                                        <ul className="list-group list-group-flush">
                                                                            <li className="list-group-item"><h2>Designation: {jobsData.designation}</h2></li>
                                                                            <li className="list-group-item">
                                                                                <ul className={jobBorad.job_req}>
                                                                                    <li className="list-group-item"><span><FontAwesomeIcon icon={faBriefcase} /></span>{jobsData.experience ? jobsData.experience : "-"}</li>
                                                                                    <li className="list-group-item"><span><FontAwesomeIcon icon={faRupeeSign} /></span>{jobsData.salary} {salaryType[jobsData.salary_type]}</li>
                                                                                    <li className="list-group-item"><img src="/cenia-static/icons/location-dot-solid.svg" alt="no items" width="12" height="16" />{jobsData.location}</li>
                                                                                </ul>
                                                                            </li>
                                                                            <li className="list-group-item">
                                                                                {/* <span className='fw-bold'>Responsibilities: </span> */}
                                                                                <div dangerouslySetInnerHTML={{
                                                                                    __html: jobsData.description
                                                                                }} />
                                                                                {/* {jobsData.description} */}
                                                                            </li>
                                                                            <li className="list-group-item"><span className='fw-bold'>Skills: </span>{jobsData.skills}</li>
                                                                            <li className="list-group-item">
                                                                                <Button type="button" priority="high" onClick={handleShow} data-toggle="modal" data-target="#jobBoard">Apply For Job</Button>
                                                                            </li>
                                                                        </ul>
                                                                        <p className={jobBorad.job_status_txt}>If you have already applied. Check your <button className={jobBorad.status_btn} onClick={handleJSShow}> Job Status</button></p>
                                                                    </div>
                                                                </>
                                                            })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div> : <div className={jobBorad.sppiner}>
                                    <LoadingIndicator />
                                </div>}
                                {isOpen && <JobBoardModal
                                    isOpen={isOpen}
                                    handleSubmit={handleSubmit}
                                    empData={empData}
                                    SetEmpData={SetEmpData}
                                    handleApplyClose={handleApplyClose}
                                    base64={base64}
                                    setBase64={setBase64}
                                    createPost={createPost}
                                    avialableJobsList={avialableJobsList && avialableJobsList.jobs}
                                    email={email}
                                    firstname={firstname}
                                    lastname={lastname}
                                    experienceObj={experienceObj}
                                    resumeValidation={resumeValidation}
                                    setErrorMsg={setErrorMsg}
                                    errorMsg={errorMsg}
                                />
                                }

                                {jobStatus && <JobStatusModal
                                    jobStatus={jobStatus}
                                    handleClose={handleJSClose}
                                    handleCheckJobStatus={handleCheckJobStatus}
                                    setUniqueIdValue={setUniqueIdValue}
                                />
                                }
                                {jobview && <JobViewModal
                                    jobview={jobview}
                                    handleClose={handleViewClose}
                                    avialableJobsList={avialableJobsList && avialableJobsList.jobs}
                                />
                                }
                            </div>
                        </div>
                    </div>
                </div> :
                    <div className={jobBorad.sppiner}>
                        <LoadingIndicator />
                    </div>}
            </div>
            {/* editAddress */}
        </section >
    )
}
