import React, { useState } from 'react';
import { Database, Eye, Trash2 } from 'lucide-react';
import Modal from '@/components/elements/Modal';
import { Form, Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import FlashMessageRender from '@/components/FlashMessageRender';
import { ServerContext } from '@/state/server';
import deleteServerDatabase from '@/api/server/databases/deleteServerDatabase';
import { httpErrorToHuman } from '@/api/http';
import RotatePasswordButton from '@/components/server/databases/RotatePasswordButton';
import Can from '@/components/elements/Can';
import { ServerDatabase } from '@/api/server/databases/getServerDatabases';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import styled, { css } from 'styled-components/macro';
import Button from '@/components/elements/Button';
import Label from '@/components/elements/Label';
import Input from '@/components/elements/Input';
import CopyOnClick from '@/components/elements/CopyOnClick';

interface Props {
    database: ServerDatabase;
    className?: string;
}

const Row = styled.div`
    ${tw`flex items-center gap-4 rounded-lg border border-white/10 bg-surface px-4 py-3 transition-colors duration-150`};

    &:hover {
        ${tw`border-white/20`};
    }
`;

const IconButton = styled.button`
    ${tw`flex items-center justify-center w-8 h-8 rounded-md text-neutral-400 transition-colors duration-150`};

    &:hover {
        ${tw`bg-white/5 text-neutral-200`};
    }

    &.danger:hover {
        ${tw`bg-red-500/10 text-red-400`};
    }
`;

// Overrides the inputs' old stock-Pterodactyl gray (Input.tsx's own
// `:not([type=...])` rules otherwise out-specificity a plain override) so
// they sit recessed against this modal's panel instead.
const themedInputs = css`
    input:not([type='checkbox']):not([type='radio']) {
        ${tw`!bg-surface !border-white/10 !text-neutral-200`};

        &:focus {
            ${tw`!border-primary-600/60`};
        }
    }
`;

const ThemedForm = styled(Form)`
    ${themedInputs}
`;

const ThemedModalBody = styled.div`
    ${themedInputs}
`;

export default ({ database, className }: Props) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { addError, clearFlashes } = useFlash();
    const [visible, setVisible] = useState(false);
    const [connectionVisible, setConnectionVisible] = useState(false);

    const appendDatabase = ServerContext.useStoreActions((actions) => actions.databases.appendDatabase);
    const removeDatabase = ServerContext.useStoreActions((actions) => actions.databases.removeDatabase);

    const jdbcConnectionString = `jdbc:mysql://${database.username}${
        database.password ? `:${encodeURIComponent(database.password)}` : ''
    }@${database.connectionString}/${database.name}`;

    const schema = object().shape({
        confirm: string()
            .required('The database name must be provided.')
            .oneOf([database.name.split('_', 2)[1], database.name], 'The database name must be provided.'),
    });

    const submit = (values: { confirm: string }, { setSubmitting }: FormikHelpers<{ confirm: string }>) => {
        clearFlashes();
        deleteServerDatabase(uuid, database.id)
            .then(() => {
                setVisible(false);
                setTimeout(() => removeDatabase(database.id), 150);
            })
            .catch((error) => {
                console.error(error);
                setSubmitting(false);
                addError({ key: 'database:delete', message: httpErrorToHuman(error) });
            });
    };

    return (
        <>
            <Formik onSubmit={submit} initialValues={{ confirm: '' }} validationSchema={schema} isInitialValid={false}>
                {({ isSubmitting, isValid, resetForm }) => (
                    <Modal
                        visible={visible}
                        dismissable={!isSubmitting}
                        showSpinnerOverlay={isSubmitting}
                        onDismissed={() => {
                            setVisible(false);
                            resetForm();
                        }}
                    >
                        <FlashMessageRender byKey={'database:delete'} css={tw`mb-6`} />
                        <h2 css={tw`text-2xl mb-6 text-white font-semibold`}>Confirm database deletion</h2>
                        <p css={tw`text-sm text-neutral-300`}>
                            Deleting a database is a permanent action, it cannot be undone. This will permanently delete
                            the <strong css={tw`text-white`}>{database.name}</strong> database and remove all
                            associated data.
                        </p>
                        <ThemedForm css={tw`m-0 mt-6`}>
                            <Field
                                type={'text'}
                                id={'confirm_name'}
                                name={'confirm'}
                                label={'Confirm Database Name'}
                                description={'Enter the database name to confirm deletion.'}
                            />
                            <div css={tw`mt-6 text-right`}>
                                <Button type={'button'} isSecondary css={tw`mr-2`} onClick={() => setVisible(false)}>
                                    Cancel
                                </Button>
                                <Button type={'submit'} color={'red'} disabled={!isValid}>
                                    Delete Database
                                </Button>
                            </div>
                        </ThemedForm>
                    </Modal>
                )}
            </Formik>
            <Modal visible={connectionVisible} onDismissed={() => setConnectionVisible(false)}>
                <ThemedModalBody>
                <FlashMessageRender byKey={'database-connection-modal'} css={tw`mb-6`} />
                <h3 css={tw`mb-6 text-2xl text-white font-semibold`}>Database connection details</h3>
                <div>
                    <Label>Endpoint</Label>
                    <CopyOnClick text={database.connectionString}>
                        <Input type={'text'} readOnly value={database.connectionString} />
                    </CopyOnClick>
                </div>
                <div css={tw`mt-6`}>
                    <Label>Connections from</Label>
                    <Input type={'text'} readOnly value={database.allowConnectionsFrom} />
                </div>
                <div css={tw`mt-6`}>
                    <Label>Username</Label>
                    <CopyOnClick text={database.username}>
                        <Input type={'text'} readOnly value={database.username} />
                    </CopyOnClick>
                </div>
                <Can action={'database.view_password'}>
                    <div css={tw`mt-6`}>
                        <Label>Password</Label>
                        <CopyOnClick text={database.password} showInNotification={false}>
                            <Input type={'text'} readOnly value={database.password} />
                        </CopyOnClick>
                    </div>
                </Can>
                <div css={tw`mt-6`}>
                    <Label>JDBC Connection String</Label>
                    <CopyOnClick text={jdbcConnectionString} showInNotification={false}>
                        <Input type={'text'} readOnly value={jdbcConnectionString} />
                    </CopyOnClick>
                </div>
                <div css={tw`mt-6 text-right`}>
                    <Can action={'database.update'}>
                        <RotatePasswordButton databaseId={database.id} onUpdate={appendDatabase} />
                    </Can>
                    <Button isSecondary onClick={() => setConnectionVisible(false)}>
                        Close
                    </Button>
                </div>
                </ThemedModalBody>
            </Modal>
            <Row className={className}>
                <div css={tw`hidden md:flex flex-shrink-0 items-center justify-center text-neutral-500`}>
                    <Database size={18} />
                </div>
                <div css={tw`flex-1 ml-1 md:ml-3 overflow-hidden`}>
                    <CopyOnClick text={database.name}>
                        <p css={tw`text-sm font-medium text-neutral-200 truncate cursor-pointer`}>{database.name}</p>
                    </CopyOnClick>
                </div>
                <div css={tw`ml-8 text-center hidden md:block`}>
                    <CopyOnClick text={database.connectionString}>
                        <p css={tw`text-sm text-neutral-300 cursor-pointer`}>{database.connectionString}</p>
                    </CopyOnClick>
                    <p css={tw`mt-1 text-2xs text-neutral-500 uppercase select-none`}>Endpoint</p>
                </div>
                <div css={tw`ml-8 text-center hidden md:block`}>
                    <p css={tw`text-sm text-neutral-300`}>{database.allowConnectionsFrom}</p>
                    <p css={tw`mt-1 text-2xs text-neutral-500 uppercase select-none`}>Connections from</p>
                </div>
                <div css={tw`ml-8 text-center hidden md:block`}>
                    <CopyOnClick text={database.username}>
                        <p css={tw`text-sm text-neutral-300 cursor-pointer`}>{database.username}</p>
                    </CopyOnClick>
                    <p css={tw`mt-1 text-2xs text-neutral-500 uppercase select-none`}>Username</p>
                </div>
                <div css={tw`ml-4 flex items-center gap-1 flex-shrink-0`}>
                    <IconButton type={'button'} title={'View'} onClick={() => setConnectionVisible(true)}>
                        <Eye size={16} />
                    </IconButton>
                    <Can action={'database.delete'}>
                        <IconButton
                            type={'button'}
                            className={'danger'}
                            title={'Delete'}
                            onClick={() => setVisible(true)}
                        >
                            <Trash2 size={16} />
                        </IconButton>
                    </Can>
                </div>
            </Row>
        </>
    );
};
