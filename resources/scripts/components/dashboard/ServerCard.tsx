import React, { memo, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, HardDrive, MemoryStick, Network, Play, Square, RotateCcw } from 'lucide-react';
import Sparkline from '@/components/elements/Sparkline';
import tw, { TwStyle } from 'twin.macro';
import styled from 'styled-components/macro';
import isEqual from 'react-fast-compare';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, connectAddress, mbToBytes } from '@/lib/formatters';
import sendPowerAction from '@/api/server/sendPowerAction';

import BeforeEntryName from '@blueprint/components/Dashboard/Serverlist/ServerRow/BeforeEntryName';
import AfterEntryName from '@blueprint/components/Dashboard/Serverlist/ServerRow/AfterEntryName';
import BeforeEntryDescription from '@blueprint/components/Dashboard/Serverlist/ServerRow/BeforeEntryDescription';
import AfterEntryDescription from '@blueprint/components/Dashboard/Serverlist/ServerRow/AfterEntryDescription';
import ResourceLimits from '@blueprint/components/Dashboard/Serverlist/ServerRow/ResourceLimits';

type Timer = ReturnType<typeof setInterval>;

interface StatusMeta {
    label: string;
    dot: TwStyle;
    pill: TwStyle;
    accent: string;
}

const statusMeta = (server: Server, stats: ServerStats | null, isSuspended: boolean): StatusMeta => {
    if (isSuspended) {
        return { label: 'Suspended', dot: tw`bg-red-500`, pill: tw`bg-red-500/10 text-red-400`, accent: '#ef4444' };
    }
    if (server.isTransferring) {
        return { label: 'Transferring', dot: tw`bg-neutral-400`, pill: tw`bg-neutral-500/10 text-neutral-300`, accent: '#71717a' };
    }
    if (server.status) {
        const label = server.status === 'installing' ? 'Installing' : 'Restoring Backup';
        return { label, dot: tw`bg-neutral-400`, pill: tw`bg-neutral-500/10 text-neutral-300`, accent: '#71717a' };
    }
    if (!stats || stats.status === 'offline') {
        return { label: 'Offline', dot: tw`bg-red-500`, pill: tw`bg-red-500/10 text-red-400`, accent: '#52525b' };
    }
    if (stats.status === 'starting') {
        return { label: 'Starting', dot: tw`bg-yellow-500`, pill: tw`bg-yellow-500/10 text-yellow-400`, accent: '#eab308' };
    }
    if (stats.status === 'stopping') {
        return { label: 'Stopping', dot: tw`bg-yellow-500`, pill: tw`bg-yellow-500/10 text-yellow-400`, accent: '#f97316' };
    }
    return { label: 'Online', dot: tw`bg-green-500`, pill: tw`bg-green-500/10 text-green-400`, accent: '#22c55e' };
};

const Dot = styled.span`
    ${tw`inline-block w-1.5 h-1.5 rounded-full mr-1.5`};
`;

const StatRow = styled.div<{ $last?: boolean }>`
    ${tw`flex items-center justify-between text-sm py-2.5`};
    border-bottom: 1px solid ${(p) => (p.$last ? 'transparent' : 'rgba(255,255,255,0.08)')};
`;


const PowerBtn = styled.button<{ $variant?: 'start' | 'stop' | 'restart' }>`
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, opacity 0.15s;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    color: #71717a;

    &:hover:not(:disabled) {
        ${(p) => p.$variant === 'start' && 'background: rgba(74,222,128,0.1); border-color: rgba(74,222,128,0.3); color: #4ade80;'}
        ${(p) => p.$variant === 'stop'  && 'background: rgba(248,113,113,0.1); border-color: rgba(248,113,113,0.3); color: #f87171;'}
        ${(p) => p.$variant === 'restart' && 'background: rgba(251,191,36,0.1); border-color: rgba(251,191,36,0.3); color: #fbbf24;'}
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
`;

