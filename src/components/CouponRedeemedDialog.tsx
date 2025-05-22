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
import { Separator } from './ui/separator';

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
                    <View className='items-center gap-2'>
                        <DialogTitle className='!text-primary'>
                            {redeemedData?.redeemMethods && (
                                <>
                                    {redeemedData?.redeemMethods[0].redeem_type === "1" ? "FOC Coupon" : "Cash Coupon"}
                                </>
                            )}
                            {redeemedData?.redeemedMethods && (
                                <>
                                    {redeemedData?.redeemedMethods[0].redeem_type === "1" ? "FOC Coupon" : "Cash Coupon"}
                                </>
                            )}
                        </DialogTitle>
                        <CircleCheckIcon className='text-green-500' height={35} width={35} />
                    </View>

                    <DialogTitle className='text-center'>
                        {redeemedData?.message || "Coupon redeemed successfully."}
                    </DialogTitle>
                </DialogHeader>
                <Separator />
                {redeemedData?.couponData && (
                    <View className='gap-2'>
                        <Text className='text-lg font-semibold'>Product Details: </Text>
                        <View className='flex-row items-center gap-2'>
                            <View>
                                <Text className='font-medium opacity-50'>Prodcut Name:</Text>
                                <Text className='font-medium opacity-50'>Denomination:</Text>
                            </View>
                            <View className=''>
                                <Text className='text-primary font-medium'>{redeemedData?.couponData.product_name}</Text>
                                <Text className='text-primary font-medium'>{redeemedData?.couponData.value}</Text>
                            </View>
                        </View>
                    </View>
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