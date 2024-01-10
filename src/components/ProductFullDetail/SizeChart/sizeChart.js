// import RichContent from '@magento/venia-ui/lib/components/RichContent'
import React, { /* Suspense, */ useContext } from 'react'
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { FormattedMessage } from 'react-intl';
import cedClasses from '../productFullDetail.css';
// import { clearIcon } from '../../CreateAccount/createAccount';
// import SizeChart from '../SizeChart'
// import { useSizeChartTrigger } from '../../SizeChart';
// import SizeChartSidebar from '../../SizeChart/sizechartsidebar'
import { globalContext } from '../../../peregrine/lib/context/global';
export default function SizeChart(props) {

    const { sizeChartContent } = props
    const classes = mergeClasses(cedClasses, props.classes)
    const { dispatch } = useContext(globalContext);
    // const {
    //     // hideCartTrigger,
    //     // miniCartIsOpen,
    //     // handleTriggerClick,
    //     // setMiniCartIsOpen,
    //     // miniCartRef
    // } = useSizeChartTrigger();
    return (
        <>
            <button type="button" 
                onClick={() => {
                    // handleTriggerClick()
                    dispatch({
                        type: 'SIZE_CHART_MODAL',
                        payload: {sizeChartModal : true, content: sizeChartContent}
                    })
                }} 
                className={classes.popupbtn + ' ' + "mb-0 ml-auto"} 
                data-toggle="modal" 
                data-target="#exampleModalCenter">
                <span className={classes.size_chart_text}><FormattedMessage
                    id={'sizeChart.sizeChart'}
                    defaultMessage={'Size Chart'}
                />
                </span>
                <img
                    className={classes.popupbtn_img}
                    src="/cenia-static/icons/default-chart-icon.png"
                    alt="chart"
                    height="20"
                    width="20"
                />
            </button>
            {/* <SizeChart /> */}
            {/* <Suspense fallback={null}>
                <SizeChartSidebar
                    isOpen={miniCartIsOpen}
                    setIsOpen={setMiniCartIsOpen}
                    ref={miniCartRef}
                    sizeChartContent={sizeChartContent}
                />
            </Suspense> */}
            {/* <div class={classes.add_gift_form + "  " + classes.size_chart_module + "  " + "modal fade"} id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                <div className={classes.overlay} />

                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLongTitle">
                                <FormattedMessage
                                    id={'sizeChart.sizeChart'}
                                    defaultMessage={'Size Chart'}
                                />
                            </h5>
                            <div className={'text-right mr-3'}>
                                <button
                                    type='submit'
                                    data-dismiss="modal"
                                >
                                    {clearIcon}
                                </button>
                            </div>
                        </div>
                        <div class="modal-body">
                            <RichContent html={sizeChartContent} />
                        </div>
                    </div>
                </div>
            </div> */}
        </>
    )
}
