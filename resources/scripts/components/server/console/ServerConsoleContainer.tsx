import React, { memo, useMemo, useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';
import tw from 'twin.macro';
import { ServerContext } from '@/state/server';
import Can from '@/components/elements/Can';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import CopyOnClick from '@/components/elements/CopyOnClick';
import isEqual from 'react-fast-compare';
import Spinner from '@/components/elements/Spinner';
import Features from '@feature/Features';
import Console from '@/components/server/console/Console';
import PowerButtons from '@/components/server/console/PowerButtons';
import ConsoleStatsRow from '@/components/server/console/ConsoleStatsRow';
import { Alert } from '@/components/elements/alert';
import { connectAddress } from '@/lib/formatters';

import BeforeContent from '@blueprint/components/Server/Terminal/BeforeContent';
import AfterContent from '@blueprint/components/Server/Terminal/AfterContent';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

const ServerConsoleContainer = () => {
    const isInstalling = ServerContext.useStoreState((state) => state.server.isInstalling);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const eggFeatures = ServerContext.useStoreState((state) => state.server.data!.eggFeatures, isEqual);
    const isNodeUnderMaintenance = ServerContext.useStoreState((state) => state.server.data!.isNodeUnderMaintenance);
    const address = ServerContext.useStoreState((state) => {
        const data = state.server.data!;

        return connectAddress(data.domains, data.allocations.find((allocation) => allocation.isDefault));
    });

    // Copying "X or Y" verbatim isn't useful for pasting into a game client,
    // so clicking the address always copies just the first one shown.
    const primaryAddress = useMemo(() => address.split(' or ')[0], [address]);

    const [justCopied, setJustCopied] = useState(false);
    const onAddressCopied = () => {
        setJustCopied(true);
        setTimeout(() => setJustCopied(false), 1500);
    };

    return (
        <ServerContentBlock title={'Console'} compact>
            <div
                css={tw`flex flex-col w-full min-h-[28rem]`}
                style={{ height: 'calc(100vh - var(--server-header-height, 6.25rem))', background: '#101013' }}
            >
                {(isNodeUnderMaintenance || isInstalling || isTransferring) && (
                    <Alert type={'warning'} className={'mb-2 flex-shrink-0'}>
                        {isNodeUnderMaintenance
                            ? 'The node of this server is currently under maintenance and all actions are unavailable.'
                            : isInstalling
                            ? 'This server is currently running its installation process and most actions are unavailable.'
                            : 'This server is currently being transferred to another node and all actions are unavailable.'}
                    </Alert>
                )}
                <BeforeContent />
                <div css={tw`flex flex-col flex-1 min-h-0 w-full`}>
                    <div css={tw`flex flex-wrap items-center gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0`}>
                        <div css={tw`flex items-center text-primary-500 font-medium flex-shrink-0`}>
                            <Terminal size={16} css={tw`mr-2`} />
                            <span css={tw`text-white`}>Console</span>
                        </div>
                        <CopyOnClick text={primaryAddress}>
                            <div
                                css={[
                                    tw`flex items-center min-w-0 truncate text-sm bg-surface border rounded-md px-3 py-1.5 transition-colors duration-150`,
                                    justCopied
                                        ? tw`text-green-400 border-green-500/30`
                                        : tw`text-neutral-400 border-white/10 hover:text-neutral-200 hover:border-white/20`,
                                ]}
                                title={`Click to copy ${primaryAddress}`}
                                onClick={onAddressCopied}
                            >
                                <span
                                    css={[
                                        tw`mr-2 flex-shrink-0 inline-flex transition-transform duration-200`,
                                        justCopied ? tw`scale-110` : tw`scale-100`,
                                    ]}
                                >
                                    {justCopied ? <Check size={14} /> : <Copy size={14} />}
                                </span>
                                <span css={tw`truncate font-mono`}>{address}</span>
                            </div>
                        </CopyOnClick>
                        <div css={tw`flex-1`} />
                        <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                            <PowerButtons />
                        </Can>
                    </div>
                    <div css={tw`px-4 flex-shrink-0`}>
                        <ConsoleStatsRow />
                    </div>
                    <div css={tw`px-4 flex-1 min-h-0 flex flex-col`}>
                        <Spinner.Suspense>
                            <Console />
                        </Spinner.Suspense>
                    </div>
                </div>
                <AfterContent />
            </div>
            <Features enabled={eggFeatures} />
        </ServerContentBlock>
    );
};

export default memo(ServerConsoleContainer, isEqual);
