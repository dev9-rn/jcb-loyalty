import * as React from 'react';
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
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

type Props = {
    isApprovalDialogVisible: boolean;
    approvalDialogContent: { status: number; message: string; } | undefined;
    setIsApprovalDialogVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const RetailerApprovalDialog = ({ approvalDialogContent, setIsApprovalDialogVisible, isApprovalDialogVisible }: Props) => {

    const { setColorScheme, } = useColorScheme();

    return (
        <Dialog open={isApprovalDialogVisible}>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader className='items-center'>
                    <CircleCheckIcon className='text-green-500' height={40} width={40} />
                    <DialogTitle>{approvalDialogContent?.message}</DialogTitle>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose
                        asChild
                        onPress={() => {
                            setIsApprovalDialogVisible(false)
                            router.replace("/(auth)")
                            setColorScheme("light");
                        }}
                    >
                        <Button>
                            <Text>OK</Text>
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default RetailerApprovalDialog