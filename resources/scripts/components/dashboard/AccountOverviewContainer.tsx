import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import UpdatePasswordForm from '@/components/dashboard/forms/UpdatePasswordForm';
import UpdateEmailAddressForm from '@/components/dashboard/forms/UpdateEmailAddressForm';
import ConfigureTwoFactorForm from '@/components/dashboard/forms/ConfigureTwoFactorForm';
import CreditsOverview from '@/components/dashboard/forms/CreditsOverview';
import PageContentBlock from '@/components/elements/PageContentBlock';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import MessageBox from '@/components/MessageBox';
import { useLocation } from 'react-router-dom';
import { useStoreState, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { Camera, Trash2, ShieldCheck, User, Key, Mail, Smartphone, Coins } from 'lucide-react';
import { uploadAvatar, deleteAvatar } from '@/api/account/avatar';

import BeforeContent from '@blueprint/components/Account/Overview/BeforeContent';
import AfterContent from '@blueprint/components/Account/Overview/AfterContent';

/* ── Cards ── */

const Card = styled.div`
    background: #101013;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 12px;
`;

const CardHeader = styled.div`
    ${tw`flex items-center gap-2.5 px-5 py-4`};
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const CardTitle = styled.span`
    ${tw`text-sm font-semibold text-neutral-200`};
`;

const CardIcon = styled.span`
    ${tw`flex items-center justify-center w-7 h-7 rounded-lg`};
    background: rgba(255, 255, 255, 0.05);
    color: #a1a1aa;
`;

const CardBody = styled.div`
    ${tw`p-5`};
`;

/* ── Profile card pieces ── */

const AvatarRing = styled.div`
    position: relative;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    border: 2px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: border-color 0.15s;
    &:hover { border-color: rgba(255, 255, 255, 0.28); }
    &:hover .cam-overlay { opacity: 1; }
`;

const AvatarFill = styled.div<{ $url: string | null }>`
    width: 100%;
    height: 100%;
    ${({ $url }) =>
        $url
            ? `background: url(${$url}) center/cover no-repeat;`
            : `background: linear-gradient(135deg, #1c1240 0%, #2e1f6a 100%);`}
`;

const Monogram = styled.div`
    ${tw`absolute inset-0 flex items-center justify-center text-3xl font-bold select-none`};
    color: rgba(255, 255, 255, 0.45);
`;

const CamOverlay = styled.div`
    ${tw`absolute inset-0 flex flex-col items-center justify-center gap-1`};
    background: rgba(0, 0, 0, 0.52);
    opacity: 0;
    transition: opacity 0.15s;
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    pointer-events: none;
`;

const Pill = styled.span<{ $color?: string }>`
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 500;
    padding: 3px 9px;
    border-radius: 999px;
    background: ${p => (p.$color ? `${p.$color}16` : 'rgba(255,255,255,0.05)')};
    color: ${p => p.$color ?? '#71717a'};
    border: 1px solid ${p => (p.$color ? `${p.$color}28` : 'rgba(255,255,255,0.07)')};
`;

const RemoveLink = styled.button`
    ${tw`flex items-center gap-1 text-xs text-neutral-700 hover:text-red-400 transition-colors duration-150 mt-2`};
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
`;

const Grid3 = styled.div`
    display: grid;
    gap: 16px;
    grid-template-columns: 1fr;
    @media (min-width: 640px)  { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    @media (min-width: 1024px) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
`;

/* ── helpers ── */

const initials = (u: string) => u.slice(0, 2).toUpperCase();
const fmtDate   = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

/* ── page ── */

export default () => {
    const { state } = useLocation<undefined | { twoFactorRedirect?: boolean }>();
    const user = useStoreState((s: ApplicationStore) => s.user.data!);
    const updateUserData = useStoreActions((a: ApplicationStore) => a.user.updateUserData);

    useEffect(() => {
        const prev = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#101013';
        return () => { document.body.style.backgroundColor = prev; };
    }, []);

    const fileRef  = useRef<HTMLInputElement>(null);
    const [uploading, setUploading]   = useState(false);
    const [avatarErr, setAvatarErr]   = useState<string | null>(null);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { setAvatarErr('Max 2 MB.'); return; }
        setAvatarErr(null);
        setUploading(true);
        try {
            const url = await uploadAvatar(file);
            updateUserData({ avatarUrl: url });
        } catch {
            setAvatarErr('Upload failed.');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handleRemove = async () => {
        setAvatarErr(null);
        setUploading(true);
        try {
            await deleteAvatar();
            updateUserData({ avatarUrl: null });
        } catch {
            setAvatarErr('Remove failed.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <PageContentBlock title={'Account'}>
            {state?.twoFactorRedirect && (
                <MessageBox title={'2-Factor Required'} type={'error'}>
                    Your account must have two-factor authentication enabled in order to continue.
                </MessageBox>
            )}

            <BeforeContent />

            {/* ── Profile ── */}
            <Card css={state?.twoFactorRedirect ? tw`mt-4 mb-4` : tw`mt-10 mb-4`}>
                <CardBody css={tw`flex flex-col sm:flex-row items-center sm:items-start gap-6`}>
                    <div css={tw`flex flex-col items-center`}>
                        <input
                            ref={fileRef}
                            type='file'
                            accept='image/jpeg,image/png,image/gif,image/webp'
                            css={tw`hidden`}
                            onChange={handleFile}
                        />
                        <AvatarRing onClick={() => !uploading && fileRef.current?.click()} title='Change photo'>
                            <AvatarFill $url={user.avatarUrl ?? null} />
                            {!user.avatarUrl && <Monogram>{initials(user.username)}</Monogram>}
                            <CamOverlay className='cam-overlay'>
                                <Camera size={18} />
                                {uploading ? 'Uploading…' : 'Change'}
                            </CamOverlay>
                        </AvatarRing>
                        {user.avatarUrl && (
                            <RemoveLink onClick={handleRemove} disabled={uploading}>
                                <Trash2 size={10} /> Remove
                            </RemoveLink>
                        )}
                        {avatarErr && (
                            <p css={tw`text-xs text-red-400 mt-1`}>{avatarErr}</p>
                        )}
                    </div>

                    <div css={tw`flex-1 min-w-0 flex flex-col gap-2.5`}>
                        <div>
                            <h1 css={tw`text-xl font-bold text-white leading-tight`}>{user.username}</h1>
                            <p css={tw`text-sm text-neutral-500 mt-0.5`}>{user.email}</p>
                        </div>
                        <div css={tw`flex flex-wrap gap-1.5`}>
                            {user.rootAdmin && (
                                <Pill $color='#f59e0b'><ShieldCheck size={11} /> Administrator</Pill>
                            )}
                            {user.useTotp && (
                                <Pill $color='#34d399'><ShieldCheck size={11} /> 2FA enabled</Pill>
                            )}
                            <Pill><User size={11} /> Member since {fmtDate(user.createdAt)}</Pill>
                        </div>
                        <p css={tw`text-xs text-neutral-700`}>
                            Click your avatar to upload · JPEG PNG GIF WebP · max 2 MB
                        </p>
                    </div>
                </CardBody>
            </Card>

            {/* ── Security ── */}
            <Grid3 css={tw`mb-4`}>
                <Card>
                    <CardHeader>
                        <CardIcon><Key size={14} /></CardIcon>
                        <CardTitle>Password</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <FlashMessageRender byKey={'account:password'} css={tw`mb-4`} />
                        <UpdatePasswordForm />
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <CardIcon><Mail size={14} /></CardIcon>
                        <CardTitle>Email Address</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <FlashMessageRender byKey={'account:email'} css={tw`mb-4`} />
                        <UpdateEmailAddressForm />
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <CardIcon><Smartphone size={14} /></CardIcon>
                        <CardTitle>Two-Factor Auth</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <FlashMessageRender byKey={'account:two-step'} css={tw`mb-4`} />
                        <ConfigureTwoFactorForm />
                    </CardBody>
                </Card>
            </Grid3>

            {/* ── Credits ── */}
            <Card css={tw`mb-10`}>
                <CardHeader>
                    <CardIcon><Coins size={14} /></CardIcon>
                    <CardTitle>Credits &amp; Server Slots</CardTitle>
                </CardHeader>
                <CardBody>
                    <FlashMessageRender byKey={'account:credits'} css={tw`mb-4`} />
                    <CreditsOverview />
                </CardBody>
            </Card>

            <AfterContent />
        </PageContentBlock>
    );
};
