import http from '@/api/http';

export interface ServerIcon {
    id: string;
    name: string;
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'LIMITED';
    image_url: string;
    credit_cost: number;
    owned: boolean;
}

export interface OwnedIcon {
    id: string;
    name: string;
    rarity: ServerIcon['rarity'];
    image_url: string;
}

export interface ShopResponse {
    data: ServerIcon[];
    resets_at: string;
}

export const getShop = (): Promise<ShopResponse> =>
    http.get('/api/client/account/icons/shop').then(({ data }) => data);

export const getOwnedIcons = (): Promise<OwnedIcon[]> =>
    http.get('/api/client/account/icons/owned').then(({ data }) => data.data);

export const buyIcon = (iconId: string): Promise<{ message: string; credits: number }> =>
    http.post(`/api/client/account/icons/${iconId}/buy`).then(({ data }) => data);
