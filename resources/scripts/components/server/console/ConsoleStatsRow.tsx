import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import tw from 'twin.macro';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { useChart } from '@/components/server/console/chart';
import { bytesToString, mbToBytes } from '@/lib/formatters';
import UptimeDuration from '@/components/server/UptimeDuration';
import { capitalize } from '@/lib/strings';

const sparklineOptions = {
    scales: {
        y: {
            ticks: { display: false },
            grid: { display: false },
        },
    },
};

const Sparkline = ({ data, options }: { data: any; options: any }) => (
    <div css={tw`w-14 h-8 flex-shrink-0`}>
        <Line data={data} options={options} />
    </div>
);

export default () => {
    const status = ServerContext.useStoreState((state) => state.status.value);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const [cpuPercent, setCpuPercent] = useState(0);
    const [memoryBytes, setMemoryBytes] = useState(0);
    const [uptime, setUptime] = useState(0);

    const cpu = useChart('CPU', {
        sets: 1,
        options: sparklineOptions,
        callback: (value) => ({
            ...value,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
        }),
    });

    const memory = useChart('Memory', {
        sets: 1,
        options: sparklineOptions,
        callback: (value) => ({
            ...value,
            borderColor: '#60a5fa',
            backgroundColor: 'rgba(96, 165, 250, 0.15)',
        }),
    });

    useEffect(() => {
        if (status === 'offline') {
            cpu.clear();
            memory.clear();
            setCpuPercent(0);
            setMemoryBytes(0);
            setUptime(0);
        }
    }, [status]);

    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let values: any = {};
        try {
            values = JSON.parse(data);
        } catch (e) {
            return;
        }

        cpu.push(values.cpu_absolute);
        memory.push(Math.floor(values.memory_bytes / 1024 / 1024));
        setCpuPercent(values.cpu_absolute);
        setMemoryBytes(values.memory_bytes);
        setUptime(values.uptime || 0);
    });

    const memoryLimit = limits.memory !== 0 ? bytesToString(mbToBytes(limits.memory)) : 'Unlimited';

    return (
        <div css={tw`flex items-center gap-8 py-3 border-b border-white/10`}>
            <div css={tw`flex items-center gap-3`}>
                <Sparkline data={cpu.props.data} options={cpu.props.options} />
                <div>
                    <p css={tw`text-xs text-neutral-400`}>CPU</p>
                    <p css={tw`text-sm text-neutral-200`}>
                        {status === 'offline' || !status ? '—' : `${cpuPercent.toFixed(1)}%`}
                    </p>
                </div>
            </div>
            <div css={tw`flex items-center gap-3`}>
                <Sparkline data={memory.props.data} options={memory.props.options} />
                <div>
                    <p css={tw`text-xs text-neutral-400`}>RAM</p>
                    <p css={tw`text-sm text-neutral-200`}>
                        {status === 'offline' || !status ? '—' : `${bytesToString(memoryBytes)} / ${memoryLimit}`}
                    </p>
                </div>
            </div>
            <div css={tw`ml-auto text-right`}>
                <p css={tw`text-xs text-neutral-400`}>Uptime</p>
                <p css={tw`text-sm text-neutral-200`}>
                    {!status ? '—' : uptime > 0 ? <UptimeDuration uptime={uptime / 1000} /> : capitalize(status)}
                </p>
            </div>
        </div>
    );
};
