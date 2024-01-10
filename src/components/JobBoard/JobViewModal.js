import React from 'react'
import cedClasses from '../ProductFullDetail/productFullDetail.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Icon from '../Icon';
import { X as ClearIcon } from 'react-feather';
import jobBorad from './jobBorad.css';

export const clearIcon = <Icon src={ClearIcon} size={30} />;

export const JobViewModal = (props) => {
    const { avialableJobsList } = props

    const classes = mergeClasses(cedClasses, props.classes)

    const { jobview, handleClose } = props
    return (
        <section className={jobBorad.jobViewModal}>
            <div className={jobview ? classes.add_gift_form + "  " + "modal fade show" + " " + jobBorad.jobBoradActiveModal : null}
                id="jobBoard" data-backdrop="static"
                data-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel"
                aria-hidden="true">
                <div className={classes.overlay} />
                <div className={jobBorad.are_sure_modal + ' ' + 'modal-dialog modal-dialog-centered'}>
                    <div className={classes.modal_content + ' ' + 'modal-content'}>
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">Job Details
                            </h5>
                            <div className={'text-right'}>
                                <button type='submit' data-dismiss="modal" onClick={handleClose}>{clearIcon}</button>
                            </div>
                        </div>
                        <div className={jobBorad.modal_body + " " + "modal-body"}>
                            {avialableJobsList &&
                                avialableJobsList.map((jobsDetails) => {
                                    return <div className="row">
                                        <div className="col-lg-6">
                                            <div className="card">
                                                <div className="card-header">Description</div>
                                                <div className="card-body">
                                                    <blockquote className="blockquote mb-0">
                                                        <p>{jobsDetails.description}</p>
                                                    </blockquote>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="card">
                                                <div className="card-header">Eligibility</div>
                                                <div className="card-body">
                                                    <blockquote className="blockquote mb-0">
                                                        <p>{jobsDetails.eligibility}</p>
                                                    </blockquote>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="card">
                                                <div className="card-header">Skills Required</div>
                                                <div className="card-body">
                                                    <blockquote className="blockquote mb-0">
                                                        <p>{jobsDetails.skills}</p>
                                                    </blockquote>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6">

                                            <div className="card">
                                                <div className="card-header">Location</div>
                                                <div className="card-body">
                                                    <blockquote className="blockquote mb-0">
                                                        <p>{jobsDetails.location}</p>
                                                    </blockquote>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
