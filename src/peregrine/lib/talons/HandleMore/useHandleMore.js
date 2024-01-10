import React, { useState, useRef } from 'react'

export const useHandleMore = () => {
    const [seeMore, setSeeMore] = useState([])
    const colorLength = useRef()

    const handleMoreColor = (id, e) => {
        e?.stopPropagation()
        setSeeMore(prev => [...prev, id])
    }

    return {
        seeMore,
        handleMoreColor,
        colorLength
    };
};