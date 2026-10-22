import { useForm } from "@inertiajs/react";
import { useCallback, useState, type SubmitEvent } from "react";
import { DangerButton, InputError, InputLabel, Modal, SecondaryButton, TextInput } from "@/shared/ui";

export function DeleteUserForm() {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: "",
    });

    const closeModal = useCallback(() => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    }, [clearErrors, reset]);

    const deleteUser = (event: SubmitEvent) => {
        event.preventDefault();
        destroy(route("profile.destroy"), {
            errorBag: "userDeletion",
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
            },
            onFinish: () => {
                reset();
            },
        });
    };

    return (
        <section className="space-y-6">
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Delete Account</h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting
                    your account, please download any data or information that you wish to retain.
                </p>
            </header>

            <DangerButton
                type="button"
                onClick={() => {
                    setConfirmingUserDeletion(true);
                }}
            >
                Delete Account
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal} focusable>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Are you sure you want to delete your account?
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Once your account is deleted, all of its resources and data will be permanently deleted. Please enter
                        your password to confirm you would like to permanently delete your account.
                    </p>

                    <div className="mt-6">
                        <InputLabel htmlFor="password" className="sr-only">
                            Password
                        </InputLabel>

                        <TextInput
                            id="password"
                            name="password"
                            type="password"
                            className="mt-1 block w-3/4"
                            placeholder="Password"
                            value={data.password}
                            onChange={(event) => {
                                setData("password", event.target.value);
                            }}
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>

                        <DangerButton className="ml-3" disabled={processing}>
                            Delete Account
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
