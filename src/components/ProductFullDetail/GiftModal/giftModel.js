import React, { useState, useEffect } from 'react';
import { Form } from 'informed';
import cedClasses from '../productFullDetail.css';
import TextArea from '@magento/venia-ui/lib/components/TextArea';
import Field from '../../Field';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Button from '../../Button';
import { FormattedMessage } from 'react-intl';
import { useLazyQuery, useMutation } from '@apollo/client';
import wrapperCategoryData from '../../../queries/giftWarp/wrapperCategorydata.graphql'
import wrapperCategoryId from '../../../queries/giftWarp/wrapperCategoryId.graphql'
import getGiftWrapperData from '../../../queries/giftWarp/getGiftWrapperData.graphql'
import getGiftWrapperDataById from '../../../queries/giftWarp/getGiftWrapperDataById.graphql'
import setWrapperAllCart from '../../../queries/giftWarp/setWrapperAllCart.graphql'
import giftWrapSpecifiedItem from '../../../queries/giftWarp/giftWrapSpecifiedItem.graphql'
import removeWrapperCartItem from '../../../queries/giftWarp/removeWrapperCartItem.graphql'
import removeWrapperAllCart from '../../../queries/giftWarp/removeWrapperAllCart.graphql'
import Select from '../../Select';
import { Price } from '@magento/peregrine';
import { useCartContext } from '@magento/peregrine/lib/context/cart';
import { clearIcon } from '../../CreateAccount/createAccount';
import { isRequired } from '../../../util/formValidators';

