import React, { useEffect, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import { useFlashKey } from '@/plugins/useFlash';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { ServerContext } from '@/state/server';
import AllocationRow from '@/components/server/network/AllocationRow';
import Button from '@/components/elements/Button';
import createServerAllocation from '@/api/server/network/createServerAllocation';
import tw from 'twin.macro';
import Can from '@/components/elements/Can';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import getServerAllocations from '@/api/swr/getServerAllocations';
import isEqual from 'react-fast-compare';
import { useDeepCompareEffect } from '@/plugins/useDeepCompareEffect';

import BeforeContent from '@blueprint/components/Server/Network/BeforeContent';
import AfterContent from '@blueprint/components/Server/Network/AfterContent';

const NetworkContainer = () => {
    const [loading, setLoading] = useState(false);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const allocationLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.allocations);
    const allocations = ServerContext.useStoreState((state) => state.server.data!.allocations, isEqual);
    const setServerFromState = ServerContext.useStoreActions((actions) => actions.server.setServerFromState);

    const { clearFlashes, clearAndAddHttpError } = useFlashKey('server:network');
    const { data, error, mutate } = getServerAllocations();

    useEffect(() => {
        const prev = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#101013';
        return () => { document.body.style.backgroundColor = prev; };
    }, []);

    useEffect(() => {
        mutate(allocations);
    }, []);

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    useDeepCompareEffect(() => {
        if (!data) return;

        setServerFromState((state) => ({ ...state, allocations: data }));
    }, [data]);

    const onCreateAllocation = () => {
        clearFlashes();

        setLoading(true);
        createServerAllocation(uuid)
            .then((allocation) => {
                setServerFromState((s) => ({ ...s, allocations: s.allocations.concat(allocation) }));
                return mutate(data?.concat(allocation), false);
            })
            .catch((error) => clearAndAddHttpError(error))
            .then(() => setLoading(false));
    };

    return (
        <ServerContentBlock showFlashKey={'server:network'} title={'Network'} compact>
            <div
                css={tw`w-full px-4 sm:px-6 pt-4 pb-8`}
                style={{ background: '#101013', minHeight: 'calc(100vh - var(--server-header-height, 6.25rem))' }}
            >
                {!data ? (
                    <Spinner size={'large'} centered />
                ) : (
                    <>
                        <BeforeContent />
                        <div css={tw`flex flex-col gap-2`}>
                            {data.map((allocation) => (
                                <AllocationRow key={`${allocation.ip}:${allocation.port}`} allocation={allocation} />
                            ))}
                        </div>
                        {allocationLimit > 0 && (
                            <Can action={'allocation.create'}>
                                <SpinnerOverlay visible={loading} />
                                <div css={tw`mt-6 sm:flex items-center justify-end`}>
                                    <p css={tw`text-sm text-neutral-400 mb-4 sm:mr-6 sm:mb-0`}>
                                        You are currently using {data.length} of {allocationLimit} allowed allocations
                                        for this server.
                                    </p>
                                    {allocationLimit > data.length && (
                                        <Button
                                            css={tw`w-full sm:w-auto`}
                                            color={'primary'}
                                            onClick={onCreateAllocation}
                                        >
                                            Create Allocation
                                        </Button>
                                    )}
                                </div>
                            </Can>
                        )}
                        <AfterContent />
                    </>
                )}
            </div>
        </ServerContentBlock>
    );
};

export default NetworkContainer;
