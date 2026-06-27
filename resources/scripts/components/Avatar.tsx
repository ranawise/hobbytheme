import React from 'react';
import BoringAvatar, { AvatarProps } from 'boring-avatars';
import { useStoreState } from '@/state/hooks';

const palette = ['#FFAD08', '#EDD75A', '#73B06F', '#0C8F8F', '#587291'];

type Props = Omit<AvatarProps, 'colors'>;

const _Avatar = ({ variant = 'beam', ...props }: AvatarProps) => (
    <BoringAvatar colors={palette} variant={variant} {...props} />
);

const _UserAvatar = ({ variant = 'beam', size = 32, ...props }: Omit<Props, 'name'>) => {
    const uuid = useStoreState((state) => state.user.data?.uuid);
    const avatarUrl = useStoreState((state) => state.user.data?.avatarUrl);

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt='avatar'
                style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
            />
        );
    }

    return <BoringAvatar colors={palette} name={uuid || 'system'} variant={variant} size={size} {...props} />;
};

_Avatar.displayName = 'Avatar';
_UserAvatar.displayName = 'Avatar.User';

const Avatar = Object.assign(_Avatar, {
    User: _UserAvatar,
});

export default Avatar;
