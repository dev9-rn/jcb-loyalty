import React from 'react'
import { Button } from '@/components/ui/button';
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
import { Text } from '@/components/ui/text';

type Props = {
    handleAccountDeletion: () => Promise<void>
    isConditionChecked: boolean;
}

const RemoveAccountDialog = ({ isConditionChecked, handleAccountDeletion }: Props) => {

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant='destructive' disabled={!isConditionChecked}>
                    <Text>Remove my account</Text>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove
                        your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                        <Text>Cancel</Text>
                    </AlertDialogCancel>
                    <AlertDialogAction onPress={() => handleAccountDeletion()}>
                        <Text>Continue</Text>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default RemoveAccountDialog