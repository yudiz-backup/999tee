import React from 'react'
import cedClasses from '../ProductFullDetail/productFullDetail.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Button from '../Button';
import Icon from '../Icon';
import { X as ClearIcon } from 'react-feather';
import Field from '../Field';
import { Form } from 'informed';
import TextInput from '../TextInput/textInput';
import jobBorad from './jobBorad.css';
import combine from '../../util/combineValidators';
import { isRequired, validateEmail } from '../../util/formValidators';

export const clearIcon = <Icon src={ClearIcon} size={20} />;

export const JobStatusModal = (props) => {
    const classes = mergeClasses(cedClasses, props.classes)

    const { jobStatus,
        handleClose,
        handleCheckJobStatus,
        setUniqueIdValue } = props

    const handleChange = (e) => {
        setUniqueIdValue(e.target.value)
    }

    return (
        <section className={jobBorad.jobStatusModal}>
            <div className={jobStatus ? classes.add_gift_form + "  " + "modal fade show" + " " + jobBorad.jobBoradActiveModal : null}
                id="jobBoard" data-backdrop="static"
                data-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel"
                aria-hidden="true">
                <div className={classes.overlay} />
                <div className={jobBorad.are_sure_modal + ' ' + 'modal-dialog modal-dialog-centered'}>
                    <div className={classes.modal_content + ' ' + 'modal-content'}>
                        <div className={jobBorad.header_status + ' ' + 'modal-header'}>
                            <h4 className="modal-title" id="staticBackdropLabel">Check your applied job status
                            </h4>
                            <div className={'text-right'}>
                                <button type='reset' data-dismiss="modal" onClick={handleClose}>{clearIcon}</button>
                            </div>
                        </div>
                        <div className={jobBorad.modal_body + " " + "modal-body"}>
                            <Form onSubmit={handleCheckJobStatus}>
                                <div className={classes.add_review_wrapper}>
                                    <Field label="Application Id*">
                                        <TextInput
                                            field="applicationId"
                                            onChange={handleChange}
                                            validate={(value) => isRequired(value, 'Application Id')}
                                        />
                                    </Field>
                                </div>
                                <div className={classes.add_review_wrapper}>
                                    <Field label="Email*">
                                        <TextInput
                                            field="email"
                                            validate={combine([
                                                (value) => isRequired(value, 'Email'),
                                                validateEmail
                                            ])} />
                                    </Field>
                                </div>
                                <div className={classes.sure_footer + ' ' + 'modal-footer pl-0'} >
                                    <Button priority="high" type="submit"> Check</Button>
                                </div>
                            </Form>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}
