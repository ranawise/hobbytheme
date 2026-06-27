import http from '@/api/http';

export interface ExternalServerData {
    id: number;
    name: string;
    host: string;
    port: number;
    notes: string | null;
}

const rawDataToExternalServer = (data: any): ExternalServerData => ({
    id: data.id,
    name: data.name,
    host: data.host,
    port: data.port,
    notes: data.notes,
});

export const getExternalServers = async (): Promise<ExternalServerData[]> => {
    const { data } = await http.get('/api/client/account/external-servers');

    return (data.data || []).map(rawDataToExternalServer);
};

export interface CreateExternalServerPayload {
    name: string;
    host: string;
    port?: number;
    notes?: string;
}

export const createExternalServer = async (payload: CreateExternalServerPayload): Promise<ExternalServerData> => {
    const { data } = await http.post('/api/client/account/external-servers', payload);

    return rawDataToExternalServer(data);
};

export const deleteExternalServer = async (id: number): Promise<void> => {
    await http.delete(`/api/client/account/external-servers/${id}`);
};
