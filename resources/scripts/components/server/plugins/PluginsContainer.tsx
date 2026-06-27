import React, { useEffect, useState } from 'react';
import { Search, Download, GitBranch } from 'lucide-react';
import styled from 'styled-components/macro';
import { ServerContext } from '@/state/server';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import FlashMessageRender from '@/components/FlashMessageRender';
import Input from '@/components/elements/Input';
import Select from '@/components/elements/Select';
import Label from '@/components/elements/Label';
import Spinner from '@/components/elements/Spinner';
import Pagination from '@/components/elements/Pagination';
import { httpErrorToHuman, PaginatedResult } from '@/api/http';
import tw from 'twin.macro';
import { useFlashKey } from '@/plugins/useFlash';
import {
    getInstallableFile,
    getPluginLoadersForEgg,
    ModrinthHit,
    ModrinthSearchResult,
    ModrinthSortIndex,
    ModrinthVersion,
    PLUGIN_CATEGORIES,
    SORT_OPTIONS,
    searchPlugins,
} from '@/api/modrinth';
import pullFile from '@/api/server/files/pullFile';
import VersionPickerDialog from '@/components/server/plugins/VersionPickerDialog';

const LIMIT = 20;

const SearchInput = styled(Input)`
    && {
        ${tw`!bg-surface !border-white/10 !text-neutral-200 !pl-12`};

        &:focus {
            ${tw`!border-primary-600/60`};
        }
    }
`;

const FilterInput = styled(Input)`
    && {
        ${tw`!bg-surface !border-white/10 !text-neutral-200`};
    }
`;

const FilterSelect = styled(Select)`
    && {
        ${tw`!bg-surface !border-white/10 !text-neutral-200`};
    }
`;

const PluginRow = styled.div`
    ${tw`flex items-start gap-4 rounded-lg border border-white/10 bg-surface p-4`};
`;

const InstallButton = styled.button`
    ${tw`flex-shrink-0 rounded-md px-4 py-1.5 text-sm font-medium text-white bg-primary-500 transition-colors duration-150`};

    &:hover:not(:disabled) {
        ${tw`bg-primary-400`};
    }

    &:disabled {
        ${tw`opacity-60 cursor-default`};
    }
`;

const InstalledPill = styled.span`
    ${tw`flex-shrink-0 rounded-md px-4 py-1.5 text-sm font-medium text-neutral-400 bg-white/5`};
`;

