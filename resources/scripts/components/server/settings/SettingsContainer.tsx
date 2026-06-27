import React, { useEffect, useState } from 'react';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { ServerContext } from '@/state/server';
import { useStoreState } from 'easy-peasy';
import RenameServerBox from '@/components/server/settings/RenameServerBox';
import FlashMessageRender from '@/components/FlashMessageRender';
import Can from '@/components/elements/Can';
import ReinstallServerBox from '@/components/server/settings/ReinstallServerBox';
import DeleteServerBox from '@/components/server/settings/DeleteServerBox';
import tw from 'twin.macro';
import Input from '@/components/elements/Input';
import Label from '@/components/elements/Label';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { ip } from '@/lib/formatters';
import { Button } from '@/components/elements/button/index';
import { Check, Copy, Terminal, ExternalLink } from 'lucide-react';
import styled from 'styled-components/macro';

import BeforeContent from '@blueprint/components/Server/Settings/BeforeContent';
import AfterContent from '@blueprint/components/Server/Settings/AfterContent';
import CustomizeServerBox from '@/components/server/settings/CustomizeServerBox';

const ConnectBtn = styled.button<{ $copied?: boolean }>`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 13px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    border: 1px solid ${(p) => p.$copied ? 'rgba(74,222,128,0.35)' : 'rgba(255,255,255,0.1)'};
    background: ${(p) => p.$copied ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.04)'};
    color: ${(p) => p.$copied ? '#4ade80' : '#a1a1aa'};
    white-space: nowrap;

    &:hover { background: rgba(255,255,255,0.09); color: #e4e4e7; border-color: rgba(255,255,255,0.18); }
`;

const useCopy = (ms = 2000) => {
    const [copied, setCopied] = useState<string | null>(null);
    const copy = (text: string, key: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(null), ms);
        });
    };
    return { copied, copy };
};

export default () => {
    const username = useStoreState((state) => state.user.data!.username);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const node = ServerContext.useStoreState((state) => state.server.data!.node);
    const sftp = ServerContext.useStoreState((state) => state.server.data!.sftpDetails, isEqual);
    const isFree = ServerContext.useStoreState((state) => state.server.data!.isFree);
    const { copied, copy } = useCopy();

    const sftpUser = `${username}.${id}`;
    const sftpHost = ip(sftp.ip);
    const sftpPort = sftp.port;
    const sftpUrl = `sftp://${sftpUser}@${sftpHost}:${sftpPort}`;
    const terminalCmd = `sftp -P ${sftpPort} ${sftpUser}@${sftpHost}`;

    useEffect(() => {
        const prev = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#101013';
        return () => { document.body.style.backgroundColor = prev; };
    }, []);

    return (
        <ServerContentBlock title={'Settings'} compact>
            <div css={tw`w-full px-4 sm:px-6 pt-4 pb-8`} style={{ background: '#101013', minHeight: 'calc(100vh - var(--server-header-height, 6.25rem))' }}>
            <FlashMessageRender byKey={'settings'} css={tw`mb-4`} />
            <BeforeContent />
            <div css={tw`md:flex`}>
                <div css={tw`w-full md:flex-1 md:mr-10`}>
                    <Can action={'file.sftp'}>
                        <TitledGreyBox title={'SFTP Details'} css={tw`mb-6 md:mb-10`}>
                            <div>
                                <Label>Server Address</Label>
                                <CopyOnClick text={`sftp://${sftpHost}:${sftpPort}`}>
                                    <Input
                                        css={tw`!bg-surface !border-white/10 !text-neutral-200`}
                                        type={'text'}
                                        value={`sftp://${sftpHost}:${sftpPort}`}
                                        readOnly
                                    />
                                </CopyOnClick>
                            </div>
                            <div css={tw`mt-6`}>
                                <Label>Username</Label>
                                <CopyOnClick text={sftpUser}>
                                    <Input
                                        css={tw`!bg-surface !border-white/10 !text-neutral-200`}
                                        type={'text'}
                                        value={sftpUser}
                                        readOnly
                                    />
                                </CopyOnClick>
                            </div>
                            <div css={tw`mt-6`}>
                                <Label>Quick Connect</Label>
                                <p css={tw`text-xs text-neutral-500 mt-1 mb-3`}>
                                    Copy a pre-filled connection string for your SFTP client. Your panel password is used as the SFTP password.
                                </p>
                                <div css={tw`flex flex-wrap gap-2`}>
                                    <ConnectBtn
                                        $copied={copied === 'filezilla'}
                                        onClick={() => copy(sftpUrl, 'filezilla')}
                                        title={sftpUrl}
                                    >
                                        {copied === 'filezilla' ? <Check size={13} /> : <Copy size={13} />}
                                        FileZilla / Cyberduck
                                    </ConnectBtn>
                                    <ConnectBtn
                                        $copied={copied === 'winscp'}
                                        onClick={() => copy(sftpUrl, 'winscp')}
                                        title={sftpUrl}
                                    >
                                        {copied === 'winscp' ? <Check size={13} /> : <Copy size={13} />}
                                        WinSCP
                                    </ConnectBtn>
                                    <ConnectBtn
                                        $copied={copied === 'terminal'}
                                        onClick={() => copy(terminalCmd, 'terminal')}
                                        title={terminalCmd}
                                    >
                                        {copied === 'terminal' ? <Check size={13} /> : <Terminal size={13} />}
                                        Terminal
                                    </ConnectBtn>
                                    <a href={sftpUrl} css={tw`no-underline`}>
                                        <ConnectBtn as={'span'} title={'Open with system default SFTP handler'}>
                                            <ExternalLink size={13} />
                                            Launch
                                        </ConnectBtn>
                                    </a>
                                </div>
                            </div>
                        </TitledGreyBox>
                    </Can>
                    <TitledGreyBox title={'Debug Information'} css={tw`mb-6 md:mb-10`}>
                        <div css={tw`flex items-center justify-between text-sm`}>
                            <p css={tw`text-neutral-400`}>Node</p>
                            <code css={tw`font-mono bg-black rounded py-1 px-2 text-neutral-200`}>{node}</code>
                        </div>
                        <CopyOnClick text={uuid}>
                            <div css={tw`flex items-center justify-between mt-2 text-sm`}>
                                <p css={tw`text-neutral-400`}>Server ID</p>
                                <code css={tw`font-mono bg-black rounded py-1 px-2 text-neutral-200`}>{uuid}</code>
                            </div>
                        </CopyOnClick>
                    </TitledGreyBox>
                </div>
                <div css={tw`w-full mt-6 md:flex-1 md:mt-0`}>
                    <Can action={'settings.rename'}>
                        <div css={tw`mb-6 md:mb-10`}>
                            <RenameServerBox />
                        </div>
                    </Can>
                    <Can action={'settings.reinstall'}>
                        <div css={tw`mb-6 md:mb-10`}>
                            <ReinstallServerBox />
                        </div>
                    </Can>
                    {isFree && <DeleteServerBox />}
                </div>
            </div>
            <div css={tw`mt-6`}>
                <CustomizeServerBox />
            </div>
            <AfterContent />
            </div>
        </ServerContentBlock>
    );
};
