import React, { useState } from 'react'
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
import { View } from 'react-native';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

type Props = {
    isCouponTypeMultiple: boolean;
    validationData: IValidCoupon | undefined;
    fetchCouponRedeemResults: (data: string, redeemedType: string) => Promise<void>;
    qrData: string;
};

const radioButtonType: Record<number, "Cash" | "FOC"> = {
    0: "Cash",
    1: "FOC"
}

const CouponTypeRedeemDialog = ({ isCouponTypeMultiple, fetchCouponRedeemResults, validationData, qrData }: Props) => {

    const [redeemType, setRedeemType] = useState<string>("");

    return (
        <Dialog open={isCouponTypeMultiple}>
            <DialogContent className='max-w-sm'>
                <DialogHeader className='border-b border-gray-200 '>
                    <DialogTitle>Select Redemption Type</DialogTitle>
                    <DialogDescription className='pb-1'>
                        Select one of the redemption methods from the options listed below.
                    </DialogDescription>
                </DialogHeader>
                <View>
                    <RadioGroup value={redeemType} onValueChange={setRedeemType} className='flex-row items-center justify-around w-full'>
                        {validationData?.redeemMethods.map((button) => (
                            <View className={'flex-row gap-2 items-center'} key={button.redeem_type}>
                                <RadioGroupItem aria-labelledby={`label-for-${button.redeem_type}`} value={button.redeem_type} />
                                <Label nativeID={`label-for-${button.redeem_type}`}>
                                    {radioButtonType[Number(button.redeem_type)]}
                                </Label>
                            </View>
                        ))}
                    </RadioGroup>
                </View>
                {validationData?.product_details && (
                    <>
                        <Text className='text-lg font-medium'>Product Details: </Text>
                        <View className='flex-row items-center justify-between'>
                            <View>
                                <Text className='font-semibold'>Prodcut Name:</Text>
                                <Text className='font-semibold'>Denomination:</Text>
                            </View>
                            <View className=''>
                                <Text className='text-primary font-medium'>- {validationData?.product_details.product_name}</Text>
                                <Text className='text-primary font-medium'>- {validationData?.product_details.product_value}</Text>
                            </View>
                        </View>
                    </>
                )}
                <DialogFooter>
                    <Button disabled={!redeemType} onPress={() => fetchCouponRedeemResults(qrData, redeemType)}>
                        <Text>Redeem</Text>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CouponTypeRedeemDialog