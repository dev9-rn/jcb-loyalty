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

import { CircleCheckIcon } from "@/libs/icons/CircleCheckIcon"

type Props = {
    isCouponRedeemed: boolean
    redeemedData: IRedeemedCoupon | undefined;
    setIsCouponRedeem: Dispatch<SetStateAction<boolean>>
}

const CouponRedeemedDialog = ({ redeemedData, isCouponRedeemed, setIsCouponRedeem }: Props) => {

    return (
        <Dialog open={isCouponRedeemed}>
            <DialogContent className='max-w-sm'>
                <DialogHeader className='items-center'>
                    <CircleCheckIcon className='text-green-500' height={40} width={40} />

                    <DialogTitle className='text-center'>
                        {redeemedData?.message || "Coupon redeemed successfully."}
                    </DialogTitle>
                </DialogHeader>
                {redeemedData?.couponData && (
                    <>
                        <Text className='text-lg font-medium'>Product Details: </Text>
                        <View className='flex-row items-center justify-between'>
                            <View>
                                <Text className='font-semibold'>Prodcut Name:</Text>
                                <Text className='font-semibold'>Denomination:</Text>
                            </View>
                            <View className=''>
                                <Text className='text-primary font-medium'>{redeemedData?.couponData.product_name}</Text>
                                <Text className='text-primary font-medium'>{redeemedData?.couponData.value}</Text>
                            </View>
                        </View>
                    </>
                )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button onPress={() => setIsCouponRedeem(false)}>
                            <Text>OK</Text>
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CouponRedeemedDialog