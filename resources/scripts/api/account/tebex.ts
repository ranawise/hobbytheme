import http from '@/api/http';

export interface TebexPackage {
    id: number;
    name: string;
    description: string;
    base_price: number;
    total_price: number;
    currency: string;
    discount: number;
    type: string;
    category: { id: number; name: string };
    image: string | null;
    disable_quantity: boolean;
    expiration_date: string | null;
}

export const getTebexPackages = async (): Promise<TebexPackage[]> => {
    const { data } = await http.get('/api/client/account/store/packages');
    return data.data as TebexPackage[];
};

export const createTebexCheckout = async (packageId: number, minecraftUsername?: string): Promise<string> => {
    const { data } = await http.post('/api/client/account/store/checkout', {
        package_id: packageId,
        ...(minecraftUsername ? { minecraft_username: minecraftUsername } : {}),
    });
    return data.checkout_url as string;
};
