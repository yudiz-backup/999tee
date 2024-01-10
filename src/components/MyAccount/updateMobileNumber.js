
import React from 'react'
import { Title } from '../Head'
import jobBorad from '../JobBoard/jobBorad.css';
import Sidebar from './sidebar'
import TableClasses from './myAccount.css';
import defaultClasses from '../RewardPoint/rewardPoint.css';
import accountClasses from './accountinformation.css';
import { Form } from 'informed';
import Field from '@magento/venia-ui/lib/components/Field';
import TextInput from '@magento/venia-ui/lib/components/TextInput';
import Button from '@magento/venia-ui/lib/components/Button';


export default function UpdateMobileNumber(props) {

    return (
        <section className={defaultClasses.rewardPoint_page}>
            <Title>{`Update Mobile Number}`}</Title>
            <div className={TableClasses.columns}>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className={TableClasses.column + ' ' + TableClasses.main} >
                                <div className={TableClasses.account_sideBar}>
                                    <Sidebar history={props.history} />
                                </div>
                                <div className={TableClasses.account_contentBar}>
                                    <div className={TableClasses.page_title_wrapper + ' ' + jobBorad.rma_title_wrapper}>
                                        <h1 className={TableClasses.page_title}>
                                            <span className={TableClasses.base}>Update Mobile Number</span>
                                        </h1>
                                    </div>
                                    <div className={TableClasses.block + ' ' + TableClasses.block_dashboard_orders}>

                                        <Form className={accountClasses.account_form_inner}>
                                            <div className="row">
                                                <div className={accountClasses.field_inner_wrap + ' ' + 'col-lg-5 col-md-8'}>
                                                    <div className={TableClasses.input_group_number + ' ' + "input-group mb-1"}>
                                                        <div className="input-group-prepend">
                                                            <button className="btn btn-outline-secondary" type="button">+91</button>
                                                        </div>
                                                        <input type="text" className="form-control" aria-label="Text input with dropdown button" />
                                                    </div>
                                                    <Field label={'Mobile No: Without Country Code i.e 9898989898'} />
                                                </div>
                                                <div className='col-lg-7 col-md-4'></div>
                                                <div className={accountClasses.field_inner_wrap + ' ' + 'col-lg-5 col-md-8'}>
                                                    <TextInput field="firstname" autoComplete="given-name" validateOnBlur />
                                                </div>
                                                <div className='col-lg-7 col-md-4'></div>

                                            </div>

                                            <div className={TableClasses.edit_acc_btn + ' ' + TableClasses.button_group}>
                                                <Button type="submit" priority="high">Get OTP</Button>
                                                <Button type="submit" priority="high">Update Mobile Number</Button>
                                            </div>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </section >
    )
}
