import axios from 'axios';

// Maps an egg's name to the Modrinth loader tag(s) it can actually run. A
// version's files are platform-specific (e.g. a "Velocity" build won't run
// on a Paper server even though both are "plugins"), so search/installs must
// be scoped to the loader(s) the server itself can use, not just any loader
// whose `supported_project_types` includes "plugin".
const EGG_LOADER_MAP: Record<string, string[]> = {
    Paper: ['paper', 'spigot', 'bukkit', 'purpur', 'folia'],
    Bungeecord: ['bungeecord', 'waterfall'],
    'Sponge (SpongeVanilla)': ['sponge'],
};

export const getPluginLoadersForEgg = (eggName: string): string[] | null => EGG_LOADER_MAP[eggName] || null;

// Modrinth's generic (non-loader) category tags that apply to mods/plugins,
// from `GET /v2/tag/category` filtered to `project_type === 'mod'`.
export const PLUGIN_CATEGORIES = [
    'adventure',
    'cursed',
    'decoration',
    'economy',
    'equipment',
    'food',
    'game-mechanics',
    'library',
    'magic',
    'management',
    'minigame',
    'mobs',
    'optimization',
    'social',
    'storage',
    'technology',
    'transportation',
    'utility',
    'worldgen',
];

export type ModrinthSortIndex = 'relevance' | 'downloads' | 'newest' | 'updated';

export const SORT_OPTIONS: { value: ModrinthSortIndex; label: string }[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'downloads', label: 'Most Downloads' },
    { value: 'newest', label: 'Newest' },
    { value: 'updated', label: 'Recently Updated' },
];

const modrinth = axios.create({
    baseURL: 'https://api.modrinth.com/v2',
    timeout: 10000,
});

export interface ModrinthHit {
    projectId: string;
    slug: string;
    title: string;
    description: string;
    author: string;
    iconUrl: string | null;
    downloads: number;
    categories: string[];
}

export interface ModrinthSearchResult {
    hits: ModrinthHit[];
    totalHits: number;
}

export interface SearchFilters {
    sort?: ModrinthSortIndex;
    gameVersion?: string | null;
    categories?: string[];
}

export const searchPlugins = async (
    query: string,
    loaders: string[],
    offset: number,
    limit: number,
    filters: SearchFilters = {}
): Promise<ModrinthSearchResult> => {
    const facets: string[][] = [loaders.map((loader) => `categories:${loader}`)];
    if (filters.gameVersion) {
        facets.push([`versions:${filters.gameVersion}`]);
    }
    if (filters.categories && filters.categories.length > 0) {
        facets.push(filters.categories.map((category) => `categories:${category}`));
    }

    const { data } = await modrinth.get('/search', {
        params: {
            query,
            offset,
            limit,
            index: filters.sort || 'relevance',
            facets: JSON.stringify(facets),
        },
    });

    return {
        totalHits: data.total_hits,
        hits: (data.hits || []).map(
            (hit: any): ModrinthHit => ({
                projectId: hit.project_id,
                slug: hit.slug,
                title: hit.title,
                description: hit.description,
                author: hit.author,
                iconUrl: hit.icon_url || null,
                downloads: hit.downloads,
                categories: hit.categories || [],
            })
        ),
    };
};

export interface ModrinthInstallableFile {
    url: string;
    filename: string;
}

export interface ModrinthVersion {
    id: string;
    versionNumber: string;
    gameVersions: string[];
    datePublished: string;
    file: ModrinthInstallableFile;
}

export const getProjectVersions = async (
    projectId: string,
    loaders: string[],
    gameVersion?: string | null
): Promise<ModrinthVersion[]> => {
    const params: Record<string, string> = { loaders: JSON.stringify(loaders) };
    if (gameVersion) {
        params.game_versions = JSON.stringify([gameVersion]);
    }

    const { data } = await modrinth.get(`/project/${projectId}/version`, { params });

    return (data || [])
        .map((version: any): ModrinthVersion | null => {
            const file = version.files.find((f: any) => f.primary) || version.files[0];
            if (!file) {
                return null;
            }

            return {
                id: version.id,
                versionNumber: version.version_number,
                gameVersions: version.game_versions || [],
                datePublished: version.date_published,
                file: { url: file.url, filename: file.filename },
            };
        })
        .filter((version: ModrinthVersion | null): version is ModrinthVersion => version !== null);
};

// Grabs and returns the newest version file compatible with the server —
// used by the one-click "Install" action.
export const getInstallableFile = async (
    projectId: string,
    loaders: string[],
    gameVersion: string | null
): Promise<ModrinthInstallableFile | null> => {
    const versions = await getProjectVersions(projectId, loaders, gameVersion);

    return versions[0]?.file ?? null;
};
