import http, { FractalResponseData, FractalResponseList } from '@/api/http';
import { rawDataToServerAllocation, rawDataToServerEggVariable } from '@/api/transformers';
import { ServerEggVariable, ServerStatus } from '@/api/server/types';

export interface Allocation {
  id: number;
  ip: string;
  alias: string | null;
  port: number;
  notes: string | null;
  isDefault: boolean;
}

export interface ServerPlan {
  id: number;
  name: string;
  creditCost: number;
  renewsAt: string | null;
}

export interface Server {
  id: string;
  internalId: number | string;
  uuid: string;
  name: string;
  node: string;
  nest: string;
  egg: string;
  isNodeUnderMaintenance: boolean;
  isFree: boolean;
  status: ServerStatus;
  sftpDetails: {
    ip: string;
    port: number;
  };
  invocation: string;
  dockerImage: string;
  description: string;
  limits: {
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
    threads: string;
  };
  eggFeatures: string[];
  featureLimits: {
    databases: number;
    allocations: number;
    backups: number;
  };
  isTransferring: boolean;
  variables: ServerEggVariable[];
  allocations: Allocation[];
  domains: string[];
  plan: ServerPlan | null;
  iconImageUrl: string | null;

  // Define egg id from Blueprint
  BlueprintFramework: {
    eggId: number;
  };
}

export const rawDataToServerObject = ({ attributes: data }: FractalResponseData): Server => ({
  id: data.identifier,
  internalId: data.internal_id,
  uuid: data.uuid,
  name: data.name,
  node: data.node,
  nest: data.nest,
  egg: data.egg,
  isNodeUnderMaintenance: data.is_node_under_maintenance,
  isFree: data.is_free,
  status: data.status,
  invocation: data.invocation,
  dockerImage: data.docker_image,
  sftpDetails: {
    ip: data.sftp_details.ip,
    port: data.sftp_details.port,
  },
  description: data.description ? (data.description.length > 0 ? data.description : null) : null,
  limits: { ...data.limits },
  eggFeatures: data.egg_features || [],
  featureLimits: { ...data.feature_limits },
  isTransferring: data.is_transferring,
  variables: ((data.relationships?.variables as FractalResponseList | undefined)?.data || []).map(
    rawDataToServerEggVariable,
  ),
  allocations: ((data.relationships?.allocations as FractalResponseList | undefined)?.data || []).map(
    rawDataToServerAllocation,
  ),
  domains: data.domains || [],
  plan: data.plan
    ? {
        id: data.plan.id,
        name: data.plan.name,
        creditCost: data.plan.credit_cost,
        renewsAt: data.plan.renews_at || null,
      }
    : null,
  iconImageUrl: data.icon_image_url ?? null,

  // Get egg id from Blueprint
  BlueprintFramework: {
    eggId: data.BlueprintFramework.egg_id,
  },
});

export default (uuid: string): Promise<[Server, string[]]> => {
  return new Promise((resolve, reject) => {
    http
      .get(`/api/client/servers/${uuid}`)
      .then(({ data }) =>
        resolve([
          rawDataToServerObject(data),
          // eslint-disable-next-line camelcase
          data.meta?.is_server_owner ? ['*'] : data.meta?.user_permissions || [],
        ]),
      )
      .catch(reject);
  });
};
