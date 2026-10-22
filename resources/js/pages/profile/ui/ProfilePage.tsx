import { AppLayout } from "@/widgets/app-layout";
import { DeleteUserForm } from "./DeleteUserForm";
import { UpdatePasswordForm } from "./UpdatePasswordForm";
import { UpdateProfileInformationForm } from "./UpdateProfileInformationForm";

type Props = {
    mustVerifyEmail: boolean;
};

export function ProfilePage({ mustVerifyEmail }: Props) {
    return (
        <AppLayout header="Profile">
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                        <div className="max-w-xl">
                            <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} />
                        </div>
                    </div>

                    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                        <div className="max-w-xl">
                            <UpdatePasswordForm />
                        </div>
                    </div>

                    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
                        <div className="max-w-xl">
                            <DeleteUserForm />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
