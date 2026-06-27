import React, { useEffect, useState } from 'react';
import { httpErrorToHuman } from '@/api/http';
import { CSSTransition } from 'react-transition-group';
import { Plus, UploadCloud, RefreshCw, FolderPlus, FilePlus } from 'lucide-react';
import Spinner from '@/components/elements/Spinner';
import FileObjectRow from '@/components/server/files/FileObjectRow';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import { FileObject } from '@/api/server/files/loadDirectory';
import NewDirectoryButton from '@/components/server/files/NewDirectoryButton';
import { useHistory, useLocation } from 'react-router-dom';
import Can from '@/components/elements/Can';
import { ServerError } from '@/components/elements/ScreenBlock';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { ServerContext } from '@/state/server';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import FileManagerStatus from '@/components/server/files/FileManagerStatus';
import MassActionsBar from '@/components/server/files/MassActionsBar';
import UploadButton from '@/components/server/files/UploadButton';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { useStoreActions } from '@/state/hooks';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { FileActionCheckbox } from '@/components/server/files/SelectFileCheckbox';
import { hashToPath } from '@/helpers';
import Dropdown from '@/components/elements/dropdown/Dropdown';

import BeforeContent from '@blueprint/components/Server/Files/Browse/BeforeContent';
import FileButtons from '@blueprint/components/Server/Files/Browse/FileButtons';
import AfterContent from '@blueprint/components/Server/Files/Browse/AfterContent';

const sortFiles = (files: FileObject[]): FileObject[] => {
    const sortedFiles: FileObject[] = files
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => (a.isFile === b.isFile ? 0 : a.isFile ? 1 : -1));
    return sortedFiles.filter((file, index) => index === 0 || file.name !== sortedFiles[index - 1].name);
};

const ToolbarIconButton = styled.button`
    ${tw`flex items-center justify-center w-8 h-8 rounded-md text-neutral-400 transition-colors duration-150`};

    &:hover {
        ${tw`bg-white/5 text-neutral-200`};
    }
`;

export default () => {
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const history = useHistory();
    const { hash } = useLocation();
    const { data: files, error, mutate } = useFileManagerSwr();
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const clearFlashes = useStoreActions((actions) => actions.flashes.clearFlashes);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);

    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);
    const selectedFilesLength = ServerContext.useStoreState((state) => state.files.selectedFiles.length);

    const [showNewDirectory, setShowNewDirectory] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const prev = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#101013';
        return () => { document.body.style.backgroundColor = prev; };
    }, []);

    useEffect(() => {
        clearFlashes('files');
        setSelectedFiles([]);
        setDirectory(hashToPath(hash));
    }, [hash]);

    useEffect(() => {
        mutate();
    }, [directory]);

    const onSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(e.currentTarget.checked ? files?.map((file) => file.name) || [] : []);
    };

    const onRefreshClick = () => {
        setRefreshing(true);
        mutate().finally(() => setRefreshing(false));
    };

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} onRetry={() => mutate()} />;
    }

    return (
        <ServerContentBlock title={'File Manager'} showFlashKey={'files'} compact>
            <div
                css={tw`w-full pt-4 pb-8`}
                style={{ background: '#101013', minHeight: 'calc(100vh - var(--server-header-height, 6.25rem))' }}
            >
                <ErrorBoundary>
                    <BeforeContent />
                    <NewDirectoryButton open={showNewDirectory} onClose={() => setShowNewDirectory(false)} />
                    <div css={tw`flex flex-wrap items-center justify-between gap-3 mb-4 px-4 sm:px-6`}>
                        <FileManagerBreadcrumbs />
                        <Can action={'file.create'}>
                            <div css={tw`flex items-center gap-1 flex-shrink-0`}>
                                <FileManagerStatus />
                                <FileButtons />
                                <Dropdown>
                                    <Dropdown.Button className={'!px-0 !py-0 !w-8 !h-8'}>
                                        <Plus size={16} css={tw`m-auto`} />
                                    </Dropdown.Button>
                                    <Dropdown.Item
                                        icon={<FolderPlus className={'w-4 h-4'} />}
                                        onClick={() => setShowNewDirectory(true)}
                                    >
                                        New Folder
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        icon={<FilePlus className={'w-4 h-4'} />}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            history.push(`/server/${id}/files/new${window.location.hash}`);
                                        }}
                                    >
                                        New File
                                    </Dropdown.Item>
                                </Dropdown>
                                <UploadButton
                                    customTrigger={(onClick) => (
                                        <ToolbarIconButton type={'button'} onClick={onClick} title={'Upload'}>
                                            <UploadCloud size={16} />
                                        </ToolbarIconButton>
                                    )}
                                />
                                <ToolbarIconButton type={'button'} onClick={onRefreshClick} title={'Refresh'}>
                                    <RefreshCw size={16} css={refreshing ? tw`animate-spin` : undefined} />
                                </ToolbarIconButton>
                            </div>
                        </Can>
                    </div>
                </ErrorBoundary>
                {!files ? (
                    <Spinner size={'large'} centered />
                ) : (
                    <>
                        {!files.length ? (
                            <p css={tw`text-sm text-neutral-400 text-center px-4 sm:px-6`}>
                                This directory seems to be empty.
                            </p>
                        ) : (
                            <CSSTransition classNames={'fade'} timeout={150} appear in>
                                <div>
                                    {files.length > 250 && (
                                        <div
                                            css={tw`rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-2 mx-4 sm:mx-6 p-3`}
                                        >
                                            <p css={tw`text-yellow-300 text-sm text-center`}>
                                                This directory is too large to display in the browser, limiting the
                                                output to the first 250 files.
                                            </p>
                                        </div>
                                    )}
                                    <div
                                        css={tw`flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-neutral-600 border-b border-white/10 px-4 sm:px-6 py-2`}
                                        style={{ background: 'rgba(255,255,255,0.025)' }}
                                    >
                                        <div css={tw`flex-none w-5 h-5 flex items-center justify-center`}>
                                            <FileActionCheckbox
                                                type={'checkbox'}
                                                checked={
                                                    selectedFilesLength === (files?.length === 0 ? -1 : files?.length)
                                                }
                                                onChange={onSelectAllClick}
                                            />
                                        </div>
                                        <div css={tw`flex-none mr-3 w-4`} />
                                        <div css={tw`flex-1`}>Name</div>
                                        <div css={tw`w-24 text-right flex-shrink-0 hidden sm:block`}>Size</div>
                                        <div css={tw`w-32 text-right flex-shrink-0 hidden md:block`}>Modified</div>
                                        <div css={tw`w-10 text-right flex-shrink-0`}>Actions</div>
                                    </div>
                                    {sortFiles(files.slice(0, 250)).map((file) => (
                                        <FileObjectRow key={file.key} file={file} />
                                    ))}
                                    <MassActionsBar />
                                </div>
                            </CSSTransition>
                        )}
                    </>
                )}
                <AfterContent />
            </div>
        </ServerContentBlock>
    );
};
