import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import performPasswordReset from '@/api/auth/performPasswordReset';
import { httpErrorToHuman } from '@/api/http';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { Formik, FormikHelpers } from 'formik';
import { object, ref, string } from 'yup';
import Field from '@/components/elements/Field';
import Input from '@/components/elements/Input';
import Label from '@/components/elements/Label';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import styled from 'styled-components/macro';

interface Values {
    password: string;
    passwordConfirmation: string;
}

const AuthBtn = styled(Button)`
    background: #e4e4e7 !important;
    color: #09090b !important;
    border-radius: 8px !important;
    font-weight: 600;
    font-size: 13px;
    transition: background 0.15s !important;

    &:hover:not(:disabled) {
        background: #f4f4f5 !important;
    }

    &:disabled {
        opacity: 0.5 !important;
    }
`;

export default ({ match, location }: RouteComponentProps<{ token: string }>) => {
    const [email, setEmail] = useState('');

    const { clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const parsed = new URLSearchParams(location.search);
    if (email.length === 0 && parsed.get('email')) {
        setEmail(parsed.get('email') || '');
    }

    const submit = ({ password, passwordConfirmation }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();
        performPasswordReset(email, { token: match.params.token, password, passwordConfirmation })
            .then(() => {
                // @ts-expect-error this is valid
                window.location = '/';
            })
            .catch((error) => {
                console.error(error);
                setSubmitting(false);
                addFlash({ type: 'error', title: 'Error', message: httpErrorToHuman(error) });
            });
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{ password: '', passwordConfirmation: '' }}
            validationSchema={object().shape({
                password: string()
                    .required('A new password is required.')
                    .min(8, 'Your new password should be at least 8 characters in length.'),
                passwordConfirmation: string()
                    .required('Your new password does not match.')
                    // @ts-expect-error this is valid
                    .oneOf([ref('password'), null], 'Your new password does not match.'),
            })}
        >
            {({ isSubmitting }) => (
                <LoginFormContainer title={'Choose a new password'}>
                    <div>
                        <Label>Email</Label>
                        <Input value={email} disabled />
                    </div>
                    <div css={tw`mt-5`}>
                        <Field
                            label={'New Password'}
                            name={'password'}
                            type={'password'}
                            description={'Must be at least 8 characters.'}
                        />
                    </div>
                    <div css={tw`mt-5`}>
                        <Field label={'Confirm New Password'} name={'passwordConfirmation'} type={'password'} />
                    </div>
                    <div css={tw`mt-6`}>
                        <AuthBtn size={'xlarge'} type={'submit'} disabled={isSubmitting} isLoading={isSubmitting}>
                            Set New Password
                        </AuthBtn>
                    </div>
                    <div css={tw`mt-5 text-center`}>
                        <Link
                            to={'/auth/login'}
                            css={tw`text-xs text-neutral-600 tracking-wide no-underline uppercase hover:text-neutral-400 transition-colors`}
                        >
                            Return to Sign In
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};
