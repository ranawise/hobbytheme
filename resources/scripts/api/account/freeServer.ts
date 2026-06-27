import http from '@/api/http';

export interface FreeServerData {
    enabled: boolean;
    freeServerCount: number;
    freeServerSlots: number;
    credits: number;
    displayCredits: number;
    slotCost: number;
    eggName: string | null;
    specs: {
        memory: number;
        disk: number;
        cpu: number;
        swap: number;
        allocationLimit: number;
        databaseLimit: number;
        backupLimit: number;
    };
}

export const getFreeServerData = async (): Promise<FreeServerData> => {
    const { data } = await http.get('/api/client/account/free-server');

    return {
        enabled: data.enabled,
        freeServerCount: data.free_server_count,
        freeServerSlots: data.free_server_slots,
        credits: data.credits,
        displayCredits: data.display_credits ?? data.credits,
        slotCost: data.slot_cost,
        eggName: data.egg_name,
        specs: {
            memory: data.specs.memory,
            disk: data.specs.disk,
            cpu: data.specs.cpu,
            swap: data.specs.swap,
            allocationLimit: data.specs.allocation_limit,
            databaseLimit: data.specs.database_limit,
            backupLimit: data.specs.backup_limit,
        },
    };
};

export interface BuyFreeServerSlotResult {
    credits: number;
    freeServerSlots: number;
}

export const buyFreeServerSlot = async (): Promise<BuyFreeServerSlotResult> => {
    const { data } = await http.post('/api/client/account/free-server/buy-slot');

    return { credits: data.credits, freeServerSlots: data.free_server_slots };
};
