import React, { useState, useEffect, useRef } from 'react'

export default function Countdown(props) {
    const intervalId = useRef()
    const { second, setResetTimer, setMessage, setError, setVerifyOTP, setVerifyOTPData } = props;

    const [countdownForReset, setCountdownForReset] = useState(second);

    var minutes = Math.floor(countdownForReset / 60)
    var seconds = countdownForReset - minutes * 60;

    function str_pad_left(string, pad, length) {
        return (new Array(length + 1).join(pad) + string).slice(-length);
    }

    var finalTime = str_pad_left(minutes, '0', 2) + ':' + str_pad_left(seconds, '0', 2);

    useEffect(() => {
        intervalId.current =
            !intervalId.current &&
            setInterval(() => {
                if (countdownForReset > 0) {
                    setCountdownForReset((previousState) => previousState - 1);
                }
            }, 1000);
        return () => {
            clearInterval(intervalId.current);
        };
    }, [])

    useEffect(() => {
        if (countdownForReset === 0) {
            clearInterval(intervalId.current);
            setResetTimer(false)
            if (setMessage) {
                setMessage('')
            }
            if (setError) {
                setError('')
            }
            if (setVerifyOTP) {
                setVerifyOTP()
            }
            if (setVerifyOTPData) {
                setVerifyOTPData()
            }
        }
    }, [countdownForReset]);

    return (
        <>
            {finalTime}
        </>
    )
}
