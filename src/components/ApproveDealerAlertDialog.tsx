import React from 'react'
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
    postDealerAction: ({ dealer_id, isApproved }: { dealer_id: string, isApproved: string }) => Promise<void>;
    item: IDealerListDetail;
};

const ApproveDealerAlertDialog = ({ postDealerAction, item }: Props) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size={"sm"} onPress={() => postDealerAction({ dealer_id: item.id, isApproved: "1" })}>
                    <Text>Approve</Text>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure to approve this retailer ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will asign the retailer to your dealer's list.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
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

export default ApproveDealerAlertDialog