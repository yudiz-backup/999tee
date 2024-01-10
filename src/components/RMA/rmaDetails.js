import { Title } from '../Head';
import React, { useState, useEffect, useRef } from 'react'
import Sidebar from '../MyAccount/sidebar';
import { Link } from 'src/drivers'
import TableClasses from '../MyAccount/myAccount.css';
import defaultClasses from '../RewardPoint/rewardPoint.css';
import Classes from '../MyAccount//myOrderView.css';
import rmaClasses from './rma.css';
import { Form } from 'informed';
import TextArea from '@magento/venia-ui/lib/components/TextArea';
import Field from '../Field';
import Button from '../Button';
import accountClasses from '../MyAccount/accountinformation.css';
import orderOverViewClasses from '../MyAccount/myOrderView.css'
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Redirect, useHistory/* , useLocation */ } from '../../drivers';
import { isRequired } from '../../util/formValidators';
import { useMutation, useQuery } from '@apollo/client';
import rmaComment from '../../queries/RMA/rmaComment.graphql'
import { useDashboard } from '../../peregrine/lib/talons/MyAccount/useDashboard';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import getRmaCustomerDetails from '../../queries/RMA/getRmaCustomerDetails.graphql'
import { monthsForChart, statusObj } from '../../util/customData'
import { useMobile } from '../../peregrine/lib/talons/Mobile/useMobile';
// import { imageIcon } from '';
import { X as ClearIcon } from 'react-feather';
import Compressor from 'compressorjs';
import Icon from '@magento/venia-ui/lib/components/Icon';
import LoadingIndicator from '../LoadingIndicator/indicator';
import { useToasts } from '@magento/peregrine';

const rmaItemPerRow = 5;
const MIN_FILE_SIZE = 80 // 120kB
const MAX_FILE_SIZE = 5120 // 5MB

const clearIcon = <Icon src={ClearIcon} size={30} />;