export default function GiftModal(props) {
    const [{ cartId }] = useCartContext();

    const { item,
        openModal,
        setGiftWrapperData,
        setOpenModel,
        setPriceSummaryGiftWrapper,
        priceSummaryGiftWrapper,
        giftWrapperData,
        setAllCartGiftWrapper,
        allCartGiftWrapper } = props

    const classes = mergeClasses(cedClasses, props.classes)
    const [categoryId, setCategoryId] = useState()
    const [isChecked, setIsChecked] = useState()
    const [giftMeassage, setGiftMessage] = useState()

    const [wrapperCategory, { data: categoryAllData }] = useLazyQuery(wrapperCategoryData)
    const [wrapperCategoryIds, { data: categoryDataId }] = useLazyQuery(wrapperCategoryId)
    const [giftWrapperIds, { data: giftWrapperId }] = useLazyQuery(getGiftWrapperDataById)

    // const imageURL = `${process.env.MAGENTO_BACKEND_URL}/media/`
    const imageURL = `${process.env.MAGENTO_BACKEND_URL}/pub/media/`

    const [giftWrapper] = useLazyQuery(getGiftWrapperData)

    const [wrapperAllCart] = useMutation(setWrapperAllCart, {
        onCompleted: (data) => {
            localStorage.setItem("allCartGiftWrapper", JSON.stringify(data))
            setAllCartGiftWrapper(JSON.parse(localStorage.getItem("allCartGiftWrapper")))
        }
    })

    const [specifiedItem] = useMutation(giftWrapSpecifiedItem, {
        onCompleted: (data) => {
            if (data && data.mpGiftWrapWrapperSet && data.mpGiftWrapWrapperSet.item_id) {
                const otherGiftWrapperData = giftWrapperData.filter(item => item.mpGiftWrapWrapperSet.item_id !== data.mpGiftWrapWrapperSet.item_id)
                // localStorage.setItem("giftWrapper", JSON.stringify([...otherGiftWrapperData, data]))
                setGiftWrapperData([...otherGiftWrapperData, data])
            }
        }
    })

    const [removeWrapperSpecifieCartItem] = useMutation(removeWrapperCartItem, {
        onCompleted: (data) => {
            if (data && data.mpGiftWrapWrapperRemove && data.mpGiftWrapWrapperRemove.item_id) {
                const otherGiftWrapperData = giftWrapperData.filter(item => item.mpGiftWrapWrapperSet.item_id !== data.mpGiftWrapWrapperRemove.item_id)
                setGiftWrapperData(otherGiftWrapperData)
                // localStorage.setItem("giftWrapper", JSON.stringify(otherGiftWrapperData))
                // const giftWrapperStorageData = JSON.parse(localStorage.getItem("giftWrapper"))
                // if (!giftWrapperStorageData || !giftWrapperStorageData.length) {
                // localStorage.removeItem("giftWrapper")
                // }

            }
        }
    })

    const [removeAllCartWrapper] = useMutation(removeWrapperAllCart, {
        onCompleted: (data) => {
            if (data || data.length) {
                setAllCartGiftWrapper(localStorage.removeItem("allCartGiftWrapper"))
            }
        }
    })

    const categoryData = categoryAllData &&
        categoryAllData.mpGiftWrapCategories &&
        categoryAllData.mpGiftWrapCategories.items

    useEffect(() => {
        wrapperCategory()
        giftWrapper()
    }, [])

    useEffect(() => {
        if (categoryData) {
            setCategoryId(categoryData[0].category_id)
        }
    }, [categoryData])

    useEffect(() => {
        if (categoryAllData) {
            wrapperCategoryIds({
                variables: {
                    id: Number(categoryId)
                }
            })
            giftWrapperIds({
                variables: {
                    id: Number(categoryId)
                }
            })
        }
    }, [categoryAllData, categoryId])


    const handleCategoryId = (e) => {
        setCategoryId(+e.target.value)
        setIsChecked()
    }

    const handleClose = () => {
        if (priceSummaryGiftWrapper) {
            setPriceSummaryGiftWrapper(false)
        }
        setIsChecked()
        setOpenModel(false)
        setGiftMessage()
    }

    const handleSave = () => {
        if (priceSummaryGiftWrapper) {
            wrapperAllCart({
                variables: {
                    // cart_id: cartId.toString(),
                    cart_id: localStorage.getItem('cart_id'),
                    wrap_id: giftWrapperId &&
                        giftWrapperId.mpGiftWrapWrapper &&
                        parseInt(giftWrapperId.mpGiftWrapWrapper.wrap_id)
                }
            })
            setPriceSummaryGiftWrapper(false)
        } else {
            specifiedItem({
                variables: {
                    // cart_id: cartId.toString(),
                    cart_id: localStorage.getItem('cart_id'),
                    item_id: window.location.pathname === '/checkout' && item ? +item : +item.id,
                    wrap_id: giftWrapperId &&
                        giftWrapperId.mpGiftWrapWrapper &&
                        parseInt(giftWrapperId.mpGiftWrapWrapper.wrap_id),
                    message: giftMeassage || ""
                }
            })
            setGiftMessage()
        }
        setOpenModel(false)
    }

    const handleRadioButton = (e) => {
        setIsChecked(e.target.value)
    }

    const handleRemove = () => {
        if (priceSummaryGiftWrapper) {
            removeAllCartWrapper({
                variables: {
                    cart_id: localStorage.getItem('cart_id')
                }
            })
            setPriceSummaryGiftWrapper(false)
        } else {
            removeWrapperSpecifieCartItem({
                variables: {
                    cart_id: localStorage.getItem('cart_id'),
                    item_id: window.location.pathname === '/checkout' && item ? +item : +item.id,
                }
            })
        }
        setIsChecked()
        setOpenModel(false)
        setGiftMessage()

    }

    const handleMessageChange = (e) => {
        setGiftMessage(e.target.value)
    }

    const handleSubmit = () => { }

    const matchedWrapperItem = giftWrapperData &&
        giftWrapperData.find(wrapperData => wrapperData.mpGiftWrapWrapperSet.item_id === (+item || item && +item.id))
    const matchedWrapperData = matchedWrapperItem ?
        matchedWrapperItem.mpGiftWrapWrapperSet : ''
    return (
        <section>
            {openModal ? (
                <div
                    // className={classes.add_gift_form + "  " + "modal fade"}
                    className={openModal ? classes.add_gift_form + "  " + "modal fade" : null}

                    id="giftWrapper" data-backdrop="static"
                    data-keyboard="false" tabindex="-1"
                    aria-labelledby="staticBackdropLabel"
                    aria-hidden="true"
                >
                    <div className={classes.overlay} />
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="staticBackdropLabel">
                                    <FormattedMessage
                                        id={'giftModel.addgiftwarp'}
                                        defaultMessage={'Add  Gift Wrap'}
                                    />
                                </h5>
                                <div className={'text-right'}>
                                    <button
                                        type='submit'
                                        data-dismiss="modal"
                                        onClick={handleClose}
                                    >
                                        {clearIcon}
                                    </button>
                                </div>
                            </div>
                            <div className="modal-body">
                                <Form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <Field label="Category" required={true}>
                                            <Select
                                                id={categoryId}
                                                initialValue={categoryId}
                                                field="category"
                                                items={categoryData ? categoryData : []}
                                                onChange={handleCategoryId}
                                            />
                                        </Field>
                                    </div>
                                    <div className={classes.gift_image_gallery}>
                                        <div>
                                            <h3 className='heading'>
                                                {categoryDataId &&
                                                    categoryDataId.mpGiftWrapCategory &&
                                                    categoryDataId.mpGiftWrapCategory.name}
                                            </h3>
                                            <div className={classes.add_gift_images}>
                                                <div className={classes.add_gift_img_box}>
                                                    <div className="img-box">
                                                        <img
                                                            src={giftWrapperId &&
                                                                giftWrapperId.mpGiftWrapWrapper &&
                                                                giftWrapperId.mpGiftWrapWrapper.image ? `${imageURL}${giftWrapperId &&
                                                                giftWrapperId.mpGiftWrapWrapper &&
                                                                giftWrapperId.mpGiftWrapWrapper.image}` : '/cenia-static/images/preloader.gif'}
                                                            className="img-fluid"
                                                            alt={giftWrapperId &&
                                                                giftWrapperId.mpGiftWrapWrapper &&
                                                                giftWrapperId.mpGiftWrapWrapper.name}
                                                            height='300'
                                                            width='300'
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="gridRadios"
                                                                id="gridRadios1"
                                                                value="option1"
                                                                onClick={handleRadioButton}
                                                                checked={isChecked}
                                                            />
                                                            <label className="form-check-label text-capitalize" htmlFor="gridRadios1">
                                                                {giftWrapperId &&
                                                                    giftWrapperId.mpGiftWrapWrapper &&
                                                                    giftWrapperId.mpGiftWrapWrapper.name}
                                                            </label>
                                                        </div>
                                                        <span>
                                                            <Price
                                                                value={giftWrapperId &&
                                                                    giftWrapperId.mpGiftWrapWrapper &&
                                                                    giftWrapperId.mpGiftWrapWrapper.amount}
                                                                currencyCode={"INR"}
                                                            />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={classes.review_form_wrap} id="product-review-submit">
                                        <div className={classes.add_review_wrapper}>
                                            <Field
                                                label="Gift Message"
                                                required={true}>
                                                <TextArea
                                                    field="giftWrapper"
                                                    autoComplete="family-name"
                                                    validate={value => isRequired(value, 'Gift Message')}
                                                    validateOnBlur
                                                    onChange={handleMessageChange}
                                                />
                                                <span className='text-danger text-left'>120 Characters text limit</span>
                                            </Field>
                                        </div>
                                    </div>
                                    <div className="modal-footer mt-2">
                                        {((matchedWrapperData &&
                                            matchedWrapperData.item_id &&
                                            !priceSummaryGiftWrapper &&
                                            item &&
                                            ((matchedWrapperData.item_id === +item) ||
                                                (matchedWrapperData.item_id === +item.id))) ||
                                            (allCartGiftWrapper && priceSummaryGiftWrapper &&
                                                allCartGiftWrapper.mpGiftWrapWrapperSetAll &&
                                                allCartGiftWrapper.mpGiftWrapWrapperSetAll.length))
                                            &&
                                            <Button priority="high" type="remove" data-dismiss="modal" onClick={handleRemove}> Remove</Button>
                                        }
                                        <Button priority="high" type="submit" data-dismiss="modal" onClick={handleSave} > Save</Button>
                                        <Button priority="high" type="reset" data-dismiss="modal" onClick={handleClose}> Close</Button>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>) : null}
        </section>
    )
}