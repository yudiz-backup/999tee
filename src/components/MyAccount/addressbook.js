import React, { useState, useEffect, useContext } from 'react';
import { shape, string } from 'prop-types';
import accountClasses from './accountinformation.css';
import defaultClasses from './myAccount.css';
// import wishlistClasses from './mywishlist.css';
import searchClasses from '../SearchPage/searchPage.css';
import Sidebar from './sidebar.js';
import { FormattedMessage } from 'react-intl';
import AdditionalAddressQuery from '../../queries/getAdditionalAddress.graphql';
import DeleteAddressMutation from '../../queries/deleteAddress.graphql';
import {
    useDashboard,
    useAdditionalAddress,
    useDeleteAddress
} from '../../peregrine/lib/talons/MyAccount/useDashboard';
import GET_CUSTOMER_QUERY from '../../queries/getCustomer.graphql';
import { Redirect, Link } from 'src/drivers';
import LoadingIndicator from '../LoadingIndicator';
import { useToasts } from '@magento/peregrine';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Title } from '../Head';
import Button from '../Button';
import { Trash as TrashIcon, Edit2 as Edit2Icon } from 'react-feather';
import Icon from '@magento/venia-ui/lib/components/Icon';
import DeleteModal from '../DeleteModal';
import { globalContext } from '../../peregrine/lib/context/global';
const editIcon = <Icon src={Edit2Icon} size={20} />;
const trashIcon = <Icon src={TrashIcon} size={20} />;