export default function RmaDetails(props) {
    const [base64, setBase64] = useState()
    const [errorMsg, setErrorMsg] = useState(false);
    // const [isSuccess, setIsSuccess] = useState(false);
    const [sentReply, setSentReply] = useState(false);
    const [base64Files, setBase64Files] = useState([]);
    const [{ isSignedIn }] = useUserContext();
    const { mobileView } = useMobile();
    const formRef = useRef(null);
    const talonProps = useDashboard();
    const {
        billingAddress,
        mobile_number,
        email
    } = talonProps;

    const [, { addToast }] = useToasts();
    const [next, setNext] = useState(rmaItemPerRow);
    const { request_id } = useParams()
    const history = useHistory()
    const handleMoreTransaction = () => {
        setNext(next + rmaItemPerRow);
    };
    const { data, refetch } = useQuery(getRmaCustomerDetails, {
        fetchPolicy: "no-cache",
        email: email
    })
    const [rmaCommentInfo, {loading : commentLoading}] = useMutation(rmaComment, {
        onCompleted: (data) => {
            if (data) {
                formRef.current.setValue('conversation', '')
                setBase64()
                setSentReply(true)
                refetch()
            }
        },
        onError: error => {
            error.graphQLErrors.map(error => {
                addToast({
                    type: 'error',
                    message: error.message,
                    dismissable: true,
                    timeout: 5000
                });
            });
        }
    });

    const convContent = base64 && base64.content

    useEffect(() => {
        if (!isSignedIn) {
            history.push('/')
        }
    }, [isSignedIn])


    const createPost = async () => {
        try {
            const newArray = base64Files.map(({ type, size, base_64_images, ...rest }) => rest)
            await rmaCommentInfo({
                variables: {
                    id: +request_id,
                    content: convContent,
                    upload: newArray ? newArray : [],
                }
            });
        } catch (error) {
            console.log(error.message);
        }
    };

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
    };

    const handleFileUpload = async (e) => {
        setBase64({ ...base64, file: e.target.files[0], url: await convertToBase64(e.target.files[0]) })
        const entries = Object.values(e.target.files);

        try {
            const newObjects = await Promise.all(
                entries.map(async (file) => {
                    try {
                        // Use Compressor to compress the image before converting it to base64
                        const compressedImage = await new Promise((resolve) => {
                            new Compressor(file, {
                                quality: 0.6, // Adjust the quality as needed (0.6 represents 60% quality)
                                success(result) {
                                    resolve(result);
                                },
                                error(error) {
                                    console.error('An error occurred while compressing the image:', error);
                                    resolve(null); // Resolve with null to handle errors
                                },
                            });
                        });

                        const sanitizedFileName = (compressedImage || file)?.name?.replace(/[^\w.&!@#$%^*()[\]{}\/:]/gi, '')?.replace(/[\s&!@#$%^*()[\]{}\/:]+/g, '_')
                        const base64Data = await convertToBase64(compressedImage || file);
                        const base64_encoded_data = base64Data ? base64Data.split(',')[1] : null;
                        return {
                            name: sanitizedFileName,
                            base64_encoded_data: base64_encoded_data,
                            base_64_images: base64Data,
                            type: (compressedImage || file)?.type,
                            size: (compressedImage || file)?.size,
                        };

                    } catch (error) {
                        console.error('An error occurred while converting to base64:', error);
                        return {};
                    }
                })
            );

            const updatedFiles = [...base64Files, ...newObjects];
            setBase64Files(updatedFiles);
        } catch (err) {
            console.error('An error occurred:', err);
        }

        const errorMessages = [];

        for (let i = 0; i < entries.length; i++) {
            const fileSizeKiloBytes = entries[i].size / 1024;
            if(entries[i].type === '' || /\.(jpeg|png|jpg|doc|pdf|zip)$/.test(entries[i].name)){
                if (fileSizeKiloBytes < MIN_FILE_SIZE) {
                    errorMessages.push(`File "${entries[i].name}" is less than ${MIN_FILE_SIZE} KB`);
                }
                if (fileSizeKiloBytes > MAX_FILE_SIZE) {
                    errorMessages.push(`File "${entries[i].name}" is greater than ${MAX_FILE_SIZE / 1024} MB`);
                }
            }else{
                errorMessages.push(`This "${entries[i].name}" file format is not allowed.`)
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

    const handleSubmit = () => {
        createPost()
        setBase64Files([])
        setBase64([])
        // setBase64()
    };

    const handleImageClear = (i) => {
        const entries = base64Files?.filter((value, index) => index !== i)
        setBase64Files(entries)
        const errorMessages = [];
        for (let i = 0; i < entries.length; i++) {
            const fileSizeKiloBytes = entries[i].size / 1024;
            if(entries[i].type === '' || /\.(jpeg|png|jpg|doc|pdf|zip)$/.test(entries[i].name)){
                if (fileSizeKiloBytes < MIN_FILE_SIZE) {
                    errorMessages.push(`File "${entries[i].name}" is less than ${MIN_FILE_SIZE} KB`);
                }
                if (fileSizeKiloBytes > MAX_FILE_SIZE) {
                    errorMessages.push(`File "${entries[i].name}" is greater than ${MAX_FILE_SIZE / 1024} MB`);
                }
            }else{
                errorMessages.push(`This "${entries[i].name}" file format is not allowed.`)
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
    }

    const rmaDetails = data && data.customer && data.customer.mp_rma

    useEffect(() => {
        if (data && data.length) {
            const detail = data.find(d => +d.request_id === +request_id)
            if (!detail) {
                history.push('/mprma/customer/')
            }
        }
    }, [])

    if (!isSignedIn) {
        return <Redirect to="/" />;
    }

    return (
        <section className={defaultClasses.rewardPoint_page}>
            <Title>{`RMA Details`}</Title>
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
                                                    id={'rma.rmadetails'}
                                                    defaultMessage={'RMA Details'}
                                                />
                                            </span>
                                        </h1>
                                        <Link
                                            to={{
                                                pathname:
                                                    '/mprma/customer/'
                                            }}
                                            className={Classes.print_button + ' ' + rmaClasses.textColor}>
                                            Back to RMA List
                                        </Link>
                                    </div>
                                    {rmaDetails &&
                                        rmaDetails.items &&
                                        rmaDetails.items.map((rmaItmeDetails) => {
                                            const date = new Date(rmaItmeDetails.created_at);
                                            const dateSplit = rmaItmeDetails?.created_at?.split(" ")
                                            const dateMDY = `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}-${monthsForChart[date.getMonth() + 1]}-${date.getFullYear()}`;

                                            if (rmaItmeDetails.request_id === +request_id) {
                                                return <div className={defaultClasses.table_section} key={request_id}>
                                                    <div className={TableClasses.block}>
                                                        <div className={rmaClasses.heading_block + ' ' + "homepage_sections_head"}>
                                                            <h2 className="homepage_section_heading">{rmaItmeDetails.increment_id}</h2>
                                                            <span
                                                                className={
                                                                    orderOverViewClasses.order_status + ' ' + "mt-2"
                                                                }
                                                            >
                                                                {statusObj && statusObj[rmaItmeDetails.status_id]}
                                                            </span>
                                                        </div>
                                                        <div className={rmaClasses.rma_payment}>
                                                            <h4>
                                                                <FormattedMessage
                                                                    id={'rma.orderRequestinformation'}
                                                                    defaultMessage={'Order Request Information'}
                                                                />
                                                            </h4>
                                                            <div className="col-lg-5 pl-0">
                                                                <article>
                                                                    <p>Request ID:<span>{rmaItmeDetails.request_id}</span></p>
                                                                    <p>Order Increment ID:<span>{rmaItmeDetails.order_increment_id}</span></p>
                                                                    <p>Order Created Date:<span>{mobileView ? dateSplit : dateMDY}</span></p>
                                                                    <p>Email Address:<span>{rmaItmeDetails.customer_email}</span></p>
                                                                    {billingAddress && <p>Billing Pincode:<span>{billingAddress.postcode}</span></p>}
                                                                    {mobile_number && <p>Phone Number:<span>{mobile_number}</span></p>}
                                                                </article>
                                                            </div>
                                                        </div>
                                                        <div className={rmaClasses.rma_payment}>
                                                            <h4>
                                                                <FormattedMessage
                                                                    id={'rma.returnshippinginformation'}
                                                                    defaultMessage={'Return Shipping Information'}
                                                                />
                                                            </h4>
                                                            <div className="col-lg-5 pl-0">
                                                                <article>
                                                                    {rmaItmeDetails?.request_shipping_label?.length ? rmaItmeDetails?.request_shipping_label?.map((requestShippingLabel) => {
                                                                        return <p style={{ paddingTop: '6px' }}>There is no shipping label for this request</p>
                                                                    }) : <p>There is no shipping label for this request</p>}
                                                                </article>
                                                            </div>
                                                        </div>
                                                        <div className={rmaClasses.rma_payment}>
                                                            <h4>
                                                                <FormattedMessage
                                                                    id={'rma.rmainformation'}
                                                                    defaultMessage={'RMA Information'}
                                                                />
                                                            </h4>
                                                            <div className={TableClasses.block + " " + TableClasses.block_dashboard_orders}>
                                                                <div className={TableClasses.recent_order_list}>
                                                                    <div className={TableClasses.table_wrapper + " " + rmaClasses.rma_recent}>
                                                                        <div className={TableClasses.table_wrapper_inner}>
                                                                            <ul className={TableClasses.table_wrapper_head + ' ' + TableClasses.rma_table}>
                                                                                <li className={TableClasses.item + " " + TableClasses.head_item}>Product Name</li>
                                                                                <li className={TableClasses.item + " " + TableClasses.head_item}>SKU</li>
                                                                                <li className={TableClasses.item + " " + TableClasses.head_item}>Price</li>
                                                                                <li className={TableClasses.item + " " + TableClasses.head_item}>Reason</li>
                                                                                <li className={TableClasses.item + " " + TableClasses.head_item}>Solution</li>
                                                                                {/* <li className={TableClasses.item + " " + TableClasses.head_item}>Additional Field</li> */}
                                                                                <li className={TableClasses.item + " " + TableClasses.head_item}>Qty</li>
                                                                            </ul>
                                                                            <div className={TableClasses.table_wrapper_body}>
                                                                                {rmaItmeDetails?.request_item?.slice(0, next)?.map((requestItem) => {
                                                                                    return (
                                                                                        <ul className={TableClasses.orders_row + ' ' + TableClasses.rma_table}>
                                                                                            <li mobilelabel='Product Name :' className={TableClasses.item + " " + TableClasses.body_item}>{requestItem.name}</li>
                                                                                            <li mobilelabel='SKU :' className={TableClasses.item + " " + TableClasses.body_item}>{requestItem.sku}</li>
                                                                                            <li mobilelabel='Price :' className={TableClasses.item + " " + TableClasses.body_item}>{requestItem.price}</li>
                                                                                            <li mobilelabel='Reason :'
                                                                                                className={TableClasses.item + " " + TableClasses.body_item}
                                                                                            >
                                                                                                {requestItem && requestItem.reason ? requestItem.reason : "-"}
                                                                                            </li>
                                                                                            <li mobilelabel='Solution :'
                                                                                                className={TableClasses.item + " " + TableClasses.body_item}
                                                                                            >
                                                                                                {requestItem && requestItem.solution ? requestItem.solution : "-"}
                                                                                            </li>
                                                                                            {/* <li mobilelabel="There are no additional fields :" className={TableClasses.item + " " + TableClasses.body_item}>There are no additional fields</li> */}
                                                                                            <li mobilelabel='Qty :' className={TableClasses.item + " " + TableClasses.body_item}>{requestItem.qty_rma}</li>
                                                                                        </ul>
                                                                                    )
                                                                                })}
                                                                                <div className='mt-2'>
                                                                                    {next &&
                                                                                        rmaItmeDetails &&
                                                                                        rmaItmeDetails.request_item != undefined &&
                                                                                        rmaItmeDetails.request_item.length &&
                                                                                        next < rmaItmeDetails.request_item.length &&
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
                                                                                                    'Loda More'
                                                                                                }
                                                                                            />
                                                                                        </Button>
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* <div className={rmaClasses.rma_payment}>
                                                            <h4>
                                                                <FormattedMessage
                                                                    id={'rma.rmacomment'}
                                                                    defaultMessage={'RMA Comment'}
                                                                />
                                                            </h4>
                                                            <Form className={accountClasses.account_form_inner}>
                                                                <Field label="Comment" required={true}>
                                                                    <TextArea field="street[0]" autoComplete="family-name" validate={value => isRequired(value, 'Street Address')} validateOnBlur />
                                                                </Field>
                                                                <div className={defaultClasses.add_rma_form_footer}>
                                                                    <div>
                                                                        <label htmlFor="upload-photo">Attach File</label>
                                                                        <input type="file" name="photo" id="upload-photo" />
                                                                    </div>
                                                                </div>
                                                            </Form>
                                                        </div> */}
                                                        <div className={rmaClasses.rma_payment}>
                                                            <h4>
                                                                <FormattedMessage
                                                                    id={'rma.rmaconversation'}
                                                                    defaultMessage={'RMA Conversation'}
                                                                />
                                                            </h4>
                                                            <Form
                                                                ref={formRef}
                                                                getApi={value => formRef.current = value}
                                                                onSubmit={handleSubmit}
                                                                className={accountClasses.account_form_inner}
                                                            >
                                                                <Field label="Conversation" required={true} id="street[0]">
                                                                    <TextArea
                                                                        onChange={(e) => { setBase64({ ...base64, content: e.target.value }) }}
                                                                        field="conversation"
                                                                        autoComplete="family-name"
                                                                        validate={value => isRequired(value, 'RMA Conversation')}
                                                                        validateOnBlur
                                                                    />
                                                                </Field>
                                                                <div className={defaultClasses.add_rma_form_footer}>
                                                                    <div>
                                                                        <p className="text-danger">{errorMsg}</p>
                                                                        <label htmlFor="upload-photo">
                                                                            {'Attach File'}
                                                                        </label>
                                                                        <input
                                                                            type="file"
                                                                            onChange={(e) => handleFileUpload(e)}
                                                                            name="photo"
                                                                            id="upload-photo"
                                                                            accept=".jpeg, .png, .jpg, .doc, .pdf, .zip"
                                                                            multiple="multiple"
                                                                        />
                                                                    </div>
                                                                    <Button type="submit" priority="high" disabled={errorMsg}>
                                                                        <FormattedMessage
                                                                            id={'rma.rmasubmit'}
                                                                            defaultMessage={'Submit'}
                                                                        />
                                                                    </Button>
                                                                </div>
                                                                <p className="text-success">
                                                                    Supports .jpeg,
                                                                    .png, .jpg,
                                                                    .pdf, .doc file
                                                                    format
                                                                </p>
                                                            </Form>
                                                            <div className={rmaClasses.main_upload_box}>
                                                                {base64Files?.map((file, index) => {
                                                                    return (
                                                                        <div className={rmaClasses.main_upload_single_box}>
                                                                            <img
                                                                                className={
                                                                                    rmaClasses.upload_box_img
                                                                                }
                                                                                src={file.type === 'application/zip'
                                                                                    ? '/cenia-static/images/zip.png'
                                                                                    : file.type === 'application/pdf'
                                                                                        ? '/cenia-static/images/pdf.jpeg'
                                                                                        : file.type === 'application/msword'
                                                                                            ? '/cenia-static/images/doc.png'
                                                                                            : file?.base_64_images}
                                                                                alt={file.name}
                                                                                height="150"
                                                                                width="150"
                                                                            />
                                                                            <p className={rmaClasses.file_name}>{file.name}</p>
                                                                            <button onClick={() => handleImageClear(index)}>
                                                                                {clearIcon}
                                                                            </button>
                                                                        </div>
                                                                    )
                                                                })
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className={defaultClasses.success_msg}>
                                                            {sentReply && 'You have sent your message'}
                                                        </div>
                                                        {!commentLoading ? rmaItmeDetails?.request_reply?.length !== 0 && 
                                                        <div className={rmaClasses.chat_main_wrapper}>
                                                            {rmaItmeDetails?.request_reply?.map((req) => {
                                                                    return <>
                                                                        {req.type === 3 ? <>
                                                                            <div className={req.type === 3 ? `${rmaClasses.admin_chat}` : null}>
                                                                            <strong>{req.author_name}</strong>
                                                                            <p className={rmaClasses.chat_msg}>{req.content}</p>
                                                                        </div>
                                                                        <div className={`${rmaClasses.files_wrapper} d-flex flex-column align-items-start`}>
                                                                            {req?.files?.map(file => {
                                                                                return <button onClick={() => window.open(file, '_blank')}>
                                                                                   {file?.slice(-3) === 'png' &&
                                                                             <img src="/cenia-static/images/placeholder-png.png" alt='icon' className='img=fluid'/> ||
                                                                             file?.slice(-3) === 'jpg' &&  <img src="/cenia-static/images/placeholder-jpg.png" alt='icon' className='img=fluid'/> ||
                                                                             file?.slice(-3) === 'pdf' &&   <img src="/cenia-static/images/pdf-icon.svg" alt='icon' className='img=fluid'/>
                                                                                }
                                                                                    <span className='text-left'>{file?.substring(file.lastIndexOf('/') + 1)} </span>
                                                                                    </button>
                                                                            })}
                                                                        </div>
                                                                        </>:
                                                                        // <div>
                                                                       <>
                                                                        <div className={req.type === 2 ? `${rmaClasses.user_chat}` : `${rmaClasses.admin_chat}`}>
                                                                            <strong>{req.author_name}</strong>
                                                                            <p className={rmaClasses.chat_msg}>{req.content}</p>
                                                                        {/* </div> */}
                                                                        </div>
                                                                         <div className={`${rmaClasses.files_wrapper} d-flex flex-column align-items-end`}>
                                                                         {req?.files?.map(file => {
                                                                             return <button onClick={() => window.open(file, '_blank')}>
                                                                                {/* /cenia-static/images/placeholder-jpg.png */}
                                                                                {file?.slice(-3) === 'png' &&
                                                                             <img src="/cenia-static/images/placeholder-png.png" alt='icon' className='img=fluid'/> ||
                                                                             file?.slice(-3) === 'jpg' &&  <img src="/cenia-static/images/placeholder-jpg.png" alt='icon' className='img=fluid'/> ||
                                                                             file?.slice(-3) === 'pdf' &&  <img src="/cenia-static/images/pdf-icon.svg" alt='icon' className='img=fluid'/>
                                                                                }
                                                                            <span className='text-left'>
                                                                                {file?.substring(file.lastIndexOf('/') + 1)}
                                                                            </span>
                                                                            </button>
                                                                         })}
                                                                     </div>
                                                                       </>
                                                                        }
                                                                       
                                                                    </>
                                                                })}
                                                        </div> : <LoadingIndicator />}
                                                    </div>
                                                </div>
                                            }
                                        })}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}