import React, { useEffect, useRef, useState } from 'react';
import getFileContents from '@/api/server/files/getFileContents';
import { httpErrorToHuman } from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import saveFileContents from '@/api/server/files/saveFileContents';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import { useHistory, useLocation, useParams } from 'react-router';
import FileNameModal from '@/components/server/files/FileNameModal';
import Can from '@/components/elements/Can';
import FlashMessageRender from '@/components/FlashMessageRender';
import { ServerError } from '@/components/elements/ScreenBlock';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { encodePathSegments, hashToPath } from '@/helpers';
import { dirname } from 'pathe';
import MonacoEditor from '@/components/elements/MonacoEditor';
import PowerButtons from '@/components/server/console/PowerButtons';
import Console from '@/components/server/console/Console';
import { Terminal, X, Save, FilePlus, ChevronDown, ArrowLeft, Check } from 'lucide-react';

import BeforeEdit from '@blueprint/components/Server/Files/Edit/BeforeEdit';
import AfterEdit from '@blueprint/components/Server/Files/Edit/AfterEdit';

/* ── styled ── */

const Toolbar = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px;
    height: 52px;
    background: #0c0c0f;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    flex-shrink: 0;
    overflow: hidden;
`;


const SaveBtn = styled.button<{ $saved?: boolean }>`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
    background: ${(p) => p.$saved ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.08)'};
    border: 1px solid ${(p) => p.$saved ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.12)'};
    color: ${(p) => p.$saved ? '#4ade80' : '#e4e4e7'};
    white-space: nowrap;
    flex-shrink: 0;

    &:hover { background: ${(p) => p.$saved ? 'rgba(74,222,128,0.16)' : 'rgba(255,255,255,0.13)'}; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const ConsoleToggle = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    border: 1px solid ${(p) => p.$active ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.1)'};
    background: ${(p) => p.$active ? 'rgba(96,165,250,0.08)' : 'rgba(255,255,255,0.04)'};
    color: ${(p) => p.$active ? '#93c5fd' : '#71717a'};
    white-space: nowrap;
    flex-shrink: 0;

    &:hover {
        border-color: ${(p) => p.$active ? 'rgba(96,165,250,0.6)' : 'rgba(255,255,255,0.18)'};
        color: ${(p) => p.$active ? '#bfdbfe' : '#e4e4e7'};
    }
`;

const BackBtn = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: #71717a;
    flex-shrink: 0;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;

    &:hover { background: rgba(255,255,255,0.09); color: #e4e4e7; border-color: rgba(255,255,255,0.18); }
`;

const ToolbarDivider = styled.div`
    width: 1px;
    height: 20px;
    background: rgba(255,255,255,0.08);
    flex-shrink: 0;
    margin: 0 2px;
`;

const SaveGlow = styled.div`
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    box-shadow: inset 0 0 0 3px #4ade80, inset 0 0 40px rgba(74,222,128,0.15);
    animation: saveGlowFade 2.5s ease-in-out forwards;

    @keyframes saveGlowFade {
        0%   { opacity: 0; }
        15%  { opacity: 1; }
        65%  { opacity: 1; }
        100% { opacity: 0; }
    }
`;

const ConsoleDrawer = styled.div`
    display: flex;
    flex-direction: column;
    border-top: 1px solid rgba(255,255,255,0.07);
    flex-shrink: 0;
    overflow: hidden;
`;

const ConsoleHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    background: #0c0c0f;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
`;

const StatusDot = styled.span<{ $status: string }>`
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    background: ${(p) => {
        switch (p.$status) {
            case 'running': return '#4ade80';
            case 'starting': case 'stopping': return '#fbbf24';
            default: return '#52525b';
        }
    }};
`;

/* ── component ── */

const CONSOLE_HEIGHT = 280;

export default () => {
    const [error, setError] = useState('');
    const { action } = useParams<{ action: 'new' | string }>();
    const [loading, setLoading] = useState(action === 'edit');
    const [content, setContent] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [mode, setMode] = useState('text/plain');
    const [consoleOpen, setConsoleOpen] = useState(false);
    const [saved, setSaved] = useState(false);

    const history = useHistory();
    const { hash } = useLocation();

    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);
    const { addError, clearFlashes } = useFlash();

    const fetchFileContent = useRef<null | (() => Promise<string>)>(null);

    useEffect(() => {
        clearFlashes('files:view');
        const prev = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#101013';
        return () => { document.body.style.backgroundColor = prev; };
    }, []);

    useEffect(() => {
        if (action === 'new') return;

        setError('');
        setLoading(true);
        const path = hashToPath(hash);
        setDirectory(dirname(path));
        getFileContents(uuid, path)
            .then(setContent)
            .catch((error) => {
                console.error(error);
                setError(httpErrorToHuman(error));
            })
            .then(() => setLoading(false));
    }, [action, uuid, hash]);

    const save = (name?: string) => {
        if (!fetchFileContent.current) return;

        setLoading(true);
        setSaved(false);
        clearFlashes('files:view');
        fetchFileContent.current()
            .then((content) => saveFileContents(uuid, name || hashToPath(hash), content))
            .then(() => {
                if (name) {
                    history.push(`/server/${id}/files/edit#/${encodePathSegments(name)}`);
                } else {
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2500);
                }
            })
            .catch((error) => {
                console.error(error);
                addError({ message: httpErrorToHuman(error), key: 'files:view' });
            })
            .then(() => setLoading(false));
    };

    if (error && !loading) {
        return <ServerError message={error} onBack={() => history.goBack()} />;
    }

    const statusLabel =
        status === 'running' ? 'Online' :
        status === 'starting' ? 'Starting' :
        status === 'stopping' ? 'Stopping' : 'Offline';

    return (
        <>
        {/* Fill exactly the space below the server header — same approach as the console page. */}
        <div
            style={{
                height: 'calc(100vh - var(--server-header-height, 6.25rem))',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: '#101013',
            }}
        >
            {/* Toolbar */}
            <Toolbar>
                <BackBtn
                    title={'Back to file manager'}
                    onClick={() => {
                        const parentDir = dirname(hashToPath(hash));
                        history.push(`/server/${id}/files#${encodePathSegments(parentDir)}`);
                    }}
                >
                    <ArrowLeft size={14} />
                </BackBtn>
                <ErrorBoundary>
                    <FileManagerBreadcrumbs withinFileEditor isNewFile={action !== 'edit'} />
                </ErrorBoundary>

                <div css={tw`ml-auto flex items-center gap-2 flex-shrink-0`}>
                    <PowerButtons />
                    <ToolbarDivider />
                    <ConsoleToggle $active={consoleOpen} onClick={() => setConsoleOpen((v) => !v)}>
                        <Terminal size={13} />
                        Console
                        <ChevronDown
                            size={12}
                            style={{
                                transform: consoleOpen ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.2s',
                                marginLeft: 2,
                            }}
                        />
                    </ConsoleToggle>
                    <ToolbarDivider />
                    {action === 'edit' ? (
                        <Can action={'file.update'}>
                            <SaveBtn onClick={() => save()} disabled={loading} $saved={saved}>
                                {saved ? <Check size={13} /> : <Save size={13} />}
                                {saved ? 'Saved!' : 'Save'}
                            </SaveBtn>
                        </Can>
                    ) : (
                        <Can action={'file.create'}>
                            <SaveBtn onClick={() => setModalVisible(true)} disabled={loading}>
                                <FilePlus size={13} />
                                Create File
                            </SaveBtn>
                        </Can>
                    )}
                </div>
            </Toolbar>

            <FlashMessageRender byKey={'files:view'} css={tw`mx-4 mt-2`} />

            {hash.replace(/^#/, '').endsWith('.pteroignore') && (
                <div
                    css={tw`mx-4 mt-2 p-3 border-l-4 rounded flex-shrink-0`}
                    style={{ background: '#0c0c0f', borderColor: '#22d3ee' }}
                >
                    <p css={tw`text-neutral-300 text-xs`}>
                        Editing <code css={tw`font-mono bg-black rounded py-px px-1`}>.pteroignore</code> — files listed here are excluded from backups.
                    </p>
                </div>
            )}

            <BeforeEdit />

            <FileNameModal
                visible={modalVisible}
                onDismissed={() => setModalVisible(false)}
                onFileNamed={(name) => {
                    setModalVisible(false);
                    save(name);
                }}
            />

            {/* Editor — fills all remaining vertical space */}
            <div style={{ flex: 1, minHeight: 0, padding: '12px 16px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                    <SpinnerOverlay visible={loading} />
                    <MonacoEditor
                        mode={mode}
                        filename={hash.replace(/^#/, '')}
                        onModeChanged={setMode}
                        initialContent={content}
                        fetchContent={(value) => { fetchFileContent.current = value; }}
                        onContentSaved={() => {
                            if (action !== 'edit') {
                                setModalVisible(true);
                            } else {
                                save();
                            }
                        }}
                    />
                </div>
            </div>

            {/* Console drawer */}
            {consoleOpen && (
                <ConsoleDrawer style={{ height: CONSOLE_HEIGHT }}>
                    <ConsoleHeader>
                        <div css={tw`flex items-center gap-2`}>
                            <StatusDot $status={status ?? 'offline'} />
                            <span css={tw`text-xs font-medium text-neutral-400`}>
                                Console —{' '}
                                <span css={tw`text-neutral-300`}>{statusLabel}</span>
                            </span>
                        </div>
                        <button
                            onClick={() => setConsoleOpen(false)}
                            css={tw`text-neutral-600 hover:text-neutral-300 transition-colors`}
                        >
                            <X size={14} />
                        </button>
                    </ConsoleHeader>
                    <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <Console />
                    </div>
                </ConsoleDrawer>
            )}

            <AfterEdit />
        </div>

        {saved && <SaveGlow />}
        </>
    );
};
