import http from '@/api/http';

export interface AvailablePlan {
    id: number;
    name: string;
    description: string | null;
    memory: number;
    disk: number;
    cpu: number;
    creditCost: number;
}

const rawDataToAvailablePlan = (data: any): AvailablePlan => ({
    id: data.id,
    name: data.name,
    description: data.description,
    memory: data.memory,
    disk: data.disk,
    cpu: data.cpu,
    creditCost: data.credit_cost,
});

export const getAvailablePlans = async (uuid: string): Promise<AvailablePlan[]> => {
    const { data } = await http.get(`/api/client/servers/${uuid}/plan`);

    return (data.data || []).map(rawDataToAvailablePlan);
};

export const changeServerPlan = async (uuid: string, planId: number): Promise<number> => {
    const { data } = await http.put(`/api/client/servers/${uuid}/plan`, { plan_id: planId });

    return data.net_credits;
};