const VersionsButton = styled.button`
    ${tw`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md text-neutral-400 transition-colors duration-150`};

    &:hover {
        ${tw`bg-white/5 text-neutral-200`};
    }
`;

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const egg = ServerContext.useStoreState((state) => state.server.data!.egg);
    const variables = ServerContext.useStoreState((state) => state.server.data!.variables);
    const { addError, clearFlashes } = useFlashKey('server:plugins');

    const loaders = getPluginLoadersForEgg(egg);

    const detectedVersion = (() => {
        const variable = variables.find((v) => v.envVariable === 'MINECRAFT_VERSION');
        const value = variable?.serverValue || variable?.defaultValue || '';

        return value && value.toLowerCase() !== 'latest' ? value : '';
    })();

    const [query, setQuery] = useState('');
    const [gameVersion, setGameVersion] = useState(detectedVersion);
    const [sort, setSort] = useState<ModrinthSortIndex>('relevance');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [result, setResult] = useState<ModrinthSearchResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [installingKey, setInstallingKey] = useState<string | null>(null);
    const [versionDialogHit, setVersionDialogHit] = useState<ModrinthHit | null>(null);

    // Persisted per-server so the "Installed" state on a plugin survives page
    // refreshes and navigating away/back, instead of resetting to "Install".
    const installedIdsStorageKey = `pterodactyl:plugins:${uuid}:installed`;
    const [installedIds, setInstalledIds] = useState<string[]>(() => {
        try {
            const stored = window.localStorage.getItem(installedIdsStorageKey);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const toggleCategory = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
        );
    };

    const runSearch = (searchPage: number) => {
        if (!loaders) return;

        setLoading(true);
        clearFlashes();
        searchPlugins(query, loaders, (searchPage - 1) * LIMIT, LIMIT, {
            sort,
            gameVersion: gameVersion || null,
            categories: selectedCategories,
        })
            .then((data) => setResult(data))
            .catch((error) => {
                console.error(error);
                addError(httpErrorToHuman(error));
            })
            .then(() => setLoading(false));
    };

    // Debounce every filter change (including typing in the search box) and
    // reset back to page one whenever the result set itself would change.
    useEffect(() => {
        const timeout = setTimeout(() => {
            setPage(1);
            runSearch(1);
        }, 350);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, sort, gameVersion, selectedCategories, loaders]);

    const goToPage = (newPage: number) => {
        setPage(newPage);
        runSearch(newPage);
    };

    const performInstall = (hit: ModrinthHit, file: { url: string; filename: string }) => {
        clearFlashes();

        return pullFile(uuid, file.url, '/plugins', file.filename)
            .then(() => {
                setInstalledIds((s) => {
                    const next = s.includes(hit.projectId) ? s : [...s, hit.projectId];
                    try {
                        window.localStorage.setItem(installedIdsStorageKey, JSON.stringify(next));
                    } catch {
                        // localStorage may be unavailable (e.g. private browsing); not fatal.
                    }
                    return next;
                });
                setVersionDialogHit(null);
            })
            .catch((error) => {
                console.error(error);
                addError(
                    error?.response?.status === 429
                        ? 'You can only install up to 5 plugins every 10 minutes. Please wait and try again.'
                        : httpErrorToHuman(error)
                );
            })
            .then(() => setInstallingKey(null));
    };

    const quickInstall = (hit: ModrinthHit) => {
        if (!loaders) return;

        setInstallingKey(hit.projectId);
        clearFlashes();
        getInstallableFile(hit.projectId, loaders, gameVersion || null)
            .then((file) => {
                if (!file) {
                    addError(`No compatible version of "${hit.title}" could be found for this server.`);
                    setInstallingKey(null);
                    return;
                }

                return performInstall(hit, file);
            })
            .catch((error) => {
                console.error(error);
                addError(httpErrorToHuman(error));
                setInstallingKey(null);
            });
    };

    const installSpecificVersion = (version: ModrinthVersion) => {
        if (!versionDialogHit) return;

        setInstallingKey(version.id);
        performInstall(versionDialogHit, version.file);
    };

    if (!loaders) {
        return (
            <ServerContentBlock title={'Plugins'}>
                <p css={tw`text-sm text-neutral-300`}>
                    Plugins aren&apos;t available for this server&apos;s software. This page currently supports
                    Paper, Bungeecord, and Sponge servers.
                </p>
            </ServerContentBlock>
        );
    }

    const paginated: PaginatedResult<ModrinthHit> = {
        items: result?.hits || [],
        pagination: {
            total: result?.totalHits || 0,
            count: result?.hits.length || 0,
            perPage: LIMIT,
            currentPage: page,
            totalPages: Math.max(1, Math.ceil((result?.totalHits || 0) / LIMIT)),
        },
    };

    const rangeStart = paginated.items.length === 0 ? 0 : (page - 1) * LIMIT + 1;
    const rangeEnd = (page - 1) * LIMIT + paginated.items.length;

    return (
        <ServerContentBlock title={'Plugins'} compact>
            <div
                css={tw`w-full bg-black px-4 sm:px-6 pt-4 pb-8`}
                style={{ minHeight: 'calc(100vh - var(--server-header-height, 6.25rem))' }}
            >
                <FlashMessageRender byKey={'server:plugins'} css={tw`mb-4`} />
                <VersionPickerDialog
                    hit={versionDialogHit}
                    loaders={loaders}
                    installingVersionId={installingKey}
                    onClose={() => setVersionDialogHit(null)}
                    onInstall={installSpecificVersion}
                />
                <div css={tw`relative mb-2`}>
                    <div css={tw`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none`}>
                        <Search size={16} css={tw`text-neutral-500`} />
                    </div>
                    <SearchInput
                        type={'text'}
                        placeholder={'Search plugins on Modrinth...'}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                {!loading && result && (
                    <p css={tw`text-sm text-neutral-500 mb-4`}>
                        {paginated.pagination.total.toLocaleString()} results
                        {paginated.items.length > 0 && ` · showing ${rangeStart}–${rangeEnd}`}
                    </p>
                )}
                <div css={tw`flex flex-wrap gap-4 mb-4`}>
                    <div css={tw`w-full sm:w-48`}>
                        <Label>Sort By</Label>
                        <FilterSelect value={sort} onChange={(e) => setSort(e.target.value as ModrinthSortIndex)}>
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </FilterSelect>
                    </div>
                    <div css={tw`w-full sm:w-48`}>
                        <Label>Minecraft Version</Label>
                        <FilterInput
                            type={'text'}
                            placeholder={'Any version'}
                            value={gameVersion}
                            onChange={(e) => setGameVersion(e.target.value)}
                        />
                    </div>
                </div>
                <div css={tw`flex flex-wrap gap-2 mb-6`}>
                    {PLUGIN_CATEGORIES.map((category) => (
                        <button
                            key={category}
                            type={'button'}
                            onClick={() => toggleCategory(category)}
                            css={[
                                tw`text-xs uppercase px-3 py-1 rounded-full border transition-colors duration-150`,
                                selectedCategories.includes(category)
                                    ? tw`bg-primary-500 border-primary-600 text-white`
                                    : tw`bg-surface border-white/10 text-neutral-400 hover:border-white/20 hover:text-neutral-200`,
                            ]}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                {loading && !result ? (
                    <Spinner centered size={'large'} />
                ) : paginated.items.length === 0 ? (
                    <p css={tw`text-center text-sm text-neutral-400`}>No plugins found.</p>
                ) : (
                    <Pagination data={paginated} onPageSelect={goToPage}>
                        {({ items }) => (
                            <div css={tw`flex flex-col gap-2`}>
                                {items.map((hit) => (
                                    <PluginRow key={hit.projectId}>
                                        {hit.iconUrl ? (
                                            <img
                                                src={hit.iconUrl}
                                                css={tw`w-10 h-10 rounded-lg flex-shrink-0`}
                                                alt={hit.title}
                                            />
                                        ) : (
                                            <div css={tw`w-10 h-10 rounded-lg bg-white/5 flex-shrink-0`} />
                                        )}
                                        <div css={tw`flex-1 overflow-hidden`}>
                                            <p css={tw`text-sm font-semibold text-white`}>{hit.title}</p>
                                            <p css={tw`text-xs text-neutral-400 mt-0.5 truncate`}>
                                                {hit.description}
                                            </p>
                                        </div>
                                        <div css={tw`flex flex-col items-end gap-2 flex-shrink-0`}>
                                            <span css={tw`flex items-center gap-1 text-xs text-neutral-500`}>
                                                <Download size={12} />
                                                {hit.downloads >= 1_000_000
                                                    ? `${(hit.downloads / 1_000_000).toFixed(1)}M`
                                                    : hit.downloads >= 1_000
                                                    ? `${(hit.downloads / 1_000).toFixed(1)}K`
                                                    : hit.downloads}
                                            </span>
                                            <div css={tw`flex items-center gap-2`}>
                                                <VersionsButton
                                                    type={'button'}
                                                    title={'Versions'}
                                                    onClick={() => setVersionDialogHit(hit)}
                                                >
                                                    <GitBranch size={14} />
                                                </VersionsButton>
                                                {installedIds.includes(hit.projectId) ? (
                                                    <InstalledPill>Installed</InstalledPill>
                                                ) : (
                                                    <InstallButton
                                                        type={'button'}
                                                        disabled={installingKey === hit.projectId}
                                                        onClick={() => quickInstall(hit)}
                                                    >
                                                        {installingKey === hit.projectId
                                                            ? 'Installing...'
                                                            : 'Install'}
                                                    </InstallButton>
                                                )}
                                            </div>
                                        </div>
                                    </PluginRow>
                                ))}
                            </div>
                        )}
                    </Pagination>
                )}
            </div>
        </ServerContentBlock>
    );
};
