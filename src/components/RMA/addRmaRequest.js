import { Title } from '../Head';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../MyAccount/sidebar';
import TableClasses from '../MyAccount/myAccount.css';
import defaultClasses from '../RewardPoint/rewardPoint.css';
import Classes from '../MyAccount//myOrderView.css';
import rmaClasses from './rma.css';
import { Form } from 'informed';
import TextArea from '@magento/venia-ui/lib/components/TextArea';
import Field from '../Field';
import Button from '../Button';
import accountClasses from '../MyAccount/accountinformation.css';
import jobBorad from '../JobBoard/jobBorad.css';
import Select from '../Select';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import { Link } from 'react-router-dom';
import combineValidators from '../../util/combineValidators';
import { isRequired, validateEmail } from '../../util/formValidators';
import { FormattedMessage } from 'react-intl';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import rmaOrderIdConfig from '../../queries/RMA/rmaOrderIdConfig.graphql';
import rmaCustomerOrder from '../../queries/RMA/rmaCustomerOrder.graphql';
import rmaReturnItmes from '../../queries/RMA/rmaReturnItmes.graphql';
import rmaNewRequest from '../../queries/RMA/rmaNewRequest.graphql';
import getProductSpecificInfo from '../../queries/RMA/getProductSpecificInfo.graphql';
import { useUserContext } from '@magento/peregrine/lib/context/user';
import { Redirect, useHistory } from '../../drivers';
import Checkbox from '../Checkbox';
import { useDashboard } from '../../peregrine/lib/talons/MyAccount/useDashboard';
import getRmaCustomerDetails from '../../queries/RMA/getRmaCustomerDetails.graphql';
import { useToasts } from '@magento/peregrine';
import { itemReturnType } from '../../util/customData';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { X as ClearIcon } from 'react-feather';
import Compressor from 'compressorjs';
import LoadingIndicator from '../LoadingIndicator/indicator';

// const rmaItemPerRow = 2;
const MIN_FILE_SIZE = 80; // 80kB
const MAX_FILE_SIZE = 5120; // 5MB

const clearIcon = <Icon src={ClearIcon} size={30} />;

export default function AddRmaRequest(props) {
    const [, { addToast }] = useToasts();
    const history = useHistory();
    // const [next, setNext] = useState(rmaItemPerRow);
    const [base64, setBase64] = useState({
        file: '',
        url: ''
    });
    const [errorMsg, setErrorMsg] = useState(false);
    // const [isSuccess, setIsSuccess] = useState(false);
    const [qutRMA, setQutRMA] = useState([]);
    const [orderId, setOrderId] = useState();
    const [isChecked, setIsChecked] = useState(false);
    const [specificData, setSpecificData] = useState([]);
    const formRef = useRef(null);
    const [{ isSignedIn }] = useUserContext();
    const [returnData, setReturnData] = useState([]);
    const [rmaReturnInfoItems, setRmaReturnInfoItems] = useState([]);
    const [base64Files, setBase64Files] = useState([]);

    const talonProps = useDashboard();
    const { email, lastname } = talonProps;

    const initialValueReturnConfig =
        itemReturnType && itemReturnType[0] && itemReturnType[0].value;

    const [returnConfigValue, setReturnConfigValue] = useState(
        initialValueReturnConfig
    );


    useEffect(() => {
        if (!isSignedIn) {
            history.push('/')
        }
    }, [isSignedIn])

    // const handleMoreTransaction = () => {
    //     setNext(next + rmaItemPerRow);
    // };

    const {
        data: rmaCustomerOrderInfo,
        loading
    } = useQuery(rmaCustomerOrder, {
        fetchPolicy: 'no-cache'
    });

    const orderNumber =
        rmaCustomerOrderInfo &&
        rmaCustomerOrderInfo.customerOrders &&
        rmaCustomerOrderInfo.customerOrders.items;

    const completedOrderNumber =
        orderNumber && orderNumber.length
            ? orderNumber.filter(
                orderStatus => orderStatus.status === 'complete'
            )
            : [];

    if (!completedOrderNumber || !completedOrderNumber.length) {
        completedOrderNumber.push({
            order_number: 'Select Order Id',
            id: ''
        });
    }
    if (
        completedOrderNumber &&
        completedOrderNumber.length &&
        !completedOrderNumber.some(item => item.id === '')
    ) {
        completedOrderNumber.unshift({
            order_number: 'Select Order Id',
            id: ''
        });
    }

    const [getRmaCustomer] = useLazyQuery(getRmaCustomerDetails, {
        fetchPolicy: 'no-cache',
        email: email
    });

    const [
        rmaOrderIdFetch,
        { data: rmaOrderId }
    ] = useLazyQuery(rmaOrderIdConfig, {
        fetchPolicy: 'no-cache'
    });

    const [rmaReturnFetch, { data: rmaReturnInfo }] = useLazyQuery(
        rmaReturnItmes,
        {
            fetchPolicy: 'no-cache'
        }
    );
    const [rmaNewRequestSummery, { error }] = useMutation(rmaNewRequest, {
        fetchPolicy: "no-cache",
        onCompleted: data => {
            getRmaCustomer();
            handleNavigate(data.mpRMARequest.request_id);
        }
    });

    useEffect(() => {
        if (error) {
            addToast({
                type: 'error',
                message: 'RMA request for this order id is not possible.',
                dismissable: true,
                timeout: 5000
            });
        }
    }, [error]);

    useEffect(() => {
        if (rmaReturnInfo && rmaReturnInfo.orderDetails) {
            setRmaReturnInfoItems(rmaReturnInfo.orderDetails.items);
        } else {
            setRmaReturnInfoItems([]);
        }
    }, [rmaReturnInfo]);

    const ConfigParse =
        orderId && rmaOrderId && JSON.parse(rmaOrderId.mpRMAConfig);
    const previousProps = useRef({ specificData, qutRMA, orderId }).current;

    const [productSpecificDataRefetch] = useLazyQuery(
        getProductSpecificInfo,
        {
            fetchPolicy: 'no-cache',

            onCompleted: (data) => {
                setSpecificData(data?.getProductSpecific?.data)
            }
        }
    );

    const orderIncrementId =
        rmaReturnInfo &&
        rmaReturnInfo.orderDetails &&
        rmaReturnInfo.orderDetails.increment_id;

    useEffect(() => {
        if (orderIncrementId) {
            productSpecificDataRefetch({
                variables: {
                    order_id: orderIncrementId.toString()
                }
            });
        }
    }, [orderIncrementId])

    useEffect(() => {
        if (orderId) {
            rmaOrderIdFetch({
                storeId: +orderId
            });
            rmaReturnFetch({
                variables: {
                    id: +orderId
                }
            });
        }
    }, [orderId]);

    const reasonConfig =
        ConfigParse &&
            ConfigParse[0] &&
            ConfigParse[0].reason &&
            ConfigParse[0].reason.length
            ? ConfigParse[0].reason
            : [];
    const solutionConfig =
        ConfigParse &&
            ConfigParse[0] &&
            ConfigParse[0].solution &&
            ConfigParse[0].solution.length
            ? ConfigParse[0].solution
            : [];

    if (!reasonConfig.length) {
        reasonConfig.push({
            content: 'Select Reason',
            value: ''
        });
    }
    if (
        reasonConfig &&
        reasonConfig.length &&
        !reasonConfig.some(item => item.value === '')
    ) {
        reasonConfig.unshift({
            content: 'Select Reason',
            value: ''
        });
    }
    if (!solutionConfig.length) {
        solutionConfig.push({
            content: 'Select Solution',
            value: ''
        });
    }
    if (
        solutionConfig &&
        solutionConfig.length &&
        !solutionConfig.some(item => item.value === '')
    ) {
        solutionConfig.unshift({
            content: 'Select Solution',
            value: ''
        });
    }

    const [reasonSolution, setReasonSolution] = useState({
        reason: '',
        solution: ''
    });

    const handleChangeChecked = () => {
        setIsChecked(!isChecked);
    };

    const handleChange = e => {
        setOrderId(e.target.value);
        setReturnData([])
        if (!e.target.value && formRef && formRef.current) {
            formRef.current.setValue('reason', '');
            formRef.current.setValue('Solution', '');
        }
        if (e.target.value) {
            rmaOrderIdFetch(e.target.value);
            rmaReturnFetch(e.target.value);
        }
        // customerOrderRefetch();
        setSpecificData([]);
        setQutRMA([]);
        setReturnConfigValue(initialValueReturnConfig);
        if (formRef && formRef.current) {
            formRef.current.setValue('Return', 1);
        }
    };

    const handleChangeReason = e => {
        setReasonSolution({
            ...reasonSolution,
            reason: reasonConfig.filter(i => i.value === e.target.value)[0]
                .value
        });
    };

    const handleChangeSolution = e => {
        setReasonSolution({
            ...reasonSolution,
            solution: solutionConfig.filter(i => i.value === e.target.value)[0]
                .value
        });
    };

    const handleChangeReturn = e => {
        setReturnConfigValue(+e.target.value);
    };

    const convContent = base64 && base64.content;
    // const itemID = specificData && specificData.map(item => item.product_id);
    const returnTypeLabel =
        itemReturnType && returnConfigValue === initialValueReturnConfig;
    const reasonContent =
        reasonSolution && reasonSolution.reason !== ''
            ? reasonSolution.reason
            : '';
    const solutionContent =
        reasonSolution && reasonSolution.solution !== ''
            ? reasonSolution.solution
            : '';

    const createPost = async () => {
        try {
            const newArray = base64Files.map(({ type, size, base_64_images, ...rest }) => rest)
            await rmaNewRequestSummery({
                variables: {
                    order_increment_id: orderIncrementId.toString(),
                    comment: convContent,
                    upload: newArray ? newArray : [],
                    request_item: returnTypeLabel
                        ? specificData
                            ? specificData?.map(item => {
                                return {
                                    product_id: parseInt(item?.product_id),
                                    qty_rma:
                                        1,
                                    reason: reasonContent,
                                    solution: solutionContent
                                };
                            })
                            : []
                        : returnData
                            ? Object.values(returnData).map(item => {
                                const id = item?.product_id
                                return {
                                    product_id: parseInt(id),
                                    qty_rma: parseFloat(item.qty_ordered),
                                    reason:
                                        item && item.reason ? item.reason : '',
                                    solution:
                                        item && item.solution ? item.solution : ''
                                };
                            })
                            : []
                }
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    const convertToBase64 = file => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = error => {
                reject(error);
            };
        });
    };

    const handleFileUpload = async e => {
        setBase64({
            ...base64,
            file: e.target.files,
            url: await convertToBase64(e.target.files[0])
        });
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

                        const sanitizedFileName = (compressedImage || file)?.name?.replace(/[^\w.&!@#$%^*()[\]{}\/:]/gi, '').replace(/[\s&!@#$%^*()[\]{}\/:]+/g, '_');
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
            if(entries[i].type === '' || /\.(doc|pdf|docx)$/.test(entries[i].name)){
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
        createPost();
        setBase64();
        formRef.current.setValue('comment', '');
        // customerOrderRefetch();
        setSpecificData([]);
        setQutRMA([]);
        setReturnConfigValue(initialValueReturnConfig);
        if (formRef && formRef.current) {
            formRef.current.setValue('Return', 1);
        }
    };

    const handleNavigate = id => {
        if (id) {
            history.push(`/mprma/customer/${id}`, {});
        }
    };

    useEffect(() => {
        if (specificData.length && rmaReturnInfoItems.length) {
            const newInfoItems = specificData.map(item => {
                const result = rmaReturnInfoItems?.find(
                    sku => item.product_sku === sku.sku
                )
                if (result) {
                    return {
                        ...item,
                        ...result
                    }
                } else {
                    return {
                        ...item
                    }
                }
            });
            setRmaReturnInfoItems(newInfoItems);
        }
    }, [specificData.length]);

    if (!isSignedIn) {
        return <Redirect to="/" />;
    }

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

    return (
        <section className={defaultClasses.rewardPoint_page}>
            <Title>{`New RMA Request`}</Title>
            <div className={TableClasses.columns}>
                <div className="container-fluid">
                    {!loading ? (
                        <div className="row">
                            <div className="col-lg-12">
                                <div
                                    className={
                                        TableClasses.column +
                                        ' ' +
                                        TableClasses.main
                                    }
                                >
                                    <div
                                        className={TableClasses.account_sideBar}
                                    >
                                        <Sidebar history={props.history} />
                                    </div>
                                    <div
                                        className={
                                            TableClasses.account_contentBar
                                        }
                                    >
                                        <div
                                            className={
                                                TableClasses.rma_title
                                            }
                                        >
                                            <h1
                                                className={
                                                    TableClasses.page_title
                                                }
                                            >
                                                <span
                                                    className={
                                                        TableClasses.base
                                                    }
                                                >
                                                    <FormattedMessage
                                                        id={'rma.newRMArequest'}
                                                        defaultMessage={
                                                            'New RMA Request'
                                                        }
                                                    />
                                                </span>
                                            </h1>
                                            <Link
                                                to={{
                                                    pathname: '/mprma/customer/'
                                                }}
                                                className={
                                                    Classes.print_button +
                                                    ' ' +
                                                    rmaClasses.textColor
                                                }
                                            >
                                                Back to RMA List
                                            </Link>
                                        </div>
                                        <Form
                                            ref={formRef}
                                            getApi={value =>
                                                (formRef.current = value)
                                            }
                                            onSubmit={handleSubmit}
                                            className={
                                                accountClasses.account_form_inner
                                            }
                                        >
                                            <div className="row">
                                                <div className="col-12">
                                                    <div
                                                        className={
                                                            rmaClasses.rma_payment
                                                        }
                                                    >
                                                        <h4>
                                                            <FormattedMessage
                                                                id={
                                                                    'rma.orderinformation'
                                                                }
                                                                defaultMessage={
                                                                    'Order Information'
                                                                }
                                                            />
                                                        </h4>

                                                        <Field
                                                            label="Order Id *"
                                                            required={true}
                                                        >
                                                            <Select
                                                                id={orderId}
                                                                field="order_id"
                                                                items={
                                                                    completedOrderNumber
                                                                        ? completedOrderNumber
                                                                        : []
                                                                }
                                                                // orderNumber.filter(orderStatus => orderStatus.status === "complete")
                                                                onChange={
                                                                    handleChange
                                                                }
                                                                validate={value =>
                                                                    isRequired(
                                                                        value,
                                                                        'Order Number'
                                                                    )
                                                                }
                                                                required={true}
                                                                validateOnChange
                                                            />
                                                        </Field>
                                                       {lastname && <Field
                                                            label="Billing Last Name"
                                                            required={true}
                                                        >
                                                            <TextInput
                                                                field="billinglastname"
                                                                autoComplete="given-name"
                                                                initialValue={ lastname }
                                                                validate={value =>
                                                                    isRequired(
                                                                        value,
                                                                        'Billing Last Name'
                                                                    )
                                                                }
                                                                validateOnBlur
                                                            />
                                                        </Field>}
                                                        {email && <Field
                                                            label="Email"
                                                            required={true}
                                                        >
                                                            <TextInput
                                                                field="email"
                                                                autoComplete="email"
                                                                initialValue={ email }
                                                                validate={combineValidators(
                                                                    [
                                                                        value => {
                                                                            isRequired(
                                                                                value,
                                                                                'Email'
                                                                            ),
                                                                                validateEmail(
                                                                                    value
                                                                                );
                                                                        }
                                                                    ]
                                                                )}
                                                                validateOnBlur
                                                            />
                                                        </Field>}
                                                    </div>
                                                    <div
                                                        className={
                                                            rmaClasses.rma_payment
                                                        }
                                                    >
                                                        <h4>
                                                            <FormattedMessage
                                                                id={
                                                                    'rma.rmainformation'
                                                                }
                                                                defaultMessage={
                                                                    'RMA Information'
                                                                }
                                                            />
                                                        </h4>
                                                        <Field
                                                            label="Return*"
                                                            required={true}
                                                        >
                                                            <Select
                                                                id={
                                                                    returnConfigValue
                                                                }
                                                                initialValue={
                                                                    itemReturnType
                                                                        ? itemReturnType[0]
                                                                            .value
                                                                        : []
                                                                }
                                                                field="Return"
                                                                items={
                                                                    itemReturnType
                                                                        ? itemReturnType
                                                                        : []
                                                                }
                                                                onChange={e =>
                                                                    handleChangeReturn(
                                                                        e
                                                                    )
                                                                }
                                                            />
                                                        </Field>
                                                        {itemReturnType &&
                                                            returnConfigValue !==
                                                            initialValueReturnConfig && (
                                                                <div
                                                                    className={
                                                                        TableClasses.block +
                                                                        ' ' +
                                                                        TableClasses.block_dashboard_orders
                                                                    }
                                                                >
                                                                    <div
                                                                        className={
                                                                            TableClasses.recent_order_list
                                                                        }
                                                                    >
                                                                        <div
                                                                            className={
                                                                                TableClasses.table_wrapper +
                                                                                ' ' +
                                                                                rmaClasses.rma_recent +
                                                                                ' ' +
                                                                                rmaClasses.rma_item
                                                                            }
                                                                        >
                                                                            <div
                                                                                className={
                                                                                    TableClasses.table_wrapper_inner
                                                                                }
                                                                            >
                                                                                <ul
                                                                                    className={
                                                                                        TableClasses.table_wrapper_head
                                                                                    }
                                                                                >
                                                                                    <li
                                                                                        className={
                                                                                            TableClasses.item +
                                                                                            ' ' +
                                                                                            TableClasses.head_item
                                                                                        }
                                                                                    >
                                                                                        Select
                                                                                    </li>
                                                                                    <li
                                                                                        className={
                                                                                            TableClasses.item +
                                                                                            ' ' +
                                                                                            TableClasses.head_item
                                                                                        }
                                                                                    >
                                                                                        Thumbnail
                                                                                    </li>
                                                                                    <li
                                                                                        className={
                                                                                            TableClasses.item +
                                                                                            ' ' +
                                                                                            TableClasses.head_item
                                                                                        }
                                                                                    >
                                                                                        Name
                                                                                    </li>
                                                                                    <li
                                                                                        className={
                                                                                            TableClasses.item +
                                                                                            ' ' +
                                                                                            TableClasses.head_item
                                                                                        }
                                                                                    >
                                                                                        SKU
                                                                                    </li>
                                                                                    <li
                                                                                        className={
                                                                                            TableClasses.item +
                                                                                            ' ' +
                                                                                            TableClasses.head_item
                                                                                        }
                                                                                    >
                                                                                        Price
                                                                                    </li>
                                                                                    <li
                                                                                        className={
                                                                                            TableClasses.item +
                                                                                            ' ' +
                                                                                            TableClasses.head_item
                                                                                        }
                                                                                    >
                                                                                        Quantity
                                                                                    </li>
                                                                                </ul>
                                                                                <div
                                                                                    className={
                                                                                        TableClasses.table_wrapper_body + ' ' + TableClasses.rma_scroll_tab
                                                                                    }
                                                                                >
                                                                                    {rmaReturnInfoItems &&
                                                                                        rmaReturnInfoItems.map(
                                                                                            item => {
                                                                                                return (
                                                                                                    <>
                                                                                                        <ul
                                                                                                            className={
                                                                                                                TableClasses.orders_row
                                                                                                            }
                                                                                                        >
                                                                                                            <li
                                                                                                                className={
                                                                                                                    TableClasses.item +
                                                                                                                    ' ' +
                                                                                                                    TableClasses.body_item
                                                                                                                }
                                                                                                            >
                                                                                                                <Checkbox
                                                                                                                    id={
                                                                                                                        item.id
                                                                                                                    }
                                                                                                                    field="selected_item"
                                                                                                                    isDisplayOwnLabel={
                                                                                                                        true
                                                                                                                    }
                                                                                                                    onClick={e => {
                                                                                                                        handleChangeChecked();
                                                                                                                        if (
                                                                                                                            e
                                                                                                                                .target
                                                                                                                                .checked
                                                                                                                        ) {
                                                                                                                            setReturnData(
                                                                                                                                {
                                                                                                                                    ...returnData,
                                                                                                                                    [item.id]: item
                                                                                                                                }
                                                                                                                            );
                                                                                                                        } else {
                                                                                                                            setReturnData(
                                                                                                                                {
                                                                                                                                    ...(delete returnData[
                                                                                                                                        item
                                                                                                                                            .id
                                                                                                                                    ] &&
                                                                                                                                        returnData)
                                                                                                                                }
                                                                                                                            );
                                                                                                                        }
                                                                                                                    }}
                                                                                                                />
                                                                                                            </li>
                                                                                                            <li
                                                                                                                mobilelabel='Thumbnail'
                                                                                                                className={
                                                                                                                    TableClasses.item +
                                                                                                                    ' ' +
                                                                                                                    TableClasses.body_item
                                                                                                                }
                                                                                                            >

                                                                                                                <img
                                                                                                                    src={
                                                                                                                        item?.image
                                                                                                                    }
                                                                                                                    alt="product_name"
                                                                                                                    className="product_image"
                                                                                                                    accept=".jpeg, .png, .jpg, .doc, .pdf, .zip"
                                                                                                                    height="100"
                                                                                                                    width="100"
                                                                                                                />
                                                                                                            </li>
                                                                                                            <li
                                                                                                                mobilelabel='Name :'
                                                                                                                className={
                                                                                                                    TableClasses.item +
                                                                                                                    ' ' +
                                                                                                                    TableClasses.body_item
                                                                                                                }
                                                                                                            >
                                                                                                                {
                                                                                                                    item.name
                                                                                                                }
                                                                                                            </li>
                                                                                                            <li
                                                                                                                mobilelabel='SKU :'
                                                                                                                className={
                                                                                                                    TableClasses.item +
                                                                                                                    ' ' +
                                                                                                                    TableClasses.body_item
                                                                                                                }
                                                                                                            >
                                                                                                                {
                                                                                                                    item.sku
                                                                                                                }
                                                                                                            </li>
                                                                                                            <li
                                                                                                                mobilelabel='Price :'
                                                                                                                className={
                                                                                                                    TableClasses.item +
                                                                                                                    ' ' +
                                                                                                                    TableClasses.body_item
                                                                                                                }
                                                                                                            >
                                                                                                                {
                                                                                                                    item.price
                                                                                                                }
                                                                                                            </li>
                                                                                                            <li
                                                                                                                mobilelabel='Quantity :'
                                                                                                                className={
                                                                                                                    TableClasses.item +
                                                                                                                    ' ' +
                                                                                                                    TableClasses.body_item
                                                                                                                }
                                                                                                            >
                                                                                                                {
                                                                                                                    item.qty_ordered
                                                                                                                }
                                                                                                            </li>
                                                                                                        </ul>
                                                                                                        {item.id === (returnData[item.id] && returnData[item.id].id) &&
                                                                                                            <ul>
                                                                                                                <Field
                                                                                                                    label="Reason*"
                                                                                                                    required={
                                                                                                                        true
                                                                                                                    }
                                                                                                                >
                                                                                                                    <Select
                                                                                                                        id={
                                                                                                                            'reason'
                                                                                                                        }
                                                                                                                        field="reason"
                                                                                                                        items={
                                                                                                                            reasonConfig
                                                                                                                                ? reasonConfig
                                                                                                                                : []
                                                                                                                        }
                                                                                                                        onChange={e => {
                                                                                                                            setReturnData(
                                                                                                                                {
                                                                                                                                    ...returnData,
                                                                                                                                    [item.id]: {
                                                                                                                                        ...returnData[
                                                                                                                                        item
                                                                                                                                            .id
                                                                                                                                        ],
                                                                                                                                        reason: reasonConfig.filter(
                                                                                                                                            i =>
                                                                                                                                                i.value ===
                                                                                                                                                e
                                                                                                                                                    .target
                                                                                                                                                    .value
                                                                                                                                        )[0]
                                                                                                                                            .value
                                                                                                                                    }
                                                                                                                                }
                                                                                                                            );
                                                                                                                            handleChangeReason(
                                                                                                                                e
                                                                                                                            );
                                                                                                                        }}
                                                                                                                        validate={value =>
                                                                                                                            isRequired(
                                                                                                                                value,
                                                                                                                                'Reason'
                                                                                                                            )
                                                                                                                        }
                                                                                                                        required={
                                                                                                                            true
                                                                                                                        }
                                                                                                                        validateOnChange
                                                                                                                    />
                                                                                                                </Field>
                                                                                                                <Field
                                                                                                                    label="Solution*"
                                                                                                                    required={
                                                                                                                        true
                                                                                                                    }
                                                                                                                >
                                                                                                                    <Select
                                                                                                                        id={
                                                                                                                            'solution'
                                                                                                                        }
                                                                                                                        field="Solution"
                                                                                                                        items={
                                                                                                                            solutionConfig
                                                                                                                                ? solutionConfig
                                                                                                                                : []
                                                                                                                        }
                                                                                                                        onChange={e => {
                                                                                                                            setReturnData(
                                                                                                                                {
                                                                                                                                    ...returnData,
                                                                                                                                    [item.id]: {
                                                                                                                                        ...returnData[
                                                                                                                                        item
                                                                                                                                            .id
                                                                                                                                        ],
                                                                                                                                        solution: solutionConfig.filter(
                                                                                                                                            i =>
                                                                                                                                                i.value ===
                                                                                                                                                e
                                                                                                                                                    .target
                                                                                                                                                    .value
                                                                                                                                        )[0]
                                                                                                                                            .value
                                                                                                                                    }
                                                                                                                                }
                                                                                                                            );
                                                                                                                            handleChangeSolution(
                                                                                                                                e
                                                                                                                            );
                                                                                                                        }}
                                                                                                                        validate={value =>
                                                                                                                            isRequired(
                                                                                                                                value,
                                                                                                                                'Solution'
                                                                                                                            )
                                                                                                                        }
                                                                                                                        required={
                                                                                                                            true
                                                                                                                        }
                                                                                                                        validateOnChange
                                                                                                                    />
                                                                                                                </Field>
                                                                                                            </ul>}
                                                                                                    </>
                                                                                                );
                                                                                            }
                                                                                        )}
                                                                                    {/* <div className="mt-2">
                                                                                        {next &&
                                                                                            rmaReturnInfoItems &&
                                                                                            rmaReturnInfoItems !=
                                                                                            undefined &&
                                                                                            rmaReturnInfoItems.length &&
                                                                                            next <
                                                                                            rmaReturnInfoItems.length && (
                                                                                                <Button
                                                                                                    type="submit"
                                                                                                    priority="high"
                                                                                                    onClick={
                                                                                                        handleMoreTransaction
                                                                                                    }
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
                                                                                            )}
                                                                                    </div> */}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        {itemReturnType &&
                                                            returnConfigValue ===
                                                            initialValueReturnConfig && (
                                                                <>
                                                                    <Field
                                                                        label="Reason*"
                                                                        required={
                                                                            true
                                                                        }
                                                                    >
                                                                        <Select
                                                                            id={
                                                                                'reason'
                                                                            }
                                                                            field="reason"
                                                                            items={
                                                                                reasonConfig
                                                                                    ? reasonConfig
                                                                                    : []
                                                                            }
                                                                            onChange={
                                                                                handleChangeReason
                                                                            }
                                                                            validate={value =>
                                                                                isRequired(
                                                                                    value,
                                                                                    'Reason'
                                                                                )
                                                                            }
                                                                            required={
                                                                                true
                                                                            }
                                                                            validateOnChange
                                                                        />
                                                                    </Field>
                                                                    <Field
                                                                        label="Solution*"
                                                                        required={
                                                                            true
                                                                        }
                                                                    >
                                                                        <Select
                                                                            id={
                                                                                'solution'
                                                                            }
                                                                            field="Solution"
                                                                            items={
                                                                                solutionConfig
                                                                                    ? solutionConfig
                                                                                    : []
                                                                            }
                                                                            onChange={
                                                                                handleChangeSolution
                                                                            }
                                                                            validate={value =>
                                                                                isRequired(
                                                                                    value,
                                                                                    'Solution'
                                                                                )
                                                                            }
                                                                            required={
                                                                                true
                                                                            }
                                                                            validateOnChange
                                                                        />
                                                                    </Field>
                                                                </>
                                                            )}

                                                    </div>
                                                    <div
                                                        className={
                                                            rmaClasses.rma_payment
                                                        }
                                                    >
                                                        <h4>
                                                            <FormattedMessage
                                                                id={
                                                                    'rma.rmacomment'
                                                                }
                                                                defaultMessage={
                                                                    'RMA Comment'
                                                                }
                                                            />
                                                        </h4>

                                                        <Field
                                                            label="Comment"
                                                        // required={true}
                                                        >
                                                            <TextArea
                                                                onChange={e => {
                                                                    setBase64({
                                                                        ...base64,
                                                                        content:
                                                                            e
                                                                                .target
                                                                                .value
                                                                    });
                                                                }}
                                                                field="comment"
                                                                autoComplete="family-name"
                                                                // validate={value =>
                                                                //     isRequired(
                                                                //         value,
                                                                //         'RMA Comment'
                                                                //     )
                                                                // }
                                                                validateOnBlur
                                                            />
                                                        </Field>
                                                        <div
                                                            className={
                                                                rmaClasses.upload_box
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    defaultClasses.add_rma_form_footer
                                                                }
                                                            >
                                                                <div>

                                                                    {/* <div>
                                                                        {imgFile?.map(file => {
                                                                            return <p>{file?.name}</p>
                                                                        })}
                                                                    </div> */}
                                                                    <p className="text-danger">
                                                                        {
                                                                            errorMsg
                                                                        }
                                                                    </p>
                                                                    <label htmlFor="upload-photo">
                                                                        {
                                                                            'Attach File'
                                                                        }
                                                                    </label>
                                                                    <input
                                                                        type="file"
                                                                        onChange={e =>
                                                                            handleFileUpload(
                                                                                e
                                                                            )
                                                                        }
                                                                        name="photo"
                                                                        id="upload-photo"
                                                                        multiple="multiple"
                                                                        accept=".jpeg, .png, .jpg, .doc, .pdf, .zip"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <p className="text-success">
                                                                Supports .jpeg,
                                                                .png, .jpg,
                                                                .pdf, .doc file
                                                                format
                                                            </p>
                                                            <div
                                                                className={
                                                                    defaultClasses.add_rma_form_footer
                                                                }
                                                            >
                                                                <Button
                                                                    type="submit"
                                                                    priority="high"
                                                                    disabled={!orderId || !initialValueReturnConfig || (returnConfigValue === 2 && Object?.values(returnData)?.length === 0) || errorMsg}
                                                                >
                                                                    <FormattedMessage
                                                                        id={
                                                                            'rma.rmasubmit'
                                                                        }
                                                                        defaultMessage={
                                                                            'Submit'
                                                                        }
                                                                    />
                                                                </Button>
                                                            </div>
                                                            {base64Files?.length !== 0 && <div className={rmaClasses.main_upload_box}>
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
                                                                            <p className={rmaClasses.file_name}>{file?.name?.slice(0, 14) + '...' + file?.name?.split('.')[1]}</p>
                                                                            <button onClick={() => handleImageClear(index)}>
                                                                                {clearIcon}
                                                                            </button>
                                                                        </div>
                                                                    )
                                                                })
                                                                }
                                                            </div>}
                                                        </div>
                                                    </div>

                                                </div>
                                                <div className="col-12">

                                                </div>
                                            </div>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                       <LoadingIndicator/>
                    )}
                </div>
            </div >
            {/* editAddress */}
        </section >
    );
}
