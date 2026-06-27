import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { Dialog } from '@/components/elements/dialog';
import Spinner from '@/components/elements/Spinner';
import { Button } from '@/components/elements/button/index';
import { getProjectVersions, ModrinthHit, ModrinthVersion } from '@/api/modrinth';

interface Props {
    hit: ModrinthHit | null;
    loaders: string[];
    installingVersionId: string | null;
    onClose: () => void;
    onInstall: (version: ModrinthVersion) => void;
}

export default ({ hit, loaders, installingVersionId, onClose, onInstall }: Props) => {
    const [versions, setVersions] = useState<ModrinthVersion[] | null>(null);

    useEffect(() => {
        if (!hit) return;

        setVersions(null);
        getProjectVersions(hit.projectId, loaders)
            .then((data) => setVersions(data))
            .catch((error) => {
                console.error(error);
                setVersions([]);
            });
    }, [hit?.projectId]);

    return (
        <Dialog open={!!hit} onClose={onClose} title={hit ? `${hit.title} — Select Version` : ''}>
            {versions === null ? (
                <Spinner centered />
            ) : versions.length === 0 ? (
                <p css={tw`text-sm text-neutral-300`}>No compatible versions were found for this server.</p>
            ) : (
                <div css={tw`max-h-96 overflow-y-auto -mx-1 px-1`}>
                    {versions.map((version) => (
                        <div
                            key={version.id}
                            css={tw`flex items-center justify-between py-2 border-b border-neutral-600 last:border-0`}
                        >
                            <div css={tw`overflow-hidden mr-4`}>
                                <p css={tw`text-sm font-medium`}>{version.versionNumber}</p>
                                <p css={tw`text-xs text-neutral-400 truncate`}>
                                    {version.gameVersions.slice(0, 6).join(', ')}
                                    {version.gameVersions.length > 6 ? ', …' : ''}
                                </p>
                            </div>
                            <Button
                                variant={Button.Variants.Secondary}
                                size={Button.Sizes.Small}
                                css={tw`flex-shrink-0`}
                                disabled={installingVersionId === version.id}
                                onClick={() => onInstall(version)}
                            >
                                {installingVersionId === version.id ? 'Installing...' : 'Install'}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </Dialog>
    );
};
