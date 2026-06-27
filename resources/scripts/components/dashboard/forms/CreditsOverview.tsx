import React, { useState } from 'react';
import useSWR from 'swr';
import tw from 'twin.macro';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Button } from '@/components/elements/button/index';
import { useFlashKey } from '@/plugins/useFlash';
import { buyFreeServerSlot, getFreeServerData } from '@/api/account/freeServer';

export default () => {
    const { clearAndAddHttpError, clearFlashes } = useFlashKey('account:credits');
    const [loading, setLoading] = useState(false);
    const { data, mutate } = useSWR('/api/client/account/free-server', getFreeServerData);

    if (!data) {
        return null;
    }

    const buySlot = () => {
        clearFlashes();
        setLoading(true);
        buyFreeServerSlot()
            .then(({ credits, freeServerSlots }) => {
                mutate((prev) => (prev ? { ...prev, credits, freeServerSlots } : prev), false);
            })
            .catch((error) => clearAndAddHttpError(error))
            .then(() => setLoading(false));
    };

    return (
        <div css={tw`relative`}>
            <SpinnerOverlay visible={loading} />
            <p css={tw`text-sm text-neutral-300`}>
                Credit balance: <strong>{data.displayCredits.toLocaleString()}</strong>
            </p>
            {data.enabled && (
                <>
                    <p css={tw`text-sm text-neutral-300 mt-2`}>
                        Free server slots: <strong>{data.freeServerCount}</strong>/
                        <strong>{data.freeServerSlots}</strong> used
                    </p>
                    <Button css={tw`mt-6`} disabled={loading || data.credits < data.slotCost} onClick={buySlot}>
                        Buy a Server Slot ({data.slotCost} Credits)
                    </Button>
                </>
            )}
        </div>
    );
};
