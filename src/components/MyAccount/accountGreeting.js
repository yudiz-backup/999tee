import React, { useState/* , useEffect */ } from 'react';
import { useAccountMenu } from '@magento/peregrine/lib/talons/Header/useAccountMenu';
import { FormattedMessage } from 'react-intl';
import { useDashboard } from '../../peregrine/lib/talons/MyAccount/useDashboard';
import defaultClasses from './myAccount.css';
import SIGN_OUT_MUTATION from '../../queries/signOut.graphql';
import profileImage from '../../queries/profileImage.graphql';
import uploadImage from '../../queries/uploadImage.graphql';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { Link } from 'src/drivers';
import { globalContext } from '../../peregrine/lib/context/global';
import { useMobile } from '../../peregrine/lib/talons/Mobile/useMobile';
import Compressor from 'compressorjs';

export default function AccountGreeting() {
    const client = useApolloClient()
    const [postImage, setPostImage] = useState('');
    const [accountMenuIsOpen, setAccountMenuIsOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState(false);
    const { mobileView } = useMobile();
    const { state } = React.useContext(globalContext);

    const MIN_FILE_SIZE = 120 // 120kB
    const MAX_FILE_SIZE = 6000 // 1MB

    useQuery(profileImage,
        {
            fetchPolicy: "no-cache",
            onCompleted: (data) => {
                setPostImage(data.getCustomerProfileData.profileImages)
            }
        }
    )

    const [customerProfile, { loading }] = useMutation(uploadImage,
        {
            onCompleted: (data) => {
                setPostImage(data.customerProfile.profileUpdatedImage)
                client.writeQuery({
                    profileImage,
                    data: {
                        getCustomerProfileData: { profileImages: data.customerProfile.profileUpdatedImage }
                    }
                })

            }
        });

    // var shortName;
    const { handleSignOut } = useAccountMenu({
        mutations: { signOut: SIGN_OUT_MUTATION },
        accountMenuIsOpen,
        setAccountMenuIsOpen
    });

    const talonProps = useDashboard();
    const { name } = talonProps;

    const createPost = async (base64) => {
        try {
            await customerProfile({ variables: { images: base64 } });
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
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
        const file = e.target.files[0];

        // Use Compressor to compress the image
        // new Compressor(file, {
        //     quality: 0.6, // Adjust the quality as needed (0.6 represents 60% quality)
        //     success(result) {
                // result is the compressed Blob object
                const base64Promise = convertToBase64(file);

                base64Promise.then((base64) => {
                    // Call your createPost function with the compressed base64 data
                    createPost(base64);

                    // Check the file size
                    const fileSizeKiloBytes = file.size / 1024;
                    const errorMessages = [];
                    if(file?.type === '' || /\.(jpeg|png|jpg)$/.test(file?.name)){
                        if (fileSizeKiloBytes < MIN_FILE_SIZE) {
                            setErrorMsg(`File size is less than ${MIN_FILE_SIZE}KB`);
                        } else if (fileSizeKiloBytes > MAX_FILE_SIZE) {
                            setErrorMsg(`File size is greater than ${MAX_FILE_SIZE / 1024} MB`);
                        } else {
                            setErrorMsg("");
                        }
                    }else {
                        errorMessages.push(`This "${file?.name}" file format is not allowed.`)
                    }
                });
            // },
            // error(error) {
            //     console.error('An error occurred while compressing the image:', error);
            // },
        // });
    };

    return (
        <>

            <div className={defaultClasses.customer_specified_details}>
                <div >
                    <div className={defaultClasses.customer_name_Fletter}>
                        <img
                            src={loading ? '/cenia-static/images/preloader.gif' :
                                postImage || '/cenia-static/images/preloader.gif'}
                            alt="profile_image"
                            className={defaultClasses.product_image}
                            height={postImage ? '60' : '10'}
                            width={postImage ? '60' : '10'}
                        />
                        <form onSubmit={handleSubmit}>
                            {mobileView ? (
                                <input
                                    type="file"
                                    label="Image"
                                    accept=".jpeg, .png, .jpg"
                                    onChange={(e) => handleFileUpload(e)}
                                    className={defaultClasses.upload_input_image}
                                    {...(mobileView ? { capture: 'camera' } : {})}
                                />
                            ) : (
                                <>
                                    <input
                                        type="file"
                                        label="Image"
                                        name="myFile"
                                        id="myFile"
                                        accept=".jpeg, .png, .jpg"
                                        onChange={(e) => handleFileUpload(e)}
                                        hidden
                                        className={defaultClasses.upload_input_image}
                                    />
                                    <label htmlFor="myFile">
                                        <img src="/cenia-static/icons/edit.svg" alt="edit-icon" width="25" height="25" />
                                    </label>
                                </>
                            )}
                        </form>
                    </div>
                    <div className={defaultClasses.greetings_cust}>
                        <p className={defaultClasses.greetings_cust_text}>
                            <FormattedMessage
                                id={'account.greetings_cust_text'}
                                defaultMessage={'Hello,'}
                            />
                        </p>
                        <p className={defaultClasses.customer_name}>{state?.loginUserDetails ? `${state?.loginUserDetails?.firstname} ${state?.loginUserDetails?.lastname}` : name}</p>
                    </div>
                </div>
                <Link to='/' className={defaultClasses.signout_btn}>
                    <button
                        onClick={handleSignOut}
                        className={defaultClasses.signout_btn}
                    >

                        <FormattedMessage
                            id={'account.signout_btn'}
                            defaultMessage={'Sign out'}
                        />
                    </button>
                </Link>
                <p className="error-message">{errorMsg}</p>
            </div>
        </>

    );
}