const Card = styled(Link)<{ $accent: string }>`
    ${tw`block rounded-xl bg-surface p-5 transition-all duration-200`};
    border: 1px solid rgba(255,255,255,0.08);
    border-top: 2px solid ${(p) => p.$accent};

    &:hover {
        border-color: ${(p) => p.$accent}55;
        border-top-color: ${(p) => p.$accent};
        box-shadow: 0 8px 28px -4px rgba(0, 0, 0, 0.18);
        transform: translateY(-1px);
    }
`;

interface Props {
    server: Server;
    className?: string;
    dragHandle?: React.ReactNode;
    onStatusChange?: (uuid: string, isOnline: boolean) => void;
}

export default memo(({ server, className, dragHandle, onStatusChange }: Props) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<{ cpu: number[]; ram: number[] }>({ cpu: [], ram: [] });

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data) => {
                setStats(data);
                onStatusChange?.(server.uuid, data.status !== 'offline');
                if (data.status !== 'offline') {
                    const ramLimit = server.limits.memory > 0 ? mbToBytes(server.limits.memory) : 0;
                    const cpuLimit = server.limits.cpu > 0 ? server.limits.cpu : 100;
                    const ramPct = ramLimit > 0 ? (data.memoryUsageInBytes / ramLimit) * 100 : 0;
                    const cpuPct = (data.cpuUsagePercent / cpuLimit) * 100;
                    setHistory((prev) => ({
                        cpu: [...prev.cpu, cpuPct].slice(-30),
                        ram: [...prev.ram, ramPct].slice(-30),
                    }));
                }
            })
            .catch((error) => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        if (isSuspended) return;
        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });
        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended]);

    const handleCopyAddress = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!address) return;
        navigator.clipboard.writeText(address).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const triggerPower = (e: React.MouseEvent, signal: 'start' | 'stop' | 'restart') => {
        e.preventDefault();
        e.stopPropagation();
        setActionLoading(signal);
        sendPowerAction(server.uuid, signal)
            .then(() => setTimeout(() => getStats(), 2000))
            .catch(console.error)
            .finally(() => setActionLoading(null));
    };

    const status = statusMeta(server, stats, isSuspended);
    const isLive = !!stats && !isSuspended && (['running', 'starting', 'stopping'] as ServerPowerState[]).includes(stats.status);

    const ramLimitBytes = server.limits.memory > 0 ? mbToBytes(server.limits.memory) : 0;
    const ramPct = isLive && ramLimitBytes > 0 ? (stats!.memoryUsageInBytes / ramLimitBytes) * 100 : 0;
    const cpuLimit = server.limits.cpu > 0 ? server.limits.cpu : 100;
    const cpuPct = isLive ? (stats!.cpuUsagePercent / cpuLimit) * 100 : 0;

    const ramText = isLive
        ? bytesToString(stats!.memoryUsageInBytes)
        : server.limits.memory !== 0
        ? bytesToString(mbToBytes(server.limits.memory))
        : '—';

    const cpuText = isLive
        ? `${stats!.cpuUsagePercent.toFixed(0)} %`
        : server.limits.cpu !== 0
        ? `${server.limits.cpu} %`
        : '—';

    const diskText = stats ? bytesToString(stats.diskUsageInBytes) : '0 B';
    const address = connectAddress(server.domains, server.allocations.find((alloc) => alloc.isDefault));

    const versionVariable = server.variables.find(
        (variable) => variable.envVariable === 'MINECRAFT_VERSION' || variable.envVariable === 'MC_VERSION'
    );
    const version = versionVariable?.serverValue || versionVariable?.defaultValue;

    return (
        <Card to={`/server/${server.id}`} className={className} $accent={status.accent}>
            <div css={tw`flex items-center justify-between gap-3`}>
                <div css={tw`flex items-center gap-2 min-w-0`}>
                    {dragHandle}
                    <img
                        src={server.iconImageUrl ?? 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.1/assets/minecraft/textures/item/oak_sign.png'}
                        alt={''}
                        style={{ width: 28, height: 28, objectFit: 'contain', imageRendering: 'pixelated', flexShrink: 0 }}
                    />
                    <p css={tw`text-base font-semibold text-white truncate`}>
                        <BeforeEntryName />
                        {server.name}
                        <AfterEntryName />
                    </p>
                </div>
                <span css={[tw`flex-shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium`, status.pill]}>
                    <Dot css={status.dot} />
                    {status.label}
                </span>
            </div>

            <p css={tw`mt-1 text-sm text-neutral-400 truncate`}>
                <BeforeEntryDescription />
                {server.egg.toLowerCase()}
                {version ? ` ${version}` : ''}
                <AfterEntryDescription />
            </p>

            <div css={tw`mt-4`}>
                <StatRow>
                    <span css={tw`flex items-center text-neutral-400`}>
                        <MemoryStick size={15} css={tw`mr-2`} />
                        RAM
                    </span>
                    <div css={tw`flex items-center gap-3`}>
                        <Sparkline id={`${server.uuid}-ram`} data={history.ram} color={'#22c55e'} />
                        <span css={tw`text-neutral-200`}>{ramText}</span>
                    </div>
                </StatRow>
                <StatRow $last>
                    <span css={tw`flex items-center text-neutral-400`}>
                        <Cpu size={15} css={tw`mr-2`} />
                        CPU
                    </span>
                    <div css={tw`flex items-center gap-3`}>
                        <Sparkline id={`${server.uuid}-cpu`} data={history.cpu} color={'#22d3ee'} />
                        <span css={tw`text-neutral-200`}>{cpuText}</span>
                    </div>
                </StatRow>
                <ResourceLimits />
            </div>

            <div
                css={tw`mt-1 pt-3 flex items-center justify-between gap-3 text-sm text-neutral-400`}
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
                <span
                    css={tw`flex items-center min-w-0 truncate`}
                    title={copied ? 'Copied!' : 'Click to copy address'}
                    onClick={handleCopyAddress}
                    style={{ cursor: 'pointer', color: copied ? '#4ade80' : undefined, transition: 'color 0.2s' }}
                >
                    <Network size={14} css={tw`mr-2 flex-shrink-0`} />
                    <span css={tw`truncate`}>{copied ? 'Copied!' : address}</span>
                </span>
                <span css={tw`flex items-center flex-shrink-0`}>
                    <HardDrive size={14} css={tw`mr-2`} />
                    {diskText}
                </span>
            </div>

            {/* Power controls — only when server is in a controllable state */}
            {!isSuspended && !server.status && (
                <div
                    css={tw`mt-3 pt-3 flex items-center gap-2`}
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                    <PowerBtn
                        $variant={'start'}
                        disabled={stats?.status !== 'offline' || actionLoading !== null}
                        onClick={(e) => triggerPower(e, 'start')}
                    >
                        <Play size={10} />
                        {actionLoading === 'start' ? 'Starting…' : 'Start'}
                    </PowerBtn>
                    <PowerBtn
                        $variant={'restart'}
                        disabled={stats?.status === 'offline' || stats?.status === 'stopping' || actionLoading !== null}
                        onClick={(e) => triggerPower(e, 'restart')}
                    >
                        <RotateCcw size={10} />
                        {actionLoading === 'restart' ? 'Restarting…' : 'Restart'}
                    </PowerBtn>
                    <PowerBtn
                        $variant={'stop'}
                        disabled={stats?.status === 'offline' || actionLoading !== null}
                        onClick={(e) => triggerPower(e, 'stop')}
                    >
                        <Square size={10} />
                        {actionLoading === 'stop' ? 'Stopping…' : 'Stop'}
                    </PowerBtn>
                </div>
            )}
        </Card>
    );
}, isEqual);
