import React, { useState } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { LogOut } from 'lucide-react';
import MinecraftAvatar from './MinecraftAvatar';
import { ServerContext } from '@/state/server';
import { Dialog } from '@/components/elements/dialog';
import NoteButton from './NoteButton';

interface Props {
    username: string;
    note: string;
    onNoteChange: (note: string) => void;
}

const Row = styled.div`
    ${tw`flex items-center gap-4 rounded-lg border border-white/10 bg-surface px-4 py-3 transition-colors duration-150`};
    &:hover { ${tw`border-white/20`}; }
`;

const IconButton = styled.button`
    ${tw`flex items-center justify-center w-8 h-8 rounded-md text-neutral-400 transition-colors duration-150`};
    &:hover { ${tw`bg-red-500/10 text-red-400`}; }
`;

export default ({ username, note, onNoteChange }: Props) => {
    const { instance } = ServerContext.useStoreState((state) => state.socket);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const kick = () => {
        instance?.send('send command', `kick ${username}`);
        setConfirmOpen(false);
    };

    return (
        <Row>
            <Dialog.Confirm
                open={confirmOpen}
                title={`Kick ${username}?`}
                confirm={'Kick Player'}
                onClose={() => setConfirmOpen(false)}
                onConfirmed={kick}
            >
                This will disconnect <strong>{username}</strong> from the server.
            </Dialog.Confirm>
            <MinecraftAvatar username={username} size={36} />
            <div css={tw`flex-1 min-w-0`}>
                <p css={tw`text-sm font-medium text-neutral-200 truncate`}>{username}</p>
                <p css={tw`text-xs text-neutral-500 mt-0.5`}>Online</p>
            </div>
            <NoteButton username={username} note={note} onChange={onNoteChange} />
            <IconButton
                type={'button'}
                title={'Disconnect player'}
                onClick={() => setConfirmOpen(true)}
            >
                <LogOut size={15} />
            </IconButton>
        </Row>
    );
};
