import React, { Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { CircleCheckIcon } from "@/libs/icons/CircleCheckIcon"

type Props = {
    showConfirmationMessage: boolean;
    setShowConfirmationMessage: Dispatch<SetStateAction<boolean>>
    confirmationMessage: string;
}

const DeletionSuccessDialog = ({ setShowConfirmationMessage, showConfirmationMessage, confirmationMessage }: Props) => {
    return (
        <Dialog open={showConfirmationMessage}>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader className='items-center'>
                    <CircleCheckIcon className='text-green-500' height={35} width={35} />
                    <DialogTitle className='text-center'>
                        {confirmationMessage}
                    </DialogTitle>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild onPress={() => setShowConfirmationMessage(false)}>
                        <Button>
                            <Text>OK</Text>
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeletionSuccessDialog