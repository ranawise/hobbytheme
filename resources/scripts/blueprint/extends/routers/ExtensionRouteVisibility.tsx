import React from 'react';
import { useHistory } from 'react-router-dom';
import { useBlueprintServerRouteVisible } from '@blueprint/extensions/budgetprops/elements/BudgetpropsNavFilter';
import { useBudgetServerStatus } from '@blueprint/extensions/budgetprops/hooks/useBudgetServer';
import { useDailybackupServerRouteVisible } from '@blueprint/extensions/dailybackup/elements/DailybackupNavFilter';
import { useExternalServerRouteVisible } from '@blueprint/extensions/hobbyservers/elements/ExternalServerNavFilter';
import { useHobbyServersServerMeta } from '@blueprint/extensions/hobbyservers/hooks/useHobbyServersServerMeta';
import { NavLink } from 'react-router-dom';
import Can from '@/components/elements/Can';
import { UiBadge } from '@blueprint/ui';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { ServerError } from '@/components/elements/ScreenBlock';
import { ServerRouteDefinition } from './routes';

export const useExtensionRouteVisible = (identifier: string, path?: string): boolean => {
    const budgetpropsVisible = useBlueprintServerRouteVisible(identifier);
    const dailybackupVisible = useDailybackupServerRouteVisible(identifier);
    const externalVisible = useExternalServerRouteVisible(identifier, path);

    return budgetpropsVisible && dailybackupVisible && externalVisible;
};

interface BlueprintNavLinkProps {
    route: ServerRouteDefinition;
    to: string;
    rootAdmin: boolean;
}

export const BlueprintNavLink = ({ route, to, rootAdmin }: BlueprintNavLinkProps) => {
    const visible = useExtensionRouteVisible(route.identifier, route.path);

    if (!visible) {
        return null;
    }

    if (route.permission) {
        return (
            <Can action={route.permission} matchAny>
                <NavLink to={to} exact={route.exact}>
                    {route.name}
                    {route.adminOnly ? (
                        <>
                            <span className={'hidden'}>(</span>
                            <UiBadge>ADMIN</UiBadge>
                            <span className={'hidden'}>)</span>
                        </>
                    ) : undefined}
                </NavLink>
            </Can>
        );
    }

    return (
        <NavLink to={to} exact={route.exact}>
            {route.name}
            {route.adminOnly ? (
                <>
                    <span className={'hidden'}>(</span>
                    <UiBadge>ADMIN</UiBadge>
                    <span className={'hidden'}>)</span>
                </>
            ) : undefined}
        </NavLink>
    );
};

interface BlueprintRouteProps {
    route: ServerRouteDefinition;
    rootAdmin: boolean;
    children: React.ReactNode;
}

export const BlueprintRouteGate = ({ route, rootAdmin, children }: BlueprintRouteProps) => {
    const history = useHistory();
    const budgetStatus = useBudgetServerStatus();
    const { meta: hobbyMeta, loading: hobbyMetaLoading } = useHobbyServersServerMeta();
    const visible = useExtensionRouteVisible(route.identifier, route.path);

    if (!rootAdmin && route.adminOnly) {
        return null;
    }

    if (route.identifier === 'budgetprops') {
        if (budgetStatus === 'loading') {
            return (
                <PageContentBlock>
                    <Spinner size={'large'} centered />
                </PageContentBlock>
            );
        }

        if (budgetStatus === 'not-budget') {
            return (
                <ServerError
                    message={
                        'Server Properties is only available on budget servers. Use the File Manager to edit server.properties on this server.'
                    }
                    onBack={() => history.goBack()}
                />
            );
        }

        return <>{children}</>;
    }

    if (!visible) {
        return null;
    }

    if (route.identifier === 'hobbyservers' && route.path === '/bedrock') {
        if (hobbyMetaLoading) {
            return (
                <PageContentBlock>
                    <Spinner size={'large'} centered />
                </PageContentBlock>
            );
        }

        if (!hobbyMeta.bedrock_available) {
            return (
                <ServerError
                    title={'Bedrock not available'}
                    message={
                        hobbyMeta.is_proxy
                            ? 'Bedrock cross-play is only supported on game servers, not network proxies.'
                            : hobbyMeta.is_external
                              ? 'External servers manage Bedrock on your own backend machine.'
                              : 'This server is not eligible for Bedrock support.'
                    }
                    onBack={() => history.goBack()}
                />
            );
        }
    }

    return <>{children}</>;
};
