import http from '@/api/http';

export const uploadAvatar = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('avatar', file);
    const { data } = await http.post('/api/client/account/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.avatar_url as string;
};

export const deleteAvatar = async (): Promise<void> => {
    await http.delete('/api/client/account/avatar');
};
