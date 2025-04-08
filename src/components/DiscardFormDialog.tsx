import React, { Dispatch, SetStateAction } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type Props = {
    open: boolean;
    setIsFormDisabled: Dispatch<SetStateAction<boolean>>
    setDiscardChanges: Dispatch<SetStateAction<boolean>>
}

const DiscardFormDialog = ({ open, setIsFormDisabled, setDiscardChanges }: Props) => {

    const toggleDialogCancle = () => {
        setDiscardChanges(false);
        setIsFormDisabled(true);
    }

    return (
        <AlertDialog open={open}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove
                        your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onPress={() => toggleDialogCancle()}>
                        <Text>Cancel</Text>
                    </AlertDialogCancel>
                    <AlertDialogAction>
                        <Text>Continue</Text>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DiscardFormDialog