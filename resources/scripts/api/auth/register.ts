import http from '@/api/http';

export interface RegisterData {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    password: string;
    password_confirmation: string;
}

export default (data: RegisterData): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.post('/auth/register', data)
            .then(({ data }) => resolve(data.message))
            .catch(reject);
    });
};
