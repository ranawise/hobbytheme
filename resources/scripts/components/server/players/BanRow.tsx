import React, { useState } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { ShieldX } from 'lucide-react';
import MinecraftAvatar from './MinecraftAvatar';
import { ServerContext } from '@/state/server';
import { Dialog } from '@/components/elements/dialog';
import NoteButton from './NoteButton';
import getFileContents from '@/api/server/files/getFileContents';
import saveFileContents from '@/api/server/files/saveFileContents';

interface Props {
    username: string;
    reason?: string;
    note: string;
    onNoteChange: (note: string) => void;
    onRemoved: (username: string) => void;
}

const Row = styled.div`
    ${tw`flex items-center gap-4 rounded-lg border border-white/10 bg-surface px-4 py-3 transition-colors duration-150`};
    &:hover { ${tw`border-white/20`}; }
`;

const IconButton = styled.button`
    ${tw`flex items-center justify-center w-8 h-8 rounded-md text-neutral-400 transition-colors duration-150`};
    &:hover { ${tw`bg-red-500/10 text-red-400`}; }
`;

export default ({ username, reason, note, onNoteChange, onRemoved }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const unban = () => {
        getFileContents(uuid, '/banned-players.json')
            .then((raw) => {
                const data: Array<Record<string, unknown>> = JSON.parse(raw);
                const updated = data.filter((p) => String(p.name).toLowerCase() !== username.toLowerCase());
                return saveFileContents(uuid, '/banned-players.json', JSON.stringify(updated, null, 2));
            })
            .then(() => onRemoved(username))
            .catch(console.error)
            .finally(() => setConfirmOpen(false));
    };

    return (
        <Row>
            <Dialog.Confirm
                open={confirmOpen}
                title={`Unban ${username}?`}
                confirm={'Unban Player'}
                onClose={() => setConfirmOpen(false)}
                onConfirmed={unban}
            >
                <strong>{username}</strong> will be able to join the server again.
            </Dialog.Confirm>
            <MinecraftAvatar username={username} size={36} />
            <div css={tw`flex-1 min-w-0`}>
                <p css={tw`text-sm font-medium text-neutral-200 truncate`}>{username}</p>
                <p css={tw`text-xs text-red-400/70 mt-0.5`}>{reason || 'Banned'}</p>
            </div>
            <NoteButton username={username} note={note} onChange={onNoteChange} />
            <IconButton type={'button'} title={'Unban player'} onClick={() => setConfirmOpen(true)}>
                <ShieldX size={15} />
            </IconButton>
        </Row>
    );
};
