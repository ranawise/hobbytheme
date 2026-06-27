import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LayoutGrid, ShoppingCart, Settings, LogOut, Menu, X } from 'lucide-react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Avatar from '@/components/Avatar';
import useSWR from 'swr';
import { getFreeServerData } from '@/api/account/freeServer';
import getServers from '@/api/getServers';
import { Server } from '@/api/server/getServer';
import { PaginatedResult } from '@/api/http';

import BeforeNavigation from '@blueprint/components/Navigation/NavigationBar/BeforeNavigation';
import AdditionalItems from '@blueprint/components/Navigation/NavigationBar/AdditionalItems';
import AfterNavigation from '@blueprint/components/Navigation/NavigationBar/AfterNavigation';

/* ── Wrapper ── */

const Bar = styled.div`
    width: 100%;
    background: #0c0c0f;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    overflow-x: auto;
`;

const Inner = styled.div`
    max-width: 1200px;
    height: 56px;
    ${tw`mx-auto flex items-center px-4 gap-2`};
`;

/* ── Icon nav links ── */

const NavItem = styled(NavLink)`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 9px;
    color: #71717a;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
    text-decoration: none;

    &:hover {
        background: rgba(255,255,255,0.07);
        color: #e4e4e7;
    }

    &.active {
        background: rgba(255,255,255,0.08);
        color: #fff;
    }
`;

const NavItemA = styled.a`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 9px;
    color: #71717a;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
    text-decoration: none;

    &:hover {
        background: rgba(255,255,255,0.07);
        color: #e4e4e7;
    }
`;

const NavBtn = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 9px;
    color: #71717a;
    background: none;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;

    &:hover {
        background: rgba(255,255,255,0.07);
        color: #e4e4e7;
    }
`;

const Divider = styled.div`
    width: 1px;
    height: 20px;
    background: rgba(255,255,255,0.08);
    flex-shrink: 0;
    margin: 0 4px;
`;

/* ── Mobile nav ── */

const DesktopItems = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    @media (max-width: 767px) {
        display: none;
    }
`;

const MobileActions = styled.div`
    display: none;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;

    @media (max-width: 767px) {
        display: flex;
    }
`;

const HamburgerBtn = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 9px;
    color: #71717a;
    background: none;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;

    &:hover {
        background: rgba(255,255,255,0.07);
        color: #e4e4e7;
    }
`;

const MobileDrawer = styled.div<{ $open: boolean }>`
    display: none;

    @media (max-width: 767px) {
        display: ${(p) => (p.$open ? 'flex' : 'none')};
        flex-direction: column;
        gap: 2px;
        padding: 8px 12px 14px;
        border-top: 1px solid rgba(255,255,255,0.07);
    }
`;

const MobileDivider = styled.div`
    height: 1px;
    background: rgba(255,255,255,0.07);
    margin: 4px 0;
`;

const mobileItemStyle = `
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #d4d4d8;
    text-decoration: none;
    transition: background 0.15s;
    cursor: pointer;

    &:hover {
        background: rgba(255,255,255,0.07);
    }
`;

const MobileNavItem = styled(NavLink)`
    ${mobileItemStyle}

    &.active {
        background: rgba(255,255,255,0.08);
        color: #fff;
    }
`;

const MobileNavItemA = styled.a`${mobileItemStyle}`;

const MobileNavBtn = styled.button`
    ${mobileItemStyle}
    background: none;
    border: none;
    width: 100%;
    text-align: left;
`;

/* ── Server count chip ── */

const ServerChip = styled(Link)`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 10px;
    height: 34px;
    border-radius: 999px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    text-decoration: none;
    transition: background 0.15s, border-color 0.15s;
    flex-shrink: 0;

    &:hover {
        background: rgba(255,255,255,0.09);
        border-color: rgba(255,255,255,0.14);
    }
`;

const ServerDot = styled.span<{ $count: number }>`
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    background: ${(p) => (p.$count > 0 ? '#4ade80' : '#52525b')};
`;

const ServerChipText = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: #d4d4d8;
    white-space: nowrap;
`;

/* ── Credits chip ── */

const CreditsChip = styled(Link)`
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0 10px;
    height: 34px;
    border-radius: 999px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    text-decoration: none;
    transition: background 0.15s, border-color 0.15s;
    flex-shrink: 0;

    &:hover {
        background: rgba(255,255,255,0.09);
        border-color: rgba(255,255,255,0.14);
    }
`;

const CreditsValue = styled.span`
    font-size: 13px;
    font-weight: 600;
    color: #f97316;
    white-space: nowrap;
`;

const CreditsLabel = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: #71717a;
    white-space: nowrap;
