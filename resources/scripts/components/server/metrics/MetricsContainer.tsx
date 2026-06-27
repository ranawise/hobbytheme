import React, { useCallback, useEffect, useRef, useState } from 'react';
import tw from 'twin.macro';
import { Line } from 'react-chartjs-2';
import { theme } from 'twin.macro';
import { Activity, Clock, Cpu, HardDrive, MemoryStick, Users } from 'lucide-react';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { ServerContext, ServerStatus } from '@/state/server';
import { SocketEvent } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { useChart } from '@/components/server/console/chart';
import { bytesToString } from '@/lib/formatters';
import { hexToRgba } from '@/lib/helpers';

import BeforeContent from '@blueprint/components/Server/Metrics/BeforeContent';
import AfterContent from '@blueprint/components/Server/Metrics/AfterContent';

const stripAnsi = (s: string) => s.replace(/\x1B\[[0-9;]*[mGKHF]/g, '');

const formatUptime = (ms: number): string => {
    if (ms <= 0) return '—';
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    return `${m}m ${sec}s`;
};

const GRID = 'rgba(130,130,140,0.18)';
const TICK = 'rgba(128,128,136,0.85)';

const statusConfig = (s: ServerStatus): { label: string; color: string; pulse: boolean } => {
    if (s === 'running') return { label: 'Online', color: '#22c55e', pulse: false };
    if (s === 'starting') return { label: 'Starting', color: '#facc15', pulse: true };
    if (s === 'stopping') return { label: 'Stopping', color: '#facc15', pulse: true };
    return { label: 'Offline', color: '#525252', pulse: false };
};

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
}

const StatCard = ({ icon, label, value, sub }: StatCardProps) => (
    <div css={tw`rounded-lg border border-white/10 bg-black px-4 py-4 flex flex-col gap-3`}>
        <div css={tw`flex items-center gap-2`}>
            <div css={tw`flex items-center justify-center w-8 h-8 rounded-md bg-white/5`}>{icon}</div>
            <span css={tw`text-xs font-medium text-neutral-400 uppercase tracking-wide`}>{label}</span>
        </div>
        <div>
            <p css={tw`text-xl font-semibold text-neutral-100 leading-none tabular-nums`}>{value}</p>
            {sub && <p css={tw`text-xs text-neutral-500 mt-1`}>{sub}</p>}
        </div>
    </div>
);

interface ChartCardProps {
    title: string;
    current: string;
    legend?: React.ReactNode;
    children: React.ReactNode;
}

const ChartCard = ({ title, current, legend, children }: ChartCardProps) => (
    <div css={tw`rounded-lg border border-white/10 bg-black overflow-hidden`}>
        <div css={tw`flex items-center justify-between px-4 pt-4 pb-2`}>
            <div css={tw`flex items-center gap-2`}>
                <h3 css={tw`text-sm font-medium text-neutral-400`}>{title}</h3>
                {legend}
            </div>
            <span css={tw`text-sm font-semibold text-neutral-100 tabular-nums`}>{current}</span>
        </div>
        <div css={tw`px-2 pb-3`}>{children}</div>
    </div>
);

