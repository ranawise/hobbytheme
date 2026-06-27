import React from 'react';

/* blueprint/import *//* HobbyserversImportStart */import HobbyserversMocymtmkma from '@blueprint/extensions/hobbyservers/sections/ServerBedrock';import HobbyserversBsgbpvtkoy from '@blueprint/extensions/hobbyservers/sections/ServerMotd';import HobbyserversNtdmshujii from '@blueprint/extensions/hobbyservers/sections/ExternalServerSettings';/* HobbyserversImportEnd *//* DailybackupImportStart */import DailybackupImihgjnugu from '@blueprint/extensions/dailybackup/sections/ServerDailyBackup';/* DailybackupImportEnd *//* BudgetpropsImportStart */import BudgetpropsWxduoaijfs from '@blueprint/extensions/budgetprops/sections/ServerProperties';/* BudgetpropsImportEnd */

interface RouteDefinition {
  path: string;
  name: string | undefined;
  component: React.ComponentType;
  exact?: boolean;
  adminOnly: boolean | false;
  identifier: string;
}
export interface ServerRouteDefinition extends RouteDefinition {
  permission: string | string[] | null;
}
interface Routes {
  account: RouteDefinition[];
  dashboard: RouteDefinition[];
  server: ServerRouteDefinition[];
}

export default {
  account: [
    /* routes/account *//* HobbyserversAccountRouteStart *//* HobbyserversAccountRouteEnd *//* DailybackupAccountRouteStart *//* DailybackupAccountRouteEnd *//* BudgetpropsAccountRouteStart *//* BudgetpropsAccountRouteEnd */
  ],
  dashboard: [
    /* routes/dashboard *//* HobbyserversDashboardRouteStart *//* HobbyserversDashboardRouteEnd */
  ],
  server: [
    /* routes/server *//* HobbyserversServerRouteStart */{ path: '/bedrock', permission: 'file.update', name: 'Bedrock Support', component: HobbyserversMocymtmkma, adminOnly: false, identifier: 'hobbyservers' },{ path: '/motd', permission: 'file.update', name: 'Server MOTD', component: HobbyserversBsgbpvtkoy, adminOnly: false, identifier: 'hobbyservers' },{ path: '/external', permission: 'file.update', name: 'External Server', component: HobbyserversNtdmshujii, adminOnly: false, identifier: 'hobbyservers' },/* HobbyserversServerRouteEnd *//* DailybackupServerRouteStart */{ path: '/daily-backup', permission: 'backup.read', name: 'Daily Backup', component: DailybackupImihgjnugu, adminOnly: false, identifier: 'dailybackup' },/* DailybackupServerRouteEnd *//* BudgetpropsServerRouteStart */{ path: '/properties', permission: 'file.update', name: 'Server Properties', component: BudgetpropsWxduoaijfs, adminOnly: false, identifier: 'budgetprops' },/* BudgetpropsServerRouteEnd */
  ],
} as Routes;
