import React, { useEffect, useState } from 'react';
import ContentBox from '@/components/elements/ContentBox';
import CreateApiKeyForm from '@/components/dashboard/forms/CreateApiKeyForm';
import getApiKeys, { ApiKey } from '@/api/account/getApiKeys';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import deleteApiKey from '@/api/account/deleteApiKey';
import FlashMessageRender from '@/components/FlashMessageRender';
import { format } from 'date-fns';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { Dialog } from '@/components/elements/dialog';
import { useFlashKey } from '@/plugins/useFlash';
import Code from '@/components/elements/Code';
import { Key, Trash2, Copy, Check, Clock, Calendar } from 'lucide-react';

import BeforeContent from '@blueprint/components/Account/API/BeforeContent';
import AfterContent from '@blueprint/components/Account/API/AfterContent';

/* ── styled ── */

const KeyCard = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: #111114;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    transition: border-color 0.15s;

    & + & { margin-top: 8px; }
    &:hover { border-color: rgba(255,255,255,0.13); }
`;

const IconWrap = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgba(99,102,241,0.12);
    border: 1px solid rgba(99,102,241,0.2);
    color: #818cf8;
    flex-shrink: 0;
`;

const Meta = styled.div`
    flex: 1;
    min-width: 0;
`;

const KeyName = styled.p`
    font-size: 13px;
    font-weight: 500;
    color: #e4e4e7;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0 0 4px;
`;

const KeyMeta = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`;

const MetaItem = styled.span`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #71717a;
`;

const IdentifierChip = styled.code`
    font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
    font-size: 11px;
    color: #a1a1aa;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 5px;
    padding: 3px 8px;
    white-space: nowrap;
    flex-shrink: 0;
`;

const IconBtn = styled.button<{ $danger?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 7px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    color: #52525b;
    flex-shrink: 0;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;

    &:hover {
        background: ${(p) => p.$danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.09)'};
        color: ${(p) => p.$danger ? '#f87171' : '#e4e4e7'};
        border-color: ${(p) => p.$danger ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.15)'};
    }
`;

/* ── component ── */

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <IconBtn onClick={handleCopy} title={'Copy identifier'}>
            {copied ? <Check size={13} color={'#4ade80'} /> : <Copy size={13} />}
        </IconBtn>
    );
}

export default () => {
    const [deleteIdentifier, setDeleteIdentifier] = useState('');
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const { clearAndAddHttpError } = useFlashKey('account');

    useEffect(() => {
        const prev = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#101013';
        return () => { document.body.style.backgroundColor = prev; };
    }, []);

    useEffect(() => {
        getApiKeys()
            .then((keys) => setKeys(keys))
            .then(() => setLoading(false))
            .catch((error) => clearAndAddHttpError(error));
    }, []);

    const doDeletion = (identifier: string) => {
        setLoading(true);
        clearAndAddHttpError();
        deleteApiKey(identifier)
            .then(() => setKeys((s) => [...(s || []).filter((key) => key.identifier !== identifier)]))
            .catch((error) => clearAndAddHttpError(error))
            .then(() => {
                setLoading(false);
                setDeleteIdentifier('');
            });
    };

    return (
        <PageContentBlock title={'Account API'}>
            <FlashMessageRender byKey={'account'} />
            <BeforeContent />
            <div css={tw`md:flex flex-nowrap my-10`}>
                <ContentBox title={'Create API Key'} css={tw`flex-none w-full md:w-1/2`}>
                    <CreateApiKeyForm onKeyCreated={(key) => setKeys((s) => [...s!, key])} />
                </ContentBox>
                <ContentBox title={'API Keys'} css={tw`flex-1 overflow-hidden mt-8 md:mt-0 md:ml-8`}>
                    <SpinnerOverlay visible={loading} />
                    <Dialog.Confirm
                        title={'Delete API Key'}
                        confirm={'Delete Key'}
                        open={!!deleteIdentifier}
                        onClose={() => setDeleteIdentifier('')}
                        onConfirmed={() => doDeletion(deleteIdentifier)}
                    >
                        All requests using the <Code>{deleteIdentifier}</Code> key will be invalidated.
                    </Dialog.Confirm>
                    {keys.length === 0 ? (
                        <p css={tw`text-center text-sm text-neutral-400`}>
                            {loading ? 'Loading...' : 'No API keys exist for this account.'}
                        </p>
                    ) : (
                        keys.map((key) => (
                            <KeyCard key={key.identifier}>
                                <IconWrap>
                                    <Key size={16} />
                                </IconWrap>
                                <Meta>
                                    <KeyName title={key.description || 'Unnamed key'}>
                                        {key.description || <span style={{ color: '#52525b', fontStyle: 'italic' }}>No description</span>}
                                    </KeyName>
                                    <KeyMeta>
                                        <MetaItem>
                                            <Calendar size={10} />
                                            Created&nbsp;{key.createdAt ? format(key.createdAt, 'MMM d, yyyy') : 'Unknown'}
                                        </MetaItem>
                                        <MetaItem>
                                            <Clock size={10} />
                                            {key.lastUsedAt ? `Used ${format(key.lastUsedAt, 'MMM d, yyyy HH:mm')}` : 'Never used'}
                                        </MetaItem>
                                    </KeyMeta>
                                </Meta>
                                <IdentifierChip>{key.identifier}</IdentifierChip>
                                <CopyButton text={key.identifier} />
                                <IconBtn $danger onClick={() => setDeleteIdentifier(key.identifier)} title={'Delete key'}>
                                    <Trash2 size={13} />
                                </IconBtn>
                            </KeyCard>
                        ))
                    )}
                </ContentBox>
            </div>
            <AfterContent />
        </PageContentBlock>
    );
};