export default () => {
    const status = ServerContext.useStoreState((s) => s.status.value);
    const limits = ServerContext.useStoreState((s) => s.server.data!.limits);
    const { instance, connected } = ServerContext.useStoreState((s) => s.socket);

    const [uptime, setUptime] = useState(0);
    const [cpuVal, setCpuVal] = useState(0);
    const [memVal, setMemVal] = useState(0);     // MiB
    const [diskVal, setDiskVal] = useState(0);   // bytes
    const [netIn, setNetIn] = useState(0);       // bytes per tick
    const [netOut, setNetOut] = useState(0);     // bytes per tick
    const [playerCount, setPlayerCount] = useState<number | null>(null);

    const prevNet = useRef({ tx: -1, rx: -1 });
    const awaitingPlayers = useRef(false);
    const playerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cpuLimit = limits.cpu > 0 ? limits.cpu : 100;
    const memLimitMiB = limits.memory > 0 ? limits.memory : undefined;
    const diskLimitBytes = limits.disk > 0 ? limits.disk * 1024 * 1024 : undefined;

    const cpuChart = useChart('CPU', {
        sets: 1,
        options: {
            scales: {
                y: {
                    min: 0,
                    suggestedMax: cpuLimit,
                    ticks: { count: 3, color: TICK, callback: (v: any) => `${Number(v).toFixed(0)}%` },
                    grid: { color: GRID },
                },
            },
        },
        callback: (opts) => ({
            ...opts,
            borderColor: theme('colors.cyan.400'),
            backgroundColor: hexToRgba(theme('colors.cyan.700'), 0.35),
        }),
    });

    const memChart = useChart('Memory', {
        sets: 1,
        options: {
            scales: {
                y: {
                    min: 0,
                    suggestedMax: memLimitMiB,
                    ticks: {
                        count: 3,
                        color: TICK,
                        callback: (v: any) => bytesToString(Number(v) * 1024 * 1024),
                    },
                    grid: { color: GRID },
                },
            },
        },
        callback: (opts) => ({
            ...opts,
            borderColor: theme('colors.green.400'),
            backgroundColor: hexToRgba(theme('colors.green.700'), 0.35),
        }),
    });

    const netChart = useChart('Network', {
        sets: 2,
        options: {
            scales: {
                y: {
                    min: 0,
                    ticks: {
                        count: 3,
                        color: TICK,
                        callback: (v: any) => bytesToString(Number(v)),
                    },
                    grid: { color: GRID },
                },
            },
        },
        callback: (opts, index) => ({
            ...opts,
            label: index === 0 ? 'In' : 'Out',
            borderColor: index === 0 ? theme('colors.cyan.400') : theme('colors.yellow.400'),
            backgroundColor: hexToRgba(
                index === 0 ? theme('colors.cyan.700') : theme('colors.yellow.700'),
                0.35
            ),
        }),
    });

    // Listen to stats before mounting effects that send commands
    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let v: any = {};
        try { v = JSON.parse(data); } catch { return; }

        const mem = Math.floor(v.memory_bytes / 1024 / 1024);
        const rxDelta = prevNet.current.rx < 0 ? 0 : Math.max(0, v.network.rx_bytes - prevNet.current.rx);
        const txDelta = prevNet.current.tx < 0 ? 0 : Math.max(0, v.network.tx_bytes - prevNet.current.tx);

        setCpuVal(Number(v.cpu_absolute.toFixed(1)));
        setMemVal(mem);
        setDiskVal(v.disk_bytes);
        setNetIn(rxDelta);
        setNetOut(txDelta);
        setUptime(v.uptime);

        cpuChart.push(v.cpu_absolute);
        memChart.push(mem);
        netChart.push([rxDelta, txDelta]);

        prevNet.current = { tx: v.network.tx_bytes, rx: v.network.rx_bytes };
    });

    useWebsocketEvent(SocketEvent.CONSOLE_OUTPUT, (line: string) => {
        if (!awaitingPlayers.current) return;
        const clean = stripAnsi(line);
        const match = clean.match(/there are (\d+).*players online/i);
        if (match) {
            setPlayerCount(parseInt(match[1], 10));
            awaitingPlayers.current = false;
            if (playerTimer.current) clearTimeout(playerTimer.current);
        }
    });

    const fetchPlayers = useCallback(() => {
        if (!instance || !connected || status !== 'running') return;
        if (playerTimer.current) clearTimeout(playerTimer.current);
        awaitingPlayers.current = true;
        instance.send('send command', 'list');
        // Give up after 5s if no parseable response
        playerTimer.current = setTimeout(() => {
            awaitingPlayers.current = false;
        }, 5000);
    }, [instance, connected, status]);

    useEffect(() => {
        if (status === 'offline' || status === null) {
            cpuChart.clear();
            memChart.clear();
            netChart.clear();
            setCpuVal(0);
            setMemVal(0);
            setDiskVal(0);
            setNetIn(0);
            setNetOut(0);
            setUptime(0);
            setPlayerCount(null);
            prevNet.current = { tx: -1, rx: -1 };
        }
    }, [status]);

    useEffect(() => {
        if (connected && instance) {
            fetchPlayers();
        }
        if (!connected || status !== 'running') {
            setPlayerCount(null);
        }
        return () => {
            if (playerTimer.current) clearTimeout(playerTimer.current);
        };
    }, [connected, instance, status]);

    const sc = statusConfig(status);

    return (
        <ServerContentBlock title={'Metrics'} compact>
            <div
                css={tw`w-full bg-black px-4 sm:px-6 pt-4 pb-8`}
                style={{ minHeight: 'calc(100vh - var(--server-header-height, 6.25rem))' }}
            >
                <BeforeContent />

                {/* Status bar */}
                <div css={tw`flex items-center justify-between mb-5 px-4 py-3 rounded-lg border border-white/10 bg-black`}>
                    <div css={tw`flex items-center gap-2.5`}>
                        <span
                            css={tw`w-2.5 h-2.5 rounded-full flex-shrink-0`}
                            style={{ backgroundColor: sc.color }}
                            className={sc.pulse ? 'animate-pulse' : undefined}
                        />
                        <span css={tw`text-sm font-semibold text-neutral-200`}>{sc.label}</span>
                    </div>
                    <div css={tw`flex items-center gap-5 text-sm text-neutral-500`}>
                        {uptime > 0 && (
                            <span css={tw`flex items-center gap-1.5`}>
                                <Clock size={13} />
                                {formatUptime(uptime)}
                            </span>
                        )}
                        {playerCount !== null && (
                            <span css={tw`flex items-center gap-1.5`}>
                                <Users size={13} />
                                {playerCount} online
                            </span>
                        )}
                    </div>
                </div>

                {/* Stat cards */}
                <div css={tw`grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5`}>
                    <StatCard
                        icon={<Cpu size={16} css={tw`text-cyan-400`} />}
                        label={'CPU'}
                        value={status === 'running' ? `${cpuVal.toFixed(1)}%` : '—'}
                        sub={`Limit: ${cpuLimit}%`}
                    />
                    <StatCard
                        icon={<MemoryStick size={16} css={tw`text-green-400`} />}
                        label={'Memory'}
                        value={memVal > 0 ? bytesToString(memVal * 1024 * 1024) : '—'}
                        sub={memLimitMiB ? `Limit: ${bytesToString(memLimitMiB * 1024 * 1024)}` : 'Unlimited'}
                    />
                    <StatCard
                        icon={<HardDrive size={16} css={tw`text-blue-400`} />}
                        label={'Disk'}
                        value={diskVal > 0 ? bytesToString(diskVal) : '—'}
                        sub={diskLimitBytes ? `Limit: ${bytesToString(diskLimitBytes)}` : 'Unlimited'}
                    />
                    <StatCard
                        icon={<Activity size={16} css={tw`text-yellow-400`} />}
                        label={'Network'}
                        value={netIn > 0 || netOut > 0 ? `↓ ${bytesToString(netIn)}` : '—'}
                        sub={netOut > 0 ? `↑ ${bytesToString(netOut)} out` : undefined}
                    />
                </div>

                {/* Charts */}
                <div css={tw`grid grid-cols-1 lg:grid-cols-3 gap-3`}>
                    <ChartCard title={'CPU Usage'} current={status === 'running' ? `${cpuVal.toFixed(1)}%` : '—'}>
                        <Line {...cpuChart.props} />
                    </ChartCard>
                    <ChartCard
                        title={'Memory'}
                        current={memVal > 0 ? bytesToString(memVal * 1024 * 1024) : '—'}
                    >
                        <Line {...memChart.props} />
                    </ChartCard>
                    <ChartCard
                        title={'Network I/O'}
                        current={`↓ ${bytesToString(netIn)}`}
                        legend={
                            <div css={tw`flex items-center gap-2 text-xs text-neutral-500`}>
                                <span css={tw`flex items-center gap-1`}>
                                    <span css={tw`w-2 h-2 rounded-full bg-cyan-400`} />
                                    In
                                </span>
                                <span css={tw`flex items-center gap-1`}>
                                    <span css={tw`w-2 h-2 rounded-full bg-yellow-400`} />
                                    Out
                                </span>
                            </div>
                        }
                    >
                        <Line {...netChart.props} />
                    </ChartCard>
                </div>

                <AfterContent />
            </div>
        </ServerContentBlock>
    );
};
