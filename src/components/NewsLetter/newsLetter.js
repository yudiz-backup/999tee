import React, {
    useState, useEffect, useRef
} from 'react';
import { shape, string } from 'prop-types';
import { Form } from 'informed';
import Button from '../Button';
import Field from '../Field';
import TextInput from '../TextInput';
import { FormattedMessage, useIntl } from 'react-intl';
import { validateEmail } from '../../util/formValidators';
import { mergeClasses } from '../../classify';
import defaultClasses from '../Footer/footer.css';
import { useNewsLetter } from '../../peregrine/lib/talons/NewsLetter/useNewsLetter';
import NEWSLETTER_MUTATION from '../../queries/subscribeNewsLetter.graphql';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useToasts } from '@magento/peregrine';
import RichContent from '../RichContent/richContent';
// import GoogleCaptcha from '../GoogleCaptcha/googleCaptcha';

const NewsLetter = props => {
    const [, { addToast }] = useToasts();
    const { formatMessage } = useIntl();
    const formRef = useRef(null);
    const { footerSignUpandSave } = props

    const [successMsg, setSuccessMsg] = useState(true);
    const [errorMsg, setErrorMsg] = useState(true);
    const classes = mergeClasses(defaultClasses, props.classes);
    const talonProps = useNewsLetter({
        query: NEWSLETTER_MUTATION
    });

    const { handleSubmit, responseData } = talonProps;

    const submitForm = async v => {
        await handleSubmit(v);
        setTimeout(() => {
            if (formRef?.current) {
                formRef?.current?.reset()
            }
        }, 2000)
        setSuccessMsg(true);
        setErrorMsg(true);
    };

    useEffect(() => {
        if (responseData && responseData.success == 'true' && successMsg) {
            addToast({
                type: 'info',
                message: responseData.message,
                dismissable: true,
                timeout: 10000
            });
            setSuccessMsg(false);
        }

        if (responseData && responseData.success == 'false' && errorMsg) {
            addToast({
                type: 'info',
                message: responseData.message,
                dismissable: true,
                timeout: 10000
            });
            setErrorMsg(false);
        }
    }, [
        addToast,
        responseData,
        setErrorMsg,
        errorMsg,
        successMsg,
        setSuccessMsg
    ]);

    return (
        <div className={classes.newsletter_Wrap}>
            <div className={classes.newsletter_content}>
                <p className={classes.newsletter_content_head}>
                    <RichContent html={footerSignUpandSave?.footerData} />
                </p>
            </div>
            {/* <GoogleCaptcha ref={captchaToken} /> */}
            <div className={classes.newsletter_form}>
                <Form onSubmit={submitForm}
                    ref={formRef}
                    getApi={value => (formRef.current = value)}>
                    <div className={classes.newsletter_Wrap_inner}>
                        <div className={classes.newsletter_input}>
                            <Field
                                label="Email"
                                id={'newsletter-email'}
                            >
                                <TextInput
                                    id={'newsletter-email'}
                                    autoComplete="email"
                                    field="email_id"
                                    validate={validateEmail}
                                    placeholder={formatMessage({
                                        id:
                                            'newsletter.placeholder',
                                        defaultMessage:
                                            'Enter your email'
                                    })}
                                    validateOnChange
                                    validateOnBlur
                                />
                            </Field>
                        </div>
                        <div className={classes.newsletter_btn}>
                            <Button
                                className={
                                    classes.newsletter_btn_inner
                                }
                                type="submit"
                                aria-label="Submit"
                            >
                                <span
                                    className="newsletter action"
                                    aria-hidden="true"
                                >
                                    <FormattedMessage
                                        id="newsLetter.submit"
                                        defaultMessage="Submit"
                                    />
                                </span>
                                <FontAwesomeIcon
                                    icon={faPaperPlane}
                                />
                            </Button>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
};

NewsLetter.propTypes = {
    classes: shape({
        copyright: string,
        root: string,
        tile: string,
        tileBody: string,
        tileTitle: string,
        signInButton: string
    })
};

export default NewsLetter;
