import React, { useState } from 'react'
import cedClasses from '../ProductFullDetail/productFullDetail.css';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Button from '../Button';
import Icon from '../Icon';
import { X as ClearIcon } from 'react-feather';
import TextArea from '@magento/venia-ui/lib/components/TextArea';
import Field from '../Field';
import { Form } from 'informed';
// import Select from '../Select/select';
import TextInput from '../TextInput/textInput';
import jobBorad from './jobBorad.css';
import { /* checkOnlyNumberAllowForPinCode, */ hasLengthAtLeast, hasLengthAtMost, isRequired, nameMaxLength, nameMinLength, validateEmail, validateName } from '../../util/formValidators';
import combine from '../../util/combineValidators';
import defaultClasses from '../RewardPoint/rewardPoint.css';

export const clearIcon = <Icon src={ClearIcon} size={30} />;

const MIN_FILE_SIZE = 80; // 80kB
const MAX_FILE_SIZE = 5120; // 5MB

export const JobBoardModal = (props) => {
    const { isOpen,
        handleSubmit,
        handleApplyClose,
        empData,
        SetEmpData,
        base64,
        setBase64,
        avialableJobsList,
        email,
        firstname,
        lastname,
        setErrorMsg,
        errorMsg,
        resumeValidation } = props

    const classes = mergeClasses(cedClasses, props.classes)

    const handleChange = (e) => {
        SetEmpData({ ...empData, [e.target.name]: e.target.value });
    }

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    }

    const handleFileUpload = async (e) => {
        setBase64({ ...base64, file: e.target.files, url: await convertToBase64(e.target.files[0]) })
        const entries = Object.values(e.target.files);

        const errorMessages = [];
        
        for (let i = 0; i < entries.length; i++) {
            const fileSizeKiloBytes = entries[i].size / 1024;
            if(entries[i].type === '' || /\.(doc|pdf|docx)$/.test(entries[i].name)){
                if (fileSizeKiloBytes < MIN_FILE_SIZE) {
                    errorMessages.push(`File "${entries[i].name}" is less than ${MIN_FILE_SIZE} KB`);
                    setErrorMsg(true)
                }
                if (fileSizeKiloBytes > MAX_FILE_SIZE) {
                    errorMessages.push(`File "${entries[i].name}" is greater than ${MAX_FILE_SIZE / 1024} MB`);
                    setErrorMsg(true)
                }
            }else{
                errorMessages.push(`This "${entries[i].name}" file format is not allowed.`)
                setErrorMsg(true)
            }
        }
        if (errorMessages.length > 0) {
            // If there are any error messages, display them and set isSuccess to false.
            setErrorMsg(errorMessages.join('\n'));
            // setIsSuccess(false);
        } else {
            setErrorMsg('');
            // setIsSuccess(true);

        }
    };

    const avialableJobsDesignation = avialableJobsList &&
        avialableJobsList.map((designation) =>
            designation.designation)

    return (
        <section className={jobBorad.jobBoradModal}>
            <div className={isOpen ? classes.add_gift_form + "  " + "modal fade show" + " " + jobBorad.jobBoradActiveModal : null}
                id="jobBoard" tabindex="-1"
                aria-labelledby="staticBackdropLabel"
                aria-hidden="true">
                <div className={classes.overlay} />
                <div className={jobBorad.are_sure_modal + ' ' + 'modal-dialog modal-dialog-centered'}>
                    <div className={jobBorad.modal_content + ' ' + 'modal-content'}>
                        <div className={jobBorad.modal_header + ' ' + 'modal-header'} >
                            <h4 className="modal-title" id="staticBackdropLabel">Personal Information</h4>
                            <div className={jobBorad.close_modal}>
                                <button type='button' onClick={handleApplyClose}>{clearIcon}</button>
                            </div>
                        </div>
                        <div className={jobBorad.modal_body + " " + "modal-body"}>
                            <Form onSubmit={handleSubmit}>
                                <div className={classes.add_review_wrapper + ' ' + jobBorad.job_name_form}>
                                    <Field label="First Name*">
                                        <TextInput
                                            field="firstname"
                                            onChange={handleChange}
                                            validate={combine([
                                                (value) => isRequired(value, 'First Name'),
                                                [hasLengthAtMost, nameMaxLength],
                                                [hasLengthAtLeast, nameMinLength],
                                                validateName
                                            ])}
                                            validateOnBlur
                                            initialValue={firstname}
                                        />
                                    </Field>
                                    <Field label="Last Name*">
                                        <TextInput
                                            field="lastname"
                                            onChange={handleChange}
                                            validate={combine([
                                                (value) => isRequired(value, 'Last Name'),
                                                [hasLengthAtMost, nameMaxLength],
                                                [hasLengthAtLeast, nameMinLength],
                                                validateName
                                            ])}
                                            validateOnBlur
                                            initialValue={lastname}
                                        />
                                    </Field>
                                </div>
                                <div className={classes.add_review_wrapper}>
                                    <Field label="Email*">
                                        <TextInput
                                            field="email"
                                            onChange={handleChange}
                                            validate={combine([
                                                (value) => isRequired(value, 'Email'),
                                                validateEmail
                                            ])}
                                            validateOnBlur
                                            maxLength={70}
                                            initialValue={email}
                                        />
                                    </Field>
                                </div>
                                <div className={classes.review_form_wrap} id="product-review-submit">
                                    <div className={classes.add_review_wrapper}>
                                        <Field
                                            label="Address*">
                                            <TextArea
                                                field="address"
                                                onChange={handleChange}
                                                validate={value => isRequired(value, 'Address')}
                                                validateOnBlur
                                            />
                                        </Field>
                                    </div>
                                </div>
                                <div className="modal-header">
                                    <h4 className="modal-title">Educational & Professional Information</h4>
                                </div>
                                <div className={classes.add_review_wrapper + ' ' + jobBorad.job_name_form}>
                                    <Field label="Qualification*">
                                        <TextInput
                                            field="qualification"
                                            onChange={handleChange}
                                            validate={(value) => isRequired(value, ' Qualification')}
                                            validateOnBlur
                                        />
                                    </Field>
                                    <Field label="Total Experience*" required={true}>
                                        {/* <Select
                                            // id={experience}
                                            // initialValue={experienceObj}
                                            field="experience"
                                            items={experienceObj ? experienceObj : []}
                                            validate={(value) => isRequired(value, ' Total Experience')}
                                            onChange={handleChange}
                                        /> */}
                                        <TextInput
                                            field="experience"
                                            validate={combine([value => isRequired(value, ' Total Experience')
                                            ])}
                                            validateOnBlur
                                            onChange={handleChange}
                                        />
                                    </Field>
                                </div>

                                <div className={classes.add_review_wrapper + ' ' + jobBorad.job_name_form}>
                                    <Field label="Current Position">
                                        <TextInput
                                            field="current_position"
                                            onChange={handleChange}
                                            // validate={(value) => isRequired(value, ' Current Position')}
                                            validateOnBlur
                                        />
                                    </Field>
                                    <Field label="Current Company">
                                        <TextInput
                                            field="current_company"
                                            onChange={handleChange}
                                            // validate={(value) => isRequired(value, ' Current Company')}
                                            validateOnBlur
                                        />
                                    </Field>
                                </div>
                                <div className="modal-header">
                                    <h5 className="modal-title">Job Profile</h5>
                                </div>
                                <div className={classes.add_review_wrapper}>
                                    <Field label="Position Applied For*">
                                        <TextInput
                                            field="position"
                                            onChange={handleChange}
                                            initialValue={avialableJobsDesignation}
                                            validate={(value) => isRequired(value, ' Position Applied For')}
                                            validateOnBlur
                                            disabled
                                        />
                                    </Field>
                                </div>
                                <div className={classes.add_review_wrapper + " " + jobBorad.upload_wrapper}>
                                    <Field label="Resume*" />
                                    <div className={defaultClasses.add_rma_form_footer}>
                                        <div >
                                            {base64 && base64.file && base64.file[0].name && <div className='file_name'>
                                                {base64 && base64.file && base64.file[0].name?.replace(/[^\w.&!@#$%^*()[\]{}\/:]/gi, '')?.replace(/[\s&!@#$%^*()[\]{}\/:]+/g, '_')}
                                            </div>}
                                            {errorMsg &&
                                                <p className="text-danger mb-0">{errorMsg}</p>
                                            }
                                            {resumeValidation && !base64?.file && !base64?.url && <p className="text-danger">Please Upload Resume.</p>}
                                            <label htmlFor="upload-photo">
                                                {'Attach File'}
                                            </label>
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileUpload(e)}
                                                name="photo"
                                                id="upload-photo"
                                                // multiple="multiple"
                                                accept=".pdf, .doc, .docx"
                                                validateOnBlur
                                            />
                                        </div>
                                    </div>
                                    <p className="text-success m-0">Supports .pdf, .doc, .docx file format</p>
                                </div>
                                <div className={jobBorad.sure_footer + ' ' + 'modal-footer pl-0'} >
                                    <Button priority="high" type="submit" disabled={errorMsg} > Submit Application</Button>
                                </div>
                            </Form>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}