const AddressBook = props => {
    const [, { addToast }] = useToasts();
    const talons = useDashboard();
    const [removeMsg, setRemoveMsg] = useState(false);
    const [deleteModelFlag, setDeleteModelFlag] = useState(false);
    const [id, setId] = useState()
    const { dispatch } = useContext(globalContext);
    const { /* billingAddress, */ shippingAddress, isSignedIn } = talons;

    const additionalAddressData = useAdditionalAddress({
        customerQuery: GET_CUSTOMER_QUERY,
        query: AdditionalAddressQuery,
        current_page: 1,
        limit: 5
    });
    const { handleDelete, isBusy, deleteResponse } = useDeleteAddress({
        query: DeleteAddressMutation
    });

    const remove = async id => {
        await handleDelete(id);
        setDeleteModelFlag(false)
        setRemoveMsg(true);
    };

    const { addresses, refetchAddress, loadMore } = additionalAddressData;

    const loadMoreAddress = async () => {
        if (typeof addresses != 'undefined') {
            loadMore({
                current_page: addresses.current_page + 1,
                limit: addresses.limit
            });
        }
    };

    useEffect(() => {
        if (
            deleteResponse &&
            deleteResponse.deleteCustomerAddress &&
            removeMsg
        ) {
            addToast({
                type: 'info',
                message: 'Address deleted.',
                dismissable: true,
                timeout: 10000
            });
            refetchAddress();
            setRemoveMsg(false);
        }
    }, [addToast, removeMsg, deleteResponse, refetchAddress]);
    if (!isSignedIn) {
        return <Redirect to="/" />;

    }
    return (
        <div className={defaultClasses.columns}>
            {isBusy && (
                <div className={accountClasses.indicator_loader}>
                    <LoadingIndicator />
                </div>
            )}
            <div className="container-fluid">
                <Title>{`My Address Book`}</Title>
                <div className="row">
                    <div className="col-lg-12">
                        <div
                            className={
                                defaultClasses.column +
                                ' ' +
                                defaultClasses.main +
                                ' ' +
                                defaultClasses.addressbook_wrap
                            }
                        >
                            <div className={defaultClasses.account_sideBar}>
                                <Sidebar history={props.history} />
                            </div>
                            <div className={defaultClasses.account_contentBar}>
                                <div
                                    className={
                                        defaultClasses.page_title_wrapper
                                    }
                                >
                                    <h1 className={defaultClasses.page_title}>
                                        <span className={defaultClasses.base}>
                                            <FormattedMessage
                                                id={'addressBook.page_title'}
                                                defaultMessage={'Address Book'}
                                            />
                                        </span>
                                    </h1>
                                </div>

                                <div
                                    className={
                                        defaultClasses.block +
                                        ' ' +
                                        defaultClasses.block_dashboard_info
                                    }
                                >
                                    <div className={defaultClasses.block_title}>
                                        <strong>
                                            <FormattedMessage
                                                id={'addressBook.block_title'}
                                                defaultMessage={
                                                    'Default Addresses'
                                                }
                                            />{' '}
                                        </strong>
                                    </div>

                                    <div
                                        className={defaultClasses.block_content}
                                    >
                                        {/* <div
                                            className={
                                                defaultClasses.box +
                                                ' ' +
                                                defaultClasses.box_information
                                            }
                                        >
                                            <div
                                                className={
                                                    defaultClasses.box_content
                                                }
                                            >
                                                {typeof billingAddress !=
                                                    'undefined' && (
                                                        <div className={'w-100'}>
                                                            <strong
                                                                className={
                                                                    defaultClasses.box_title
                                                                }
                                                            >
                                                                <span>
                                                                    <FormattedMessage
                                                                        id={
                                                                            'addressBook.billingAddress'
                                                                        }
                                                                        defaultMessage={
                                                                            'Default Billing Addresses'
                                                                        }
                                                                    />
                                                                </span>
                                                            </strong>
                                                            <p
                                                                className={
                                                                    defaultClasses.box_content_info
                                                                }
                                                            >
                                                                {billingAddress.firstname +
                                                                    ' ' +
                                                                    billingAddress.lastname}
                                                                <br />
                                                                {
                                                                    billingAddress
                                                                        .street[0]
                                                                }
                                                                <br />
                                                                {
                                                                    billingAddress.city
                                                                }
                                                                ,{' '}
                                                                {
                                                                    billingAddress
                                                                        .region
                                                                        .region
                                                                }
                                                                ,{' '}
                                                                {
                                                                    billingAddress.postcode
                                                                }
                                                                ,{' '}
                                                                {
                                                                    billingAddress.country_id
                                                                }
                                                                <br />
                                                                Tel:{' '}
                                                                <a
                                                                    href={
                                                                        'tel:' +
                                                                        billingAddress.telephone
                                                                    }
                                                                >
                                                                    {
                                                                        billingAddress.telephone
                                                                    }
                                                                </a>
                                                            </p>
                                                            <div
                                                                className={
                                                                    defaultClasses.box_actions
                                                                }
                                                            >
                                                                <Link
                                                                    className={
                                                                        defaultClasses.action
                                                                    }
                                                                    to={
                                                                        billingAddress &&
                                                                            billingAddress.id
                                                                            ? '/address/edit/' +
                                                                            billingAddress.id
                                                                            : ''
                                                                    }
                                                                >
                                                                    <FormattedMessage
                                                                        id={
                                                                            'addressBook.changeBillingAddress'
                                                                        }
                                                                        defaultMessage={
                                                                            'Change Billing Address'
                                                                        }
                                                                    />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    )}
                                                {typeof billingAddress ==
                                                    'undefined' && (
                                                        <div
                                                            className={
                                                                searchClasses.noResult
                                                            }
                                                        >
                                                            <span
                                                                className={
                                                                    searchClasses.noResult_icon
                                                                }
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faExclamationTriangle
                                                                    }
                                                                />
                                                            </span>
                                                            <span
                                                                className={
                                                                    'ml-2' +
                                                                    ' ' +
                                                                    searchClasses.noResult_text
                                                                }
                                                            >
                                                                <FormattedMessage
                                                                    id={
                                                                        'addressBook.noBillingAddress'
                                                                    }
                                                                    defaultMessage={
                                                                        'No billing address saved!'
                                                                    }
                                                                />
                                                            </span>
                                                        </div>
                                                    )}
                                            </div>
                                        </div> */}
                                        <div
                                            className={
                                                defaultClasses.box +
                                                ' ' +
                                                defaultClasses.box_newsletter
                                            }
                                        >
                                            <div
                                                className={
                                                    defaultClasses.box_content
                                                }
                                            >
                                                {typeof shippingAddress !=
                                                    'undefined' && (
                                                        <div className={'w-100'}>
                                                            <strong
                                                                className={
                                                                    defaultClasses.box_title
                                                                }
                                                            >
                                                                <span>
                                                                    <FormattedMessage
                                                                        id={
                                                                            'addressBook.defaultShippingAddress'
                                                                        }
                                                                        defaultMessage={
                                                                            'Default Shipping Address'
                                                                        }
                                                                    />
                                                                </span>
                                                            </strong>
                                                            <p
                                                                className={
                                                                    defaultClasses.box_content_info
                                                                }
                                                            >
                                                                {shippingAddress.firstname +
                                                                    ' ' +
                                                                    shippingAddress.lastname}
                                                                <br />
                                                                {
                                                                    shippingAddress
                                                                        .street[0]
                                                                }
                                                                <br />
                                                                {
                                                                    shippingAddress.city
                                                                }
                                                                ,{' '}
                                                                {
                                                                    shippingAddress
                                                                        .region
                                                                        .region
                                                                }
                                                                ,{' '}
                                                                {
                                                                    shippingAddress.postcode
                                                                }
                                                                ,{' '}
                                                                {
                                                                    shippingAddress.country_id
                                                                }
                                                                <br />
                                                                Tel:{' '}
                                                                <a
                                                                    href={
                                                                        'tel:' +
                                                                        shippingAddress.telephone
                                                                    }
                                                                >
                                                                    {
                                                                        shippingAddress.telephone
                                                                    }
                                                                </a>
                                                            </p>
                                                            <div
                                                                className={
                                                                    defaultClasses.box_actions + ' ' + 'text-left'
                                                                }
                                                            >
                                                                <Link
                                                                    className={
                                                                        defaultClasses.change_password
                                                                    }
                                                                    to={
                                                                        shippingAddress &&
                                                                            shippingAddress.id
                                                                            ? '/address/edit/' +
                                                                            shippingAddress.id
                                                                            : ''
                                                                    }
                                                                >
                                                                    <FormattedMessage
                                                                        id={
                                                                            'addressBook.changeShippingAddress'
                                                                        }
                                                                        defaultMessage={
                                                                            'Change Shipping Address'
                                                                        }
                                                                    />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    )}
                                                {typeof shippingAddress ==
                                                    'undefined' && (
                                                        <div>
                                                            <div
                                                                className={
                                                                    searchClasses.noResult
                                                                }
                                                            >
                                                                <span
                                                                    className={
                                                                        searchClasses.noResult_icon
                                                                    }
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            faExclamationTriangle
                                                                        }
                                                                    />
                                                                </span>
                                                                <span
                                                                    className={
                                                                        'ml-2' +
                                                                        ' ' +
                                                                        searchClasses.noResult_text
                                                                    }
                                                                >
                                                                    <FormattedMessage
                                                                        id={
                                                                            'addressBook.noShippingAddress'
                                                                        }
                                                                        defaultMessage={
                                                                            'No shipping address saved!'
                                                                        }
                                                                    />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={
                                        defaultClasses.block +
                                        ' ' +
                                        defaultClasses.block_dashboard_addresses
                                    }
                                >
                                    <div className={defaultClasses.block_title}>
                                        <strong>
                                            <FormattedMessage
                                                id={
                                                    'addressBook.AdditionalAddressEntries'
                                                }
                                                defaultMessage={
                                                    'Additional Address Entries'
                                                }
                                            />
                                        </strong>
                                    </div>
                                    {addresses && addresses.item.length == 0 && (
                                        <div
                                            className={
                                                defaultClasses.block_content
                                            }
                                        >
                                            <div
                                                className={
                                                    searchClasses.noResult
                                                }
                                            >
                                                <span
                                                    className={
                                                        searchClasses.noResult_icon
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={
                                                            faExclamationTriangle
                                                        }
                                                    />
                                                </span>
                                                <span
                                                    className={
                                                        'ml-2' +
                                                        ' ' +
                                                        searchClasses.noResult_text
                                                    }
                                                >
                                                    <FormattedMessage
                                                        id={
                                                            'addressBook.noAdditionalAddressEntries'
                                                        }
                                                        defaultMessage={
                                                            'you have no additional address entries.'
                                                        }
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {addresses && addresses.item.length !== 0 && <div
                                        className={
                                            defaultClasses.table_wrapper +
                                            ' ' +
                                            defaultClasses.additional_addresses
                                        }
                                    >
                                        <div
                                            className={
                                                defaultClasses.data +
                                                ' ' +
                                                defaultClasses.table +
                                                ' ' +
                                                defaultClasses.table_additional_addresses_items +
                                                ' ' +
                                                defaultClasses.history
                                            }
                                            id="additional-addresses-table"
                                        >
                                            <div
                                                className={
                                                    defaultClasses.address_table_inner + ' ' + defaultClasses.table_wrapper_inner
                                                    + ' ' + defaultClasses.myOrder_table_wrapper
                                                }
                                            >
                                                <ul
                                                    className={
                                                        defaultClasses.table_wrapper_head
                                                    }
                                                >
                                                    <li
                                                        className={
                                                            defaultClasses.item +
                                                            ' ' +
                                                            defaultClasses.firstname
                                                        }
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'addressBook.additional-addresses-First-Name'
                                                            }
                                                            defaultMessage={
                                                                'First Name'
                                                            }
                                                        />
                                                    </li>
                                                    <li
                                                        className={
                                                            defaultClasses.item +
                                                            ' ' +
                                                            defaultClasses.lastname
                                                        }
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'addressBook.additional-addresses-Last-Name'
                                                            }
                                                            defaultMessage={
                                                                'Last Name'
                                                            }
                                                        />
                                                    </li>
                                                    <li
                                                        className={
                                                            defaultClasses.item +
                                                            ' ' +
                                                            defaultClasses.streetaddress
                                                        }
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'addressBook.additional-addresses-streetaddress'
                                                            }
                                                            defaultMessage={
                                                                'Street Address'
                                                            }
                                                        />
                                                    </li>
                                                    <li
                                                        className={
                                                            defaultClasses.item +
                                                            ' ' +
                                                            defaultClasses.city
                                                        }
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'addressBook.additional-addresses-City'
                                                            }
                                                            defaultMessage={
                                                                'City'
                                                            }
                                                        />
                                                    </li>
                                                    <li
                                                        className={
                                                            defaultClasses.item +
                                                            ' ' +
                                                            defaultClasses.country
                                                        }
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'addressBook.additional-addresses-Country'
                                                            }
                                                            defaultMessage={
                                                                'Country'
                                                            }
                                                        />
                                                    </li>
                                                    <li
                                                        className={
                                                            defaultClasses.item +
                                                            ' ' +
                                                            defaultClasses.state
                                                        }
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'addressBook.additional-addresses-State'
                                                            }
                                                            defaultMessage={
                                                                'State'
                                                            }
                                                        />
                                                    </li>
                                                    <li
                                                        className={
                                                            defaultClasses.item +
                                                            ' ' +
                                                            defaultClasses.zip
                                                        }
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'addressBook.additional-addresses-ZipCode'
                                                            }
                                                            defaultMessage={
                                                                'Pincode'
                                                            }
                                                        />
                                                    </li>
                                                    <li
                                                        className={
                                                            defaultClasses.item +
                                                            ' ' +
                                                            defaultClasses.phone
                                                        }
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'addressBook.additional-addresses-Phone'
                                                            }
                                                            defaultMessage={
                                                                'Phone'
                                                            }
                                                        />
                                                    </li>
                                                    <li
                                                        className={
                                                            defaultClasses.item +
                                                            ' ' +
                                                            defaultClasses.actions
                                                        }
                                                    >
                                                        <FormattedMessage
                                                            id={
                                                                'addressBook.additional-addresses-Action'
                                                            }
                                                            defaultMessage={
                                                                'Action'
                                                            }
                                                        />
                                                    </li>
                                                </ul>
                                                <div
                                                    className={
                                                        defaultClasses.table_wrapper_body
                                                    }
                                                >
                                                    {addresses &&
                                                        addresses.item.map(
                                                            (val, index) => {
                                                                return (
                                                                    <ul
                                                                        className={
                                                                            defaultClasses.orders_row +
                                                                            ' ' +
                                                                            defaultClasses.addresses_list
                                                                        }
                                                                        key={index}
                                                                    >
                                                                        <li
                                                                            mobilelabel="First Name"
                                                                            className={
                                                                                defaultClasses.body_item +
                                                                                ' ' +
                                                                                defaultClasses.firstname
                                                                            }
                                                                        >
                                                                            {
                                                                                val.firstname
                                                                            }
                                                                        </li>
                                                                        <li
                                                                            mobilelabel="Last Name"
                                                                            className={
                                                                                defaultClasses.body_item +
                                                                                ' ' +
                                                                                defaultClasses.lastname
                                                                            }
                                                                        >
                                                                            {
                                                                                val.lastname
                                                                            }
                                                                        </li>
                                                                        <li
                                                                            mobilelabel="Street Address"
                                                                            className={
                                                                                defaultClasses.body_item +
                                                                                ' ' +
                                                                                defaultClasses.streetaddress
                                                                            }
                                                                        >
                                                                            {
                                                                                val.street
                                                                            }
                                                                        </li>
                                                                        <li
                                                                            mobilelabel="City"
                                                                            className={
                                                                                defaultClasses.body_item +
                                                                                ' ' +
                                                                                defaultClasses.city
                                                                            }
                                                                        >
                                                                            {
                                                                                val.city
                                                                            }
                                                                        </li>
                                                                        <li
                                                                            mobilelabel="Country"
                                                                            className={
                                                                                defaultClasses.body_item +
                                                                                ' ' +
                                                                                defaultClasses.country
                                                                            }
                                                                        >
                                                                            {
                                                                                val?.country_id
                                                                            }
                                                                        </li>
                                                                        <li
                                                                            mobilelabel="State"
                                                                            className={
                                                                                defaultClasses.body_item +
                                                                                ' ' +
                                                                                defaultClasses.state
                                                                            }
                                                                        >
                                                                            {
                                                                                val.region
                                                                            }
                                                                        </li>
                                                                        <li
                                                                            mobilelabel="Pincode"
                                                                            className={
                                                                                defaultClasses.body_item +
                                                                                ' ' +
                                                                                defaultClasses.zip
                                                                            }
                                                                        >
                                                                            {
                                                                                val.postcode
                                                                            }
                                                                        </li>
                                                                        <li
                                                                            mobilelabel="Phone"
                                                                            className={
                                                                                defaultClasses.body_item +
                                                                                ' ' +
                                                                                defaultClasses.phone
                                                                            }
                                                                        >
                                                                            {
                                                                                val.telephone
                                                                            }
                                                                        </li>
                                                                        <li
                                                                            mobilelabel="Actions"
                                                                            className={
                                                                                defaultClasses.body_item +
                                                                                ' ' +
                                                                                defaultClasses.actions
                                                                            }
                                                                        >
                                                                            <div className={defaultClasses.action_btn + ' ' + defaultClasses.address_btn}>
                                                                                <Link
                                                                                    className={
                                                                                        defaultClasses.body_item_link +
                                                                                        ' ' +
                                                                                        'p-2'
                                                                                    }
                                                                                    to={
                                                                                        '/address/edit/' +
                                                                                        val.entity_id
                                                                                    }
                                                                                >
                                                                                    <Button priority='high'>
                                                                                        {/* <FormattedMessage
                                                                                    id={
                                                                                        'addressBook.additional-addresses-Edit'
                                                                                    }
                                                                                    defaultMessage={
                                                                                        'Edit'
                                                                                    }
                                                                                /> */}
                                                                                        {editIcon}
                                                                                    </Button>
                                                                                </Link>
                                                                                {/* <Link
                                                                            className={
                                                                                wishlistClasses.delete_text + ' ' + defaultClasses.body_item_link
                                                                            }
                                                                            onClick={() =>
                                                                                remove(
                                                                                    val.entity_id
                                                                                )
                                                                            }
                                                                            type='button'
                                                                        > */}
                                                                                <Button priority='high'
                                                                                    onClick={() => {
                                                                                        setDeleteModelFlag(!deleteModelFlag)
                                                                                        setId(val.entity_id)
                                                                                        dispatch({ type: "SCROLL_DISABLE", payload: { scrollDisable: true } })
                                                                                    }
                                                                                        // remove(
                                                                                        //     val.entity_id
                                                                                        // )
                                                                                    }>
                                                                                    {/* <FormattedMessage
                                                                                    id={
                                                                                        'addressBook.additional-addresses-Delete'
                                                                                    }
                                                                                    defaultMessage={
                                                                                        'Delete'
                                                                                    }
                                                                                /> */}
                                                                                    {trashIcon}
                                                                                </Button>
                                                                                {/* </Link> */}
                                                                            </div>
                                                                        </li>
                                                                    </ul>
                                                                );
                                                            }
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>}
                                    {deleteModelFlag && (
                                        <>
                                            <DeleteModal
                                                categoryFlag={deleteModelFlag}
                                                setCategoryFlag={setDeleteModelFlag}
                                                id={id}
                                                handleDeleteItem={() => remove(id)}
                                                type="addressbook"
                                            />
                                        </>
                                    )}

                                    <div className={defaultClasses.box_actions + ' ' + defaultClasses.loader_btn_content}>
                                        {typeof addresses != 'undefined' && addresses &&
                                            addresses.item.length > 0 &&
                                            addresses.current_page !==
                                            addresses.total_count
                                            ? (
                                                <Button
                                                    priority='high'
                                                    onClick={loadMoreAddress}
                                                >
                                                    <FormattedMessage
                                                        id={'global.loadMore'}
                                                        defaultMessage={'Load More'}
                                                    />
                                                </Button>

                                            ) : <span>&nbsp;</span>}
                                        <Link
                                            to="/address/new"
                                        >
                                            <Button priority='low'>
                                                <FormattedMessage
                                                    id={
                                                        'addressBook.additional-addresses-newadd_btn'
                                                    }
                                                    defaultMessage={
                                                        'Add New Address'
                                                    }
                                                />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddressBook;

AddressBook.propTypes = {
    classes: shape({
        actions: string,
        root: string,
        subtitle: string,
        title: string,
        user: string
    })
};
