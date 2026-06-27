import React, { useContext, useEffect, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import Can from '@/components/elements/Can';
import CreateBackupButton from '@/components/server/backups/CreateBackupButton';
import FlashMessageRender from '@/components/FlashMessageRender';
import BackupRow from '@/components/server/backups/BackupRow';
import tw from 'twin.macro';
import getServerBackups, { Context as ServerBackupContext } from '@/api/swr/getServerBackups';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Pagination from '@/components/elements/Pagination';

import BeforeContent from '@blueprint/components/Server/Backups/BeforeContent';
import AfterContent from '@blueprint/components/Server/Backups/AfterContent';

const BackupContainer = () => {
    const { page, setPage } = useContext(ServerBackupContext);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { data: backups, error, isValidating } = getServerBackups();

    const backupLimit = ServerContext.useStoreState((state) => state.server.data!.featureLimits.backups);

    useEffect(() => {
        if (!error) {
            clearFlashes('backups');

            return;
        }

        clearAndAddHttpError({ error, key: 'backups' });
    }, [error]);

    useEffect(() => {
        const prev = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#101013';
        return () => { document.body.style.backgroundColor = prev; };
    }, []);

    if (!backups || (error && isValidating)) {
        return <Spinner size={'large'} centered />;
    }

    return (
        <ServerContentBlock title={'Backups'} compact>
            <div
                css={tw`w-full px-4 sm:px-6 pt-4 pb-8`}
                style={{ background: '#101013', minHeight: 'calc(100vh - var(--server-header-height, 6.25rem))' }}
            >
                <FlashMessageRender byKey={'backups'} css={tw`mb-4`} />
                <BeforeContent />
                <Pagination data={backups} onPageSelect={setPage}>
                    {({ items }) =>
                        !items.length ? (
                            // Don't show any error messages if the server has no backups and the user cannot
                            // create additional ones for the server.
                            !backupLimit ? null : (
                                <p css={tw`text-center text-sm text-neutral-400`}>
                                    {page > 1
                                        ? "Looks like we've run out of backups to show you, try going back a page."
                                        : 'It looks like there are no backups currently stored for this server.'}
                                </p>
                            )
                        ) : (
                            <div css={tw`flex flex-col gap-2`}>
                                {items.map((backup) => (
                                    <BackupRow key={backup.uuid} backup={backup} />
                                ))}
                            </div>
                        )
                    }
                </Pagination>
                {backupLimit === 0 && (
                    <p css={tw`text-center text-sm text-neutral-400`}>
                        Backups cannot be created for this server because the backup limit is set to 0.
                    </p>
                )}
                <Can action={'backup.create'}>
                    <div css={tw`mt-6 sm:flex items-center justify-end`}>
                        {backupLimit > 0 && backups.backupCount > 0 && (
                            <p css={tw`text-sm text-neutral-400 mb-4 sm:mr-6 sm:mb-0`}>
                                {backups.backupCount} of {backupLimit} backups have been created for this server.
                            </p>
                        )}
                        {backupLimit > 0 && backupLimit > backups.backupCount && (
                            <CreateBackupButton css={tw`w-full sm:w-auto`} />
                        )}
                    </div>
                </Can>
                <AfterContent />
            </div>
        </ServerContentBlock>
    );
};

export default () => {
    const [page, setPage] = useState<number>(1);
    return (
        <ServerBackupContext.Provider value={{ page, setPage }}>
            <BackupContainer />
        </ServerBackupContext.Provider>
    );
};
