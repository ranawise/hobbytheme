import React from 'react';
import { Archive, Lock, MoreVertical } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Spinner from '@/components/elements/Spinner';
import { bytesToString } from '@/lib/formatters';
import Can from '@/components/elements/Can';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import BackupContextMenu from '@/components/server/backups/BackupContextMenu';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import getServerBackups from '@/api/swr/getServerBackups';
import { ServerBackup } from '@/api/server/types';
import { SocketEvent } from '@/components/server/events';

interface Props {
    backup: ServerBackup;
    className?: string;
}

const Row = styled.div`
    ${tw`flex flex-wrap md:flex-nowrap items-center gap-4 rounded-lg border border-white/10 bg-surface px-4 py-3 transition-colors duration-150`};

    &:hover {
        ${tw`border-white/20`};
    }
`;

export default ({ backup, className }: Props) => {
    const { mutate } = getServerBackups();

    useWebsocketEvent(`${SocketEvent.BACKUP_COMPLETED}:${backup.uuid}` as SocketEvent, (data) => {
        try {
            const parsed = JSON.parse(data);

            mutate(
                (data) => ({
                    ...data,
                    items: data.items.map((b) =>
                        b.uuid !== backup.uuid
                            ? b
                            : {
                                  ...b,
                                  isSuccessful: parsed.is_successful || true,
                                  checksum: (parsed.checksum_type || '') + ':' + (parsed.checksum || ''),
                                  bytes: parsed.file_size || 0,
                                  completedAt: new Date(),
                              }
                    ),
                }),
                false
            );
        } catch (e) {
            console.warn(e);
        }
    });

    return (
        <Row className={className}>
            <div css={tw`flex items-center truncate w-full md:flex-1`}>
                <div css={tw`mr-4 flex-shrink-0 flex items-center justify-center w-5`}>
                    {backup.completedAt !== null ? (
                        backup.isLocked ? (
                            <Lock size={16} css={tw`text-yellow-500`} />
                        ) : (
                            <Archive size={16} css={tw`text-neutral-500`} />
                        )
                    ) : (
                        <Spinner size={'small'} />
                    )}
                </div>
                <div css={tw`flex flex-col truncate`}>
                    <div css={tw`flex items-center text-sm mb-1`}>
                        {backup.completedAt !== null && !backup.isSuccessful && (
                            <span
                                css={tw`bg-red-500/10 text-red-400 py-0.5 px-2 rounded-full text-xs font-medium uppercase mr-2 flex-shrink-0`}
                            >
                                Failed
                            </span>
                        )}
                        {backup.isDaily && (
                            <span
                                css={tw`bg-primary-500/10 text-primary-400 py-0.5 px-2 rounded-full text-xs font-medium uppercase mr-2 flex-shrink-0`}
                            >
                                Daily
                            </span>
                        )}
                        <p css={tw`break-words truncate text-neutral-200`}>{backup.name}</p>
                        {backup.completedAt !== null && backup.isSuccessful && (
                            <span css={tw`ml-3 text-neutral-500 text-xs hidden sm:inline flex-shrink-0`}>
                                {bytesToString(backup.bytes)}
                            </span>
                        )}
                    </div>
                    <p css={tw`mt-1 md:mt-0 text-xs text-neutral-500 font-mono truncate`}>{backup.checksum}</p>
                </div>
            </div>
            <div css={tw`flex-1 md:flex-none md:w-48 md:ml-8 md:text-center`}>
                <p title={format(backup.createdAt, 'ddd, MMMM do, yyyy HH:mm:ss')} css={tw`text-sm text-neutral-300`}>
                    {formatDistanceToNow(backup.createdAt, { includeSeconds: true, addSuffix: true })}
                </p>
                <p css={tw`text-2xs text-neutral-500 uppercase mt-1`}>Created</p>
            </div>
            <Can action={['backup.download', 'backup.restore', 'backup.delete']} matchAny>
                <div css={tw`ml-2 flex-shrink-0`}>
                    {!backup.completedAt ? (
                        <div css={tw`p-2 invisible`}>
                            <MoreVertical size={16} />
                        </div>
                    ) : (
                        <BackupContextMenu backup={backup} />
                    )}
                </div>
            </Can>
        </Row>
    );
};
