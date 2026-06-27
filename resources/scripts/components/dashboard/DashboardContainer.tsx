import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerCard from '@/components/dashboard/ServerCard';
import SortableServerCard from '@/components/dashboard/SortableServerCard';
import NewServerCard from '@/components/dashboard/NewServerCard';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import ServerCreationWizard from '@/components/dashboard/wizard/ServerCreationWizard';
import { getFreeServerData } from '@/api/account/freeServer';
import ExternalServerRow from '@/components/dashboard/ExternalServerRow';
import { getExternalServers } from '@/api/account/externalServer';

import BeforeContent from '@blueprint/components/Dashboard/Serverlist/BeforeContent';
import AfterContent from '@blueprint/components/Dashboard/Serverlist/AfterContent';

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const [showCreateServer, setShowCreateServer] = useState(false);
    const [filterQuery, setFilterQuery] = useState('');
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);
    const [order, setOrder] = usePersistedState<string[]>(`${uuid}:server_order`, []);
    const [onlineMap, setOnlineMap] = useState<Record<string, boolean>>({});

    const handleStatusChange = useCallback((id: string, isOnline: boolean) => {
        setOnlineMap((prev) => ({ ...prev, [id]: isOnline }));
    }, []);

    useEffect(() => {
        const prev = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#101013';
        return () => { document.body.style.backgroundColor = prev; };
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined }),
        {}
    );

    const { data: freeServerData } = useSWR('/api/client/account/free-server', getFreeServerData);

    const { data: externalServers, mutate: mutateExternalServers } = useSWR(
        '/api/client/account/external-servers',
        getExternalServers
    );
    const freeServerEnabled = !!freeServerData && freeServerData.enabled;

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        // Don't use react-router to handle changing this part of the URL, otherwise it
        // triggers a needless re-render. We just want to track this in the URL incase the
        // user refreshes the page.
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    // Sorts servers according to the user's saved drag-and-drop order, persisted
    // per-account in localStorage. Servers not yet present in that order (newly
    // created, or not yet dragged) are appended at the end in their API order.
    const sortByOrder = (items: Server[]): Server[] => {
        if (!order || order.length === 0) return items;

        const remaining = new Map(items.map((server) => [server.uuid, server]));
        const sorted: Server[] = [];

        order.forEach((id) => {
            const match = remaining.get(id);
            if (match) {
                sorted.push(match);
                remaining.delete(id);
            }
        });

        items.forEach((server) => {
            if (remaining.has(server.uuid)) sorted.push(server);
        });

        return sorted;
    };

    const serverCountLabel = useMemo(() => {
        if (!servers) return null;
        const total = servers.pagination.total;
        const onlineCount = Object.values(onlineMap).filter(Boolean).length;
        const reported = Object.keys(onlineMap).length;
        if (reported > 0) {
            return `${onlineCount} online · ${total} server${total === 1 ? '' : 's'}`;
        }
        return `${total} server${total === 1 ? '' : 's'}`;
    }, [servers, onlineMap]);

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            <BeforeContent />
            <ServerCreationWizard
                open={showCreateServer}
                onClose={() => setShowCreateServer(false)}
                onExternalServerCreated={() => mutateExternalServers()}
            />
            <div css={tw`flex flex-wrap gap-2 justify-between items-end mb-6`}>
                <div>
                    <h1 css={tw`text-2xl font-bold text-white`}>Servers</h1>
                    {serverCountLabel && <p css={tw`text-sm text-neutral-400 mt-1`}>{serverCountLabel}</p>}
                </div>
                <div css={tw`flex items-center`}>
                    {freeServerEnabled && freeServerData && (
                        <p css={tw`uppercase text-xs text-neutral-400 mr-4`}>
                            {freeServerData.freeServerCount}/{freeServerData.freeServerSlots} free server slots used
                        </p>
                    )}
                    {rootAdmin && (
                        <>
                            <p css={tw`uppercase text-xs text-neutral-400 mr-2`}>
                                {showOnlyAdmin ? "Showing others' servers" : 'Showing your servers'}
                            </p>
                            <Switch
                                name={'show_all_servers'}
                                defaultChecked={showOnlyAdmin}
                                onChange={() => setShowOnlyAdmin((s) => !s)}
                            />
                        </>
                    )}
                </div>
            </div>
            <div css={tw`flex flex-wrap gap-4 justify-between items-center mb-6`}>
                <div css={tw`relative flex-1 min-w-[16rem] max-w-md`}>
                    <div css={tw`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none`}>
                        <Search size={16} css={tw`text-neutral-500`} />
                    </div>
                    <input
                        type={'text'}
                        placeholder={'Filter servers...'}
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.currentTarget.value)}
                        css={tw`w-full bg-surface border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-primary-600/60`}
                    />
                </div>
                <button
                    type={'button'}
                    onClick={() => setShowCreateServer(true)}
                    css={tw`flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors duration-150`}
                >
                    <Plus size={16} />
                    New server
                </button>
            </div>
            {!servers ? (
                <Spinner centered size={'large'} />
            ) : (
                <Pagination data={servers} onPageSelect={setPage}>
                    {({ items }) => {
                        if (items.length === 0) {
                            return showOnlyAdmin ? (
                                <p css={tw`text-center text-sm text-neutral-400 py-12`}>
                                    There are no other servers to display.
                                </p>
                            ) : (
                                <div css={tw`flex flex-col items-center justify-center py-20 text-center`}>
                                    <div
                                        css={tw`w-16 h-16 rounded-2xl flex items-center justify-center mb-5`}
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                                    >
                                        <Plus size={28} css={tw`text-neutral-500`} />
                                    </div>
                                    <h2 css={tw`text-lg font-semibold text-white mb-2`}>No servers yet</h2>
                                    <p css={tw`text-sm text-neutral-500 mb-6 max-w-xs`}>
                                        Create your first server to get started. It only takes a few seconds.
                                    </p>
                                    <button
                                        type={'button'}
                                        onClick={() => setShowCreateServer(true)}
                                        css={tw`flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg px-5 py-2.5 transition-colors duration-150`}
                                    >
                                        <Plus size={15} />
                                        Create a server
                                    </button>
                                </div>
                            );
                        }

                        const filtered = filterQuery
                            ? items.filter((server) => server.name.toLowerCase().includes(filterQuery.toLowerCase()))
                            : items;

                        if (filtered.length === 0) {
                            return (
                                <p css={tw`text-center text-sm text-neutral-400`}>
                                    No servers match &quot;{filterQuery}&quot;.
                                </p>
                            );
                        }

                        const sorted = sortByOrder(filtered);

                        // Dragging while a text filter is active would reorder only the
                        // visible subset, which can't be written back to a coherent
                        // full-list order — so reordering is only enabled unfiltered.
                        if (filterQuery) {
                            return (
                                <div css={tw`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`}>
                                    {sorted.map((server) => (
                                        <ServerCard key={server.uuid} server={server} onStatusChange={handleStatusChange} />
                                    ))}
                                </div>
                            );
                        }

                        const handleDragEnd = ({ active, over }: DragEndEvent) => {
                            if (!over || active.id === over.id) return;

                            const ids = sorted.map((server) => server.uuid);
                            const oldIndex = ids.indexOf(active.id as string);
                            const newIndex = ids.indexOf(over.id as string);
                            if (oldIndex === -1 || newIndex === -1) return;

                            setOrder(arrayMove(ids, oldIndex, newIndex));
                        };

                        return (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext
                                    items={sorted.map((server) => server.uuid)}
                                    strategy={rectSortingStrategy}
                                >
                                    <div css={tw`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`}>
                                        {sorted.map((server) => (
                                            <SortableServerCard key={server.uuid} server={server} onStatusChange={handleStatusChange} />
                                        ))}
                                        <NewServerCard onClick={() => setShowCreateServer(true)} />
                                    </div>
                                </SortableContext>
                            </DndContext>
                        );
                    }}
                </Pagination>
            )}
            {!!externalServers?.length && (
                <>
                    <p css={tw`uppercase text-xs text-neutral-400 mt-8 mb-2`}>External servers</p>
                    {externalServers.map((server, index) => (
                        <ExternalServerRow
                            key={server.id}
                            server={server}
                            css={index > 0 ? tw`mt-2` : undefined}
                            onDeleted={() =>
                                mutateExternalServers(
                                    (prev) => prev?.filter((s) => s.id !== server.id),
                                    false
                                )
                            }
                        />
                    ))}
                </>
            )}
            <AfterContent />
        </PageContentBlock>
    );
};
