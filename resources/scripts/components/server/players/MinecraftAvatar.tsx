import React, { useState } from 'react';
import tw from 'twin.macro';

interface Props {
    username: string;
    size?: number;
    className?: string;
}

export default ({ username, size = 32, className }: Props) => {
    const [errored, setErrored] = useState(false);

    if (errored) {
        return (
            <div
                className={className}
                style={{ width: size, height: size }}
                css={tw`rounded bg-neutral-700 flex items-center justify-center text-xs text-neutral-400 font-bold flex-shrink-0`}
            >
                {username.slice(0, 2).toUpperCase()}
            </div>
        );
    }

    return (
        <img
            className={className}
            src={`https://mc-heads.net/avatar/${username}/${size}`}
            alt={username}
            width={size}
            height={size}
            onError={() => setErrored(true)}
            style={{ width: size, height: size, imageRendering: 'pixelated' }}
            css={tw`rounded flex-shrink-0`}
        />
    );
};
