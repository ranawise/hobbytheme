import React, { useCallback, useEffect, useRef, useState } from 'react';
import tw from 'twin.macro';
import { RefreshCw, UserPlus, Users, Shield, Crown, Ban } from 'lucide-react';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import Spinner from '@/components/elements/Spinner';
import getFileContents from '@/api/server/files/getFileContents';
import OnlinePlayerRow from './OnlinePlayerRow';
import WhitelistRow from './WhitelistRow';
import OperatorRow from './OperatorRow';
import BanRow from './BanRow';
import AddPlayersModal from './AddPlayersModal';
import AddBanModal from './AddBanModal';

import BeforeContent from '@blueprint/components/Server/Players/BeforeContent';
import AfterContent from '@blueprint/components/Server/Players/AfterContent';

type LoadState = 'loading' | 'done';
type ModalTarget = 'whitelist' | 'ops' | 'ban' | null;

interface BanEntry { name: string; reason?: string; }

const stripAnsi = (str: string): string => str.replace(/\x1B\[[0-9;]*[mGKHF]/g, '');

const parsePlayerList = (line: string): string[] | null => {
    const clean = stripAnsi(line);
    const match = clean.match(/players online:\s*(.*)/i);
    if (!match) return null;
    const names = match[1].trim();
    if (!names) return [];
    return names.replace(/\.$/, '').split(',').map((n) => n.trim()).filter(Boolean);
};

const SectionHeader = ({
    icon,
    label,
    count,
    loadState,
    onRefresh,
    actions,
}: {
    icon: React.ReactNode;
    label: string;
    count: number;
    loadState: LoadState;
    onRefresh: () => void;
    actions?: React.ReactNode;
}) => (
    <div css={tw`flex items-center justify-between mb-3`}>
        <div css={tw`flex items-center gap-2`}>
            {icon}
            <h2 css={tw`text-sm font-semibold text-neutral-300 uppercase tracking-wide`}>
                {label}
                {loadState === 'done' && (
                    <span css={tw`ml-2 text-neutral-500 normal-case tracking-normal font-normal`}>
                        ({count})
                    </span>
                )}
            </h2>
        </div>
        <div css={tw`flex items-center gap-1`}>
            <button
                type={'button'}
                css={tw`flex items-center justify-center w-8 h-8 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-white/5 transition-colors`}
                onClick={onRefresh}
                title={'Refresh'}
            >
                <RefreshCw size={14} css={loadState === 'loading' ? tw`animate-spin` : undefined} />
            </button>
            {actions}
        </div>
    </div>
);

const AddButton = ({ onClick, label = 'Add' }: { onClick: () => void; label?: string }) => (
    <button
        type={'button'}
        css={tw`flex items-center gap-1.5 h-8 px-3 rounded-md text-sm text-neutral-300 border border-white/10 hover:border-white/20 hover:text-neutral-200 hover:bg-white/5 transition-colors`}
        onClick={onClick}
    >
        <UserPlus size={14} />
        {label}
    </button>
);

export default () => {
    const { instance, connected } = ServerContext.useStoreState((state) => state.socket);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    const notesKey = `ptero_notes_${uuid}`;
    const [notes, setNotesState] = useState<Record<string, string>>(() => {
        try { return JSON.parse(localStorage.getItem(notesKey) || '{}'); }
        catch { return {}; }
    });

    const setNote = useCallback((username: string, note: string) => {
        setNotesState((prev) => {
            const updated = { ...prev };
            if (note) { updated[username.toLowerCase()] = note; }
            else { delete updated[username.toLowerCase()]; }
            localStorage.setItem(notesKey, JSON.stringify(updated));
            return updated;
        });
    }, [notesKey]);

    const getNote = (username: string) => notes[username.toLowerCase()] || '';

    const [players, setPlayers] = useState<string[]>([]);
    const [whitelist, setWhitelist] = useState<string[]>([]);
    const [ops, setOps] = useState<string[]>([]);
    const [bans, setBans] = useState<BanEntry[]>([]);

    const [playersState, setPlayersState] = useState<LoadState>('loading');
    const [whitelistState, setWhitelistState] = useState<LoadState>('loading');
    const [opsState, setOpsState] = useState<LoadState>('loading');
    const [bansState, setBansState] = useState<LoadState>('loading');

    const [modalTarget, setModalTarget] = useState<ModalTarget>(null);

    const awaitingPlayers = useRef(false);
    const playerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchPlayers = useCallback(() => {
        if (!instance || !connected) return;
        if (playerTimer.current) clearTimeout(playerTimer.current);
        awaitingPlayers.current = true;
        setPlayersState('loading');
        instance.send('send command', 'list');
        playerTimer.current = setTimeout(() => {
            if (awaitingPlayers.current) {
                awaitingPlayers.current = false;
                setPlayersState('done');
            }
        }, 5000);
    }, [instance, connected]);

    useWebsocketEvent(SocketEvent.CONSOLE_OUTPUT, (line: string) => {
        if (!awaitingPlayers.current) return;
        const result = parsePlayerList(line);
        if (result !== null) {
            setPlayers(result);
            setPlayersState('done');
            awaitingPlayers.current = false;
            if (playerTimer.current) clearTimeout(playerTimer.current);
        }
    });

    useEffect(() => {
        if (connected && instance) fetchPlayers();
    }, [connected, instance]);

    useEffect(() => () => {
        if (playerTimer.current) clearTimeout(playerTimer.current);
    }, []);

    const loadWhitelist = useCallback(() => {
        setWhitelistState('loading');
        getFileContents(uuid, '/whitelist.json')
            .then((raw) => {
                const data: Array<{ name: string }> = JSON.parse(raw);
                setWhitelist(data.map((p) => p.name).filter(Boolean));
            })
            .catch(() => setWhitelist([]))
            .finally(() => setWhitelistState('done'));
    }, [uuid]);

    const loadOps = useCallback(() => {
        setOpsState('loading');
        getFileContents(uuid, '/ops.json')
            .then((raw) => {
                const data: Array<{ name: string }> = JSON.parse(raw);
                setOps(data.map((p) => p.name).filter(Boolean));
            })
            .catch(() => setOps([]))
            .finally(() => setOpsState('done'));
    }, [uuid]);

    const loadBans = useCallback(() => {
        setBansState('loading');
        getFileContents(uuid, '/banned-players.json')
            .then((raw) => {
                const data: Array<{ name: string; reason?: string }> = JSON.parse(raw);
                setBans(data.filter((p) => p.name).map((p) => ({ name: p.name, reason: p.reason })));
            })
            .catch(() => setBans([]))
            .finally(() => setBansState('done'));
    }, [uuid]);

    useEffect(() => {
        loadWhitelist();
        loadOps();
        loadBans();
    }, []);

    return (
        <ServerContentBlock title={'Players'} compact>
            <AddPlayersModal
                open={modalTarget === 'whitelist'}
                title={'Add to Whitelist'}
                file={'/whitelist.json'}
                confirmLabel={'Add to Whitelist'}
                onClose={() => setModalTarget(null)}
                onAdded={loadWhitelist}
            />
            <AddPlayersModal
                open={modalTarget === 'ops'}
                title={'Add Operator'}
                file={'/ops.json'}
                isOps
                confirmLabel={'Make Operator'}
                onClose={() => setModalTarget(null)}
                onAdded={loadOps}
            />
            <AddBanModal
                open={modalTarget === 'ban'}
                onClose={() => setModalTarget(null)}
                onAdded={loadBans}
            />
            <div
                css={tw`w-full bg-black px-4 sm:px-6 pt-4 pb-8`}
                style={{ minHeight: 'calc(100vh - var(--server-header-height, 6.25rem))' }}
            >
                <BeforeContent />

                {/* Online Players */}
                <div css={tw`mb-8`}>
                    <SectionHeader
                        icon={<Users size={16} css={tw`text-neutral-400`} />}
                        label={'Online Players'}
                        count={players.length}
                        loadState={playersState}
                        onRefresh={fetchPlayers}
                    />
                    {playersState === 'loading' ? (
                        <Spinner centered />
                    ) : !connected ? (
                        <p css={tw`text-sm text-neutral-500 text-center py-6`}>
                            Server is offline — start the server to see online players.
                        </p>
                    ) : players.length === 0 ? (
                        <p css={tw`text-sm text-neutral-500 text-center py-6`}>No players are currently online.</p>
                    ) : (
                        <div css={tw`flex flex-col gap-2`}>
                            {players.map((name) => (
                                <OnlinePlayerRow
                                    key={name}
                                    username={name}
                                    note={getNote(name)}
                                    onNoteChange={(n) => setNote(name, n)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Whitelist */}
                <div css={tw`mb-8`}>
                    <SectionHeader
                        icon={<Shield size={16} css={tw`text-neutral-400`} />}
                        label={'Whitelist'}
                        count={whitelist.length}
                        loadState={whitelistState}
                        onRefresh={loadWhitelist}
                        actions={<AddButton onClick={() => setModalTarget('whitelist')} />}
                    />
                    {whitelistState === 'loading' ? (
                        <Spinner centered />
                    ) : whitelist.length === 0 ? (
                        <p css={tw`text-sm text-neutral-500 text-center py-6`}>
                            The whitelist is empty. Use the Add button to whitelist players.
                        </p>
                    ) : (
                        <div css={tw`flex flex-col gap-2`}>
                            {whitelist.map((name) => (
                                <WhitelistRow
                                    key={name}
                                    username={name}
                                    note={getNote(name)}
                                    onNoteChange={(n) => setNote(name, n)}
                                    onRemoved={(n) => setWhitelist((prev) => prev.filter((x) => x !== n))}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Operators */}
                <div css={tw`mb-8`}>
                    <SectionHeader
                        icon={<Crown size={16} css={tw`text-yellow-500/70`} />}
                        label={'Operators'}
                        count={ops.length}
                        loadState={opsState}
                        onRefresh={loadOps}
                        actions={<AddButton onClick={() => setModalTarget('ops')} />}
                    />
                    {opsState === 'loading' ? (
                        <Spinner centered />
                    ) : ops.length === 0 ? (
                        <p css={tw`text-sm text-neutral-500 text-center py-6`}>
                            No operators found. Use the Add button to grant operator status.
                        </p>
                    ) : (
                        <div css={tw`flex flex-col gap-2`}>
                            {ops.map((name) => (
                                <OperatorRow
                                    key={name}
                                    username={name}
                                    note={getNote(name)}
                                    onNoteChange={(n) => setNote(name, n)}
                                    onRemoved={(n) => setOps((prev) => prev.filter((x) => x !== n))}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Banned Players */}
                <div>
                    <SectionHeader
                        icon={<Ban size={16} css={tw`text-red-400/70`} />}
                        label={'Banned Players'}
                        count={bans.length}
                        loadState={bansState}
                        onRefresh={loadBans}
                        actions={<AddButton onClick={() => setModalTarget('ban')} label={'Ban'} />}
                    />
                    {bansState === 'loading' ? (
                        <Spinner centered />
                    ) : bans.length === 0 ? (
                        <p css={tw`text-sm text-neutral-500 text-center py-6`}>No players are currently banned.</p>
                    ) : (
                        <div css={tw`flex flex-col gap-2`}>
                            {bans.map(({ name, reason }) => (
                                <BanRow
                                    key={name}
                                    username={name}
                                    reason={reason}
                                    note={getNote(name)}
                                    onNoteChange={(n) => setNote(name, n)}
                                    onRemoved={(n) => setBans((prev) => prev.filter((x) => x.name !== n))}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <AfterContent />
            </div>
        </ServerContentBlock>
    );
};
