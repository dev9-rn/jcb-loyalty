import { FlatList, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import useUser from '@/hooks/useUser';

import { CalendarIcon } from "@/libs/icons/CalendarIcon"
import axiosInstance from '@/utils/axiosInstance';
import { GET_FOC_COUPON_HISTORY } from '@/utils/routes';
import axios from 'axios';
import { Separator } from '@/components/ui/separator';
import { useToast } from 'react-native-toast-notifications';

type Props = {}

const FocCouponHistory = ({ }: Props) => {

    const { userDetails } = useUser();
    const { t } = useTranslation();
    const toast = useToast();

    const [focCouponHistoryData, setFocCouponHistoryData] = useState<IFocCouponsHistoryResponse | undefined>(undefined);

    // Mananging user's date selection
    const [selectedFromDate, setSelectedFromDate] = useState(new Date());
    const [selctedToDate, setSelectedToDate] = useState(new Date());
    const [showFromDate, setShowFromDate] = useState<boolean>(false)
    const [showToDate, setShowToDate] = useState<boolean>(false);

    useEffect(() => {
        fetchFocCouponHistory();
    }, [selctedToDate, selectedFromDate])

    const fetchFocCouponHistory = async () => {

        const focCouponFormData = new FormData();
        focCouponFormData.append('startDate', selectedFromDate.toDateString());
        focCouponFormData.append('endDate', selctedToDate.toDateString());
        focCouponFormData.append('distributorId', userDetails?.id);
        focCouponFormData.append('userType', userDetails?.userType);
        focCouponFormData.append('batchType', "1");

        try {
            const response = await axiosInstance.post(GET_FOC_COUPON_HISTORY, focCouponFormData);
            setFocCouponHistoryData(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, {
                    data: error.response
                });
                setFocCouponHistoryData(error.response?.data)
            }
        }
    };

    const onFromDateChange = (event?: DateTimePickerEvent, date?: Date) => {
        const currentDate = date;
        setShowFromDate(false);
        setSelectedFromDate(currentDate as Date);
    };

    const onToDateChange = (event?: DateTimePickerEvent, date?: Date) => {
        setShowToDate(false);
        console.log(date?.toLocaleDateString())
        setSelectedToDate(date as Date);
    };

    return (
        <View className='flex-1 bg-white'>
            <View className='flex-row items-center justify-around py-4 border-b border-muted'>
                <View className='items-center'>
                    <TouchableOpacity className='flex-row items-center gap-2 p-2' onPress={() => setShowFromDate(true)}>
                        <CalendarIcon className='text-primary' height={20} width={20} />
                        <Text>{t("coupon-history.from_date")}</Text>
                        <Text className='text-lg font-semibold'>{selectedFromDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>

                    {showFromDate && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={selectedFromDate}
                            mode={"date"}
                            is24Hour={true}
                            onChange={onFromDateChange}
                        />
                    )}
                </View>

                <View>
                    <TouchableOpacity className='flex-row items-center gap-2 p-2' onPress={() => setShowToDate(true)}>
                        <CalendarIcon className='text-primary' height={20} width={20} />
                        <Text>{t("coupon-history.to_date")}</Text>
                        <Text className='text-lg font-semibold'>{selctedToDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>

                    {showToDate && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            accentColor='#144799'
                            value={selectedFromDate}
                            mode={"date"}
                            is24Hour={true}
                            onChange={onToDateChange}
                        />
                    )}
                </View>
            </View>

            <FlatList
                contentContainerClassName='p-4'
                data={focCouponHistoryData?.batchesData}
                ItemSeparatorComponent={() => <Separator className='my-3.5' />}
                renderItem={({ item, index }) => {
                    return (
                        <View className='bg-slate-100 p-4 rounded-lg'>
                            <View className='flex-row items-center justify-between flex-wrap'>
                                <View className='flex-row items-center'>
                                    <Text className='text-lg'>AR No.{" "}</Text>
                                    <Text className='font-semibold text-lg flex-shrink'>
                                        {item.ar_number}
                                    </Text>
                                </View>
                                <View className='flex-row items-start'>
                                    <Text className='text-lg'>AR Date:{" "}</Text>
                                    <Text className='font-semibold text-lg'>{item.ar_date}</Text>
                                </View>
                            </View>
                            <Separator className='my-1' />
                            <View className='gap-2'>
                                <Text>
                                    Product Name:{" "}
                                    <Text className='font-medium'>
                                        {item.product_code_name}
                                    </Text>
                                </Text>
                                <Text>
                                    Total Coupons:{" "}
                                    <Text className='font-medium'>
                                        {item.total_coupons}
                                    </Text>
                                </Text>
                                <Text>
                                    Total Cartons Dispatched:{" "}
                                    <Text className='font-medium'>
                                        {item.total_cartons_dispatched}
                                    </Text>
                                </Text>
                                <Text>
                                    Total Packs Dispatched:{" "}
                                    <Text className='font-medium'>
                                        {item.total_packs_dispatched}
                                    </Text>
                                </Text>
                            </View>
                        </View>
                    )
                }}
                // onEndReached={async () => {
                //     if (couponHistoryData.length !== 0) {
                //         await fetchCouponHistories({ pageOffset: currentOffset, force: true });
                //     }
                // }}
                ListEmptyComponent={() => {
                    return (
                        <View className='items-center'>
                            <Text className='font-medium text-lg text-center'>
                                {t("coupon-history.no_data_found")}
                            </Text>
                        </View>
                    );
                }}
                onEndReachedThreshold={0.5}
                // ListFooterComponent={() => {
                //     return (
                //         <>
                //             {loading ? (
                //                 <ActivityIndicator />
                //             ) : currentOffset > 0 && !loading && !hasMore ? (
                //                 <View className='w-full my-4'>
                //                     <Text className='text-center'>No more redeem history!</Text>
                //                 </View>
                //             ) : null}
                //         </>
                //     )
                // }}
                keyExtractor={(item) => item.ar_number}
            />
        </View>
    )
}

export default FocCouponHistory