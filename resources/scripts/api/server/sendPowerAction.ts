import http from '@/api/http';

export type PowerSignal = 'start' | 'stop' | 'restart' | 'kill';

export default (uuid: string, signal: PowerSignal): Promise<void> =>
    http.post(`/api/client/servers/${uuid}/power`, { signal }).then(() => undefined);
