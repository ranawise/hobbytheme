import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import IconPickerModal from '@/components/server/IconPickerModal';
import { useStoreState } from 'easy-peasy';
import tw, { TwStyle } from 'twin.macro';
import styled from 'styled-components/macro';
import { ApplicationStore } from '@/state';
import { ServerContext } from '@/state/server';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Dropdown from '@/components/elements/dropdown/Dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

import { NavigationLinks } from '@blueprint/extends/routers/ServerRouter';
import BeforeSubNavigation from '@blueprint/components/Navigation/SubNavigation/BeforeSubNavigation';
import AdditionalServerItems from '@blueprint/components/Navigation/SubNavigation/AdditionalServerItems';
import AfterSubNavigation from '@blueprint/components/Navigation/SubNavigation/AfterSubNavigation';

interface StatusMeta {
    label: string;
    dot: TwStyle;
    pill: TwStyle;
}

const statusMeta = (status: string | null): StatusMeta => {
    if (status === 'running') {
        return { label: 'Online', dot: tw`bg-green-500`, pill: tw`bg-green-500/10 text-green-400` };
    }

    if (status === 'starting' || status === 'stopping') {
        const label = status === 'starting' ? 'Starting' : 'Stopping';

        return { label, dot: tw`bg-yellow-500`, pill: tw`bg-yellow-500/10 text-yellow-400` };
    }

    if (status === 'offline') {
        return { label: 'Offline', dot: tw`bg-red-500`, pill: tw`bg-red-500/10 text-red-400` };
    }

    return { label: 'Connecting', dot: tw`bg-neutral-500`, pill: tw`bg-neutral-500/10 text-neutral-400` };
};

const Dot = styled.span`
    ${tw`inline-block w-1.5 h-1.5 rounded-full mr-1.5`};
`;

const Tabs = styled.div`
    ${tw`flex items-center text-sm overflow-x-auto`};

    & > a,
    & > div > a {
        ${tw`inline-flex items-center py-3 px-3 text-neutral-400 no-underline whitespace-nowrap transition-colors duration-150 border-b-2 border-transparent flex-shrink-0`};

        &:not(:first-of-type) {
            ${tw`ml-1`};
        }

        &:hover {
            ${tw`text-neutral-200`};
        }

        &:active,
        &.active {
            ${tw`text-white border-primary-500`};
        }
    }
`;

export default () => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const email = useStoreState((state: ApplicationStore) => state.user.data!.email);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);

    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const serverId = ServerContext.useStoreState((state) => state.server.data?.internalId);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const iconImageUrlFromServer = ServerContext.useStoreState((state) => state.server.data!.iconImageUrl);

    const DEFAULT_SERVER_ICON = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.1/assets/minecraft/textures/item/oak_sign.png';
    const [iconImageUrl, setIconImageUrl] = useState<string | null>(iconImageUrlFromServer);
    const [pickerOpen, setPickerOpen] = useState(false);

    const meta = statusMeta(status);

    const ref = useRef<HTMLDivElement>(null);

    // Pages (like the server console) that want to fill the exact space left
    // over below this header read it back via this CSS variable, rather than
    // hardcoding an estimated height — keeps them correct even if this header
    // ever wraps to more lines or otherwise changes height.
    useEffect(() => {
        if (!ref.current) return;

        const node = ref.current;
        const observer = new ResizeObserver(() => {
            // offsetHeight (rather than the entry's contentRect) so the 1px
            // bottom border is included in the measurement.
            document.documentElement.style.setProperty('--server-header-height', `${node.offsetHeight}px`);
        });

        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <>
        <div ref={ref} css={tw`w-full bg-black border-b border-white/10`} id={'ServerHeader'}>
            <SpinnerOverlay visible={isLoggingOut} />
            <div css={tw`flex items-center h-14 px-4`}>
                <Link
                    to={'/'}
                    css={tw`flex items-center text-sm text-neutral-400 hover:text-neutral-200 transition-colors duration-150 flex-shrink-0`}
                >
                    <ArrowLeft size={14} css={tw`mr-1.5`} />
                    Dashboard
                </Link>
                <span css={tw`mx-3 text-neutral-600 flex-shrink-0`}>/</span>
                <button
                    onClick={() => setPickerOpen(true)}
                    title={'Change server icon'}
                    style={{
                        background: 'none', border: 'none', padding: 0,
                        cursor: 'pointer', flexShrink: 0, marginRight: 8,
                        borderRadius: 6, display: 'flex', alignItems: 'center',
                        transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                    <img
                        src={iconImageUrl ?? DEFAULT_SERVER_ICON}
                        alt={'server icon'}
                        style={{ width: 24, height: 24, objectFit: 'contain', imageRendering: 'pixelated', display: 'block' }}
                    />
                </button>
                <p css={tw`font-semibold text-white truncate`}>{name}</p>
                <span
                    css={[
                        tw`ml-3 flex-shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium`,
                        meta.pill,
                    ]}
                >
                    <Dot css={meta.dot} />
                    {meta.label}
                </span>
                <div css={tw`flex-1`} />
                <Dropdown>
                    <Dropdown.Button>{email}</Dropdown.Button>
                    <Dropdown.Item onClick={() => (window.location.href = '/account')}>
                        Account Settings
                    </Dropdown.Item>
                    {rootAdmin && (
                        <Dropdown.Item onClick={() => (window.location.href = '/admin')}>Admin</Dropdown.Item>
                    )}
                    <Dropdown.Item onClick={onTriggerLogout} danger>
                        Sign Out
                    </Dropdown.Item>
                </Dropdown>
            </div>
            <div css={tw`border-t border-white/10`}>
                <div css={tw`flex items-center px-4`}>
                    <BeforeSubNavigation />
                    <Tabs>
                        <NavigationLinks />
                        <AdditionalServerItems />
                    </Tabs>
                    {rootAdmin && serverId && (
                        // eslint-disable-next-line react/jsx-no-target-blank
                        <a
                            href={`/admin/servers/view/${serverId}`}
                            target={'_blank'}
                            css={tw`ml-2 text-neutral-500 hover:text-neutral-300 transition-colors duration-150 flex-shrink-0`}
                        >
                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                        </a>
                    )}
                    <AfterSubNavigation />
                </div>
            </div>
        </div>

        {pickerOpen && (
            <IconPickerModal
                currentIconUrl={iconImageUrl}
                onClose={() => setPickerOpen(false)}
                onChanged={(newUrl) => setIconImageUrl(newUrl)}
            />
        )}
        </>
    );
};
