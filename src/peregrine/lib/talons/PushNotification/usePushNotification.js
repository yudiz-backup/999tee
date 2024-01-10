import { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client';

export const useSaveToken = props => {
    const { query } = props;
    const [saveTokenId, { data }] = useMutation(query);

    const [inProgress, setInProgress] = useState(false);
    const saveToken = useCallback(
        async ({ tokenId }) => {
            setInProgress(true);
            await saveTokenId({ variables: { tokenId } });
            setInProgress(false);
        },
        [saveTokenId]
    );
    return {
        saveToken,
        inProgress,
        tokenResponse: data
    };
};
