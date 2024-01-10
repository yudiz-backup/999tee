import React, { createContext, useContext, useEffect } from 'react';

import { useAccordion } from '../../peregrine/lib/talons/Accordion/useAccordion';

import { mergeClasses } from '../../classify';
import defaultClasses from './accordion.css';

const AccordionContext = createContext();
const { Provider } = AccordionContext;

const Accordion = props => {
    const { canOpenMultiple = true, children, drawerClose } = props;

    // The talon is the source of truth for the context value.
    const talonProps = useAccordion({ canOpenMultiple, children });
    const { handleSectionToggle, openSectionIds, setOpenSectionIds } = talonProps;
    const contextValue = {
        handleSectionToggle,
        openSectionIds
    };

    useEffect(() => {
        if (drawerClose) {
            setOpenSectionIds(new Set([0]))
        }
    }, [drawerClose])

    const classes = mergeClasses(defaultClasses, props.classes);

    return (
        <Provider value={contextValue}>
            <div className={classes.root}>{children}</div>
        </Provider>
    );
};

export default Accordion;

export const useAccordionContext = () => useContext(AccordionContext);
