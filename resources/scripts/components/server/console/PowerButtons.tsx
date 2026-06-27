import React, { useEffect, useState } from 'react';
import { Play, Square, RotateCcw, Zap } from 'lucide-react';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import Can from '@/components/elements/Can';
import { ServerContext } from '@/state/server';
import { PowerAction } from '@/components/server/console/ServerConsoleContainer';
import { Dialog } from '@/components/elements/dialog';

import AdditionalPowerButtons from '@blueprint/components/Server/Terminal/AdditionalPowerButtons';

interface PowerButtonProps {
    className?: string;
}

const ToolbarButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
    ${tw`flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-sm text-neutral-300 transition-colors duration-150`};

    &:hover:not(:disabled) {
        ${tw`bg-white/5 text-neutral-100`};
    }

    &:disabled {
        ${tw`opacity-40 cursor-not-allowed`};
    }

    ${(props) =>
        props.$variant === 'primary' &&
        tw`border-primary-600/60 text-primary-400 hover:bg-primary-500/10 hover:text-primary-300`};

    ${(props) =>
        props.$variant === 'danger' && tw`border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300`};
`;

export default ({ className }: PowerButtonProps) => {
    const [open, setOpen] = useState(false);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);

    const killable = status === 'stopping';
    const onButtonClick = (
        action: PowerAction | 'kill-confirmed',
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ): void => {
        e.preventDefault();
        if (action === 'kill') {
            return setOpen(true);
        }

        if (instance) {
            setOpen(false);
            instance.send('set state', action === 'kill-confirmed' ? 'kill' : action);
        }
    };

    useEffect(() => {
        if (status === 'offline') {
            setOpen(false);
        }
    }, [status]);

    return (
        <div className={className} css={tw`flex items-center gap-2`}>
            <Dialog.Confirm
                open={open}
                hideCloseIcon
                onClose={() => setOpen(false)}
                title={'Forcibly Stop Process'}
                confirm={'Continue'}
                onConfirmed={onButtonClick.bind(this, 'kill-confirmed')}
            >
                Forcibly stopping a server can lead to data corruption.
            </Dialog.Confirm>
            <AdditionalPowerButtons />
            <Can action={'control.start'}>
                <ToolbarButton
                    type={'button'}
                    $variant={'primary'}
                    disabled={status !== 'offline'}
                    onClick={onButtonClick.bind(this, 'start')}
                >
                    <Play size={14} />
                    Start
                </ToolbarButton>
            </Can>
            <Can action={'control.restart'}>
                <ToolbarButton type={'button'} disabled={!status} onClick={onButtonClick.bind(this, 'restart')}>
                    <RotateCcw size={14} />
                    Restart
                </ToolbarButton>
            </Can>
            <Can action={'control.stop'}>
                <ToolbarButton
                    type={'button'}
                    $variant={'danger'}
                    disabled={status === 'offline'}
                    onClick={onButtonClick.bind(this, killable ? 'kill' : 'stop')}
                >
                    {killable ? <Zap size={14} /> : <Square size={14} />}
                    {killable ? 'Kill' : 'Stop'}
                </ToolbarButton>
            </Can>
        </div>
    );
};