`;

/* ── Profile chip ── */

const ProfileChip = styled(NavLink)`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px 0 4px;
    height: 34px;
    border-radius: 999px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    text-decoration: none;
    transition: background 0.15s, border-color 0.15s;
    flex-shrink: 0;

    &:hover {
        background: rgba(255,255,255,0.09);
        border-color: rgba(255,255,255,0.14);
    }

    &.active {
        background: rgba(255,255,255,0.1);
        border-color: rgba(255,255,255,0.18);
    }
`;

const Username = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: #d4d4d8;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

/* ── component ── */

export default () => {
    const username  = useStoreState((state: ApplicationStore) => state.user.data!.username);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Share the same SWR key as CreditsOverview so data is already cached on /account
    const { data: freeServerData } = useSWR('/api/client/account/free-server', getFreeServerData, {
        revalidateOnFocus: false,
        refreshInterval: 60000,
    });

    // Server list — page 1 is enough to get the total count from pagination
    const { data: serverList } = useSWR<PaginatedResult<Server>>(
        ['/api/client', 1, false],
        () => getServers({ page: 1 }),
        { revalidateOnFocus: false, refreshInterval: 120000 }
    );
    const serverCount = serverList?.pagination.total ?? 0;

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <Bar id={'NavigationBar'}>
            <BeforeNavigation />
            <SpinnerOverlay visible={isLoggingOut} />
            <Inner>
                {/* Logo */}
                <Link to={'/'} css={tw`flex-1 flex items-center no-underline`}>
                    <img
                        src={'https://icons.hobbyservers.gg/logos/image.png'}
                        alt={'HobbyServers'}
                        style={{ height: 40, width: 'auto', objectFit: 'contain' }}
                    />
                </Link>

                {/* Desktop nav */}
                <DesktopItems>
                    <SearchContainer />

                    <NavItem to={'/'} exact id={'NavigationDashboard'} title={'Dashboard'}>
                        <LayoutGrid size={18} />
                    </NavItem>

                    <NavItem to={'/store'} id={'NavigationStore'} title={'Store'}>
                        <ShoppingCart size={18} />
                    </NavItem>

                    {rootAdmin && (
                        <NavItemA href={'/admin'} rel={'noreferrer'} id={'NavigationAdmin'} title={'Admin'}>
                            <Settings size={18} />
                        </NavItemA>
                    )}

                    <AdditionalItems />

                    <Divider />

                    {serverList !== undefined && (
                        <ServerChip to={'/'} title={`${serverCount} server${serverCount !== 1 ? 's' : ''}`}>
                            <ServerDot $count={serverCount} />
                            <ServerChipText>
                                {serverCount} {serverCount === 1 ? 'server' : 'servers'}
                            </ServerChipText>
                        </ServerChip>
                    )}

                    {freeServerData !== undefined && (
                        <CreditsChip to={'/store'} title={'Credits balance — click to top up'}>
                            <CreditsValue>{freeServerData.displayCredits.toLocaleString()}</CreditsValue>
                            <CreditsLabel>credits</CreditsLabel>
                        </CreditsChip>
                    )}

                    <Divider />

                    <ProfileChip to={'/account'} id={'NavigationAccount'}>
                        <Avatar.User size={26} />
                        <Username>{username}</Username>
                    </ProfileChip>

                    <NavBtn onClick={onTriggerLogout} title={'Sign out'} id={'NavigationLogout'}>
                        <LogOut size={17} />
                    </NavBtn>
                </DesktopItems>

                {/* Mobile: search + hamburger */}
                <MobileActions>
                    <SearchContainer />
                    <HamburgerBtn onClick={() => setMobileOpen((o) => !o)} aria-label={'Menu'}>
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </HamburgerBtn>
                </MobileActions>
            </Inner>

            {/* Mobile drawer */}
            <MobileDrawer $open={mobileOpen}>
                <MobileNavItem to={'/'} exact onClick={() => setMobileOpen(false)}>
                    <LayoutGrid size={16} />
                    Dashboard
                </MobileNavItem>
                <MobileNavItem to={'/store'} onClick={() => setMobileOpen(false)}>
                    <ShoppingCart size={16} />
                    Store
                </MobileNavItem>
                {rootAdmin && (
                    <MobileNavItemA href={'/admin'} rel={'noreferrer'}>
                        <Settings size={16} />
                        Admin
                    </MobileNavItemA>
                )}
                <MobileDivider />
                {freeServerData !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px' }}>
                        <span style={{ fontSize: 13, color: '#71717a' }}>Credits</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#f97316' }}>{freeServerData.displayCredits.toLocaleString()}</span>
                    </div>
                )}
                <MobileNavItem to={'/account'} onClick={() => setMobileOpen(false)}>
                    <Avatar.User size={18} />
                    {username}
                </MobileNavItem>
                <MobileNavBtn onClick={onTriggerLogout}>
                    <LogOut size={16} />
                    Sign out
                </MobileNavBtn>
            </MobileDrawer>

            <AfterNavigation />
        </Bar>
    );
};
