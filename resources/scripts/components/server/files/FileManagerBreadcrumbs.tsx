import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { NavLink, useLocation } from 'react-router-dom';
import { encodePathSegments, hashToPath } from '@/helpers';
import tw from 'twin.macro';

interface Props {
    withinFileEditor?: boolean;
    isNewFile?: boolean;
}

export default ({ withinFileEditor, isNewFile }: Props) => {
    const [file, setFile] = useState<string | null>(null);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const { hash } = useLocation();

    useEffect(() => {
        const path = hashToPath(hash);

        if (withinFileEditor && !isNewFile) {
            const name = path.split('/').pop() || null;
            setFile(name);
        }
    }, [withinFileEditor, isNewFile, hash]);

    const breadcrumbs = (): { name: string; path?: string }[] =>
        directory
            .split('/')
            .filter((directory) => !!directory)
            .map((directory, index, dirs) => {
                if (!withinFileEditor && index === dirs.length - 1) {
                    return { name: directory };
                }

                return { name: directory, path: `/${dirs.slice(0, index + 1).join('/')}` };
            });

    return (
        <div css={tw`flex flex-grow-0 items-center text-sm text-neutral-400 overflow-x-auto whitespace-nowrap`}>
            <NavLink
                to={`/server/${id}/files`}
                css={tw`px-1 text-neutral-400 no-underline hover:text-neutral-200 flex-shrink-0`}
            >
                /
            </NavLink>
            {breadcrumbs().map((crumb, index) =>
                crumb.path ? (
                    <React.Fragment key={index}>
                        <NavLink
                            to={`/server/${id}/files#${encodePathSegments(crumb.path)}`}
                            css={tw`px-1 text-neutral-300 no-underline hover:text-neutral-100 flex-shrink-0`}
                        >
                            {crumb.name}
                        </NavLink>
                        <span css={tw`text-neutral-600 flex-shrink-0`}>/</span>
                    </React.Fragment>
                ) : (
                    <span key={index} css={tw`px-1 text-white font-medium truncate`}>
                        {crumb.name}
                    </span>
                )
            )}
            {file && <span css={tw`px-1 text-white font-medium truncate`}>{file}</span>}
        </div>
    );
};
