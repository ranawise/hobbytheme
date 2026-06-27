import http from '@/api/http';

export interface ServerTagOption {
    id: string;
    name: string;
    display_name: string;
    emoji: string;
    selected: boolean;
}

export const getServerTags = (uuid: string): Promise<ServerTagOption[]> =>
    http.get(`/api/client/servers/${uuid}/customize/tags`).then(({ data }) => data.tags);

export const setServerTags = (uuid: string, tagIds: string[]): Promise<void> =>
    http.post(`/api/client/servers/${uuid}/customize/tags`, { tag_ids: tagIds });

export const setServerIcon = (uuid: string, iconId: string | null): Promise<void> =>
    http.post(`/api/client/servers/${uuid}/customize/icon`, { icon_id: iconId });
