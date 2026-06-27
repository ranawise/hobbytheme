import http from '@/api/http';

export interface Plan {
    id: number;
    name: string;
    description: string | null;
    memory: number;
    disk: number;
    cpu: number;
    swap: number;
    databaseLimit: number;
    allocationLimit: number;
    backupLimit: number;
    creditCost: number;
}

const rawDataToPlan = (data: any): Plan => ({
    id: data.id,
    name: data.name,
    description: data.description,
    memory: data.memory,
    disk: data.disk,
    cpu: data.cpu,
    swap: data.swap,
    databaseLimit: data.database_limit,
    allocationLimit: data.allocation_limit,
    backupLimit: data.backup_limit,
    creditCost: data.credit_cost,
});

export const getPlans = async (): Promise<Plan[]> => {
    const { data } = await http.get('/api/client/account/default-server/plans');

    return (data.data || []).map(rawDataToPlan);
};

export type Software = 'paper' | 'purpur' | 'fabric' | 'forge' | 'neoforge';

export interface VersionGroup {
    major: string;
    versions: { version: string; experimental: boolean }[];
}

export const getMinecraftVersions = async (software: Software): Promise<VersionGroup[]> => {
    const { data } = await http.get('/api/client/account/default-server/minecraft-versions', {
        params: { type: software },
    });

    return data.groups || [];
};

export const checkNameAvailable = async (name: string): Promise<boolean> => {
    const { data } = await http.get('/api/client/account/default-server/check-name', { params: { name } });

    return data.available;
};

export interface CreateDefaultServerPayload {
    name: string;
    planId: number;
    software: Software;
    minecraftVersion: string;
    worldType: 'normal' | 'flat';
    gamemode: 'survival' | 'creative' | 'adventure';
    operators: string;
}

export const createDefaultServer = async (payload: CreateDefaultServerPayload): Promise<string> => {
    const { data } = await http.post('/api/client/account/default-server', {
        name: payload.name,
        plan_id: payload.planId,
        software: payload.software,
        minecraft_version: payload.minecraftVersion,
        world_type: payload.worldType,
        gamemode: payload.gamemode,
        operators: payload.operators,
    });

    return data.identifier;
};
