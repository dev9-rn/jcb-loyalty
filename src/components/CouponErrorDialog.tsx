import { View } from 'react-native'
import React, { Dispatch, SetStateAction } from 'react'

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
import { Button } from './ui/button';

import { CircleXIcon } from "@/libs/icons/CircleXIcon"

type Props = {
    isCouponInvalid: boolean
    validationData: IValidCoupon | undefined;
    setIsCouponInvalid: Dispatch<SetStateAction<boolean>>
}

const CouponErrorDialog = ({ isCouponInvalid, validationData, setIsCouponInvalid }: Props) => {
    return (
        <Dialog open={isCouponInvalid}>
            <DialogContent className='max-w-sm'>
                <DialogHeader className='items-center'>
                    <CircleXIcon className='text-red-500' height={40} width={40} />

                    <DialogTitle className='text-center'>
                        {validationData?.message || "Coupon redeemed successfully. Scan another coupon to grab more rewards"}
                    </DialogTitle>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button onPress={() => setIsCouponInvalid(false)}>
                            <Text>OK</Text>
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CouponErrorDialog