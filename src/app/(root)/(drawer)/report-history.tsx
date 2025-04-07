import { View, Text, TouchableOpacity, FlatList, Image } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { CalendarIcon } from "@/libs/icons/CalendarIcon"
import axiosInstance from '@/utils/axiosInstance';
import { GET_REPORTED_COUPON_HISTORY } from '@/utils/routes';
import useUser from '@/hooks/useUser';
import { Separator } from '@/components/ui/separator';
import { useFocusEffect } from 'expo-router';
import axios from 'axios';
import { useToast } from 'react-native-toast-notifications';

type Props = {}

const ReportHistory = ({ }: Props) => {

    const { userDetails } = useUser();

    const [reportedCouponHistoryData, setReportedCouponHistoryData] = useState<IReportedCouponsHistory | undefined>(undefined);

    const toast = useToast();

    // Mananging user's date selection
    const [selectedFromDate, setSelectedFromDate] = useState(new Date());
    const [selctedToDate, setSelectedToDate] = useState(new Date());
    const [showFromDate, setShowFromDate] = useState<boolean>(false)
    const [showToDate, setShowToDate] = useState<boolean>(false);

    useFocusEffect(
        useCallback(() => {
            fetchReportedCouponsHistory();
        }, [selectedFromDate, selctedToDate])
    );

    const renderItem = useCallback(({ item, index }: { item: IReportedCoupon, index: number }) => {
        return (
            <View className='flex-row items-start justify-between' key={index}>
                <View>
                    <Text className='text-lg'>
                        Serial No:{" "}
                        <Text className='text-lg font-medium'>{item.sr_no}</Text>
                    </Text>
                    <Text className='text-lg'>
                        Description:{" "}
                        <Text className='text-lg font-medium'>{item.description}</Text>
                    </Text>
                    <Text className='text-lg'>
                        Serial No:{" "}
                        <Text className='text-lg font-medium'>{item.created}</Text>
                    </Text>
                </View>
                <View>
                    <Image source={{ uri: item.coupon_image }} className='size-36' />
                </View>
            </View>
        )
    }, [reportedCouponHistoryData]);

    const onFromDateChange = (event?: DateTimePickerEvent, date?: Date) => {
        const currentDate = date;
        setShowFromDate(false);
        setSelectedFromDate(currentDate as Date);
    };

    const onToDateChange = (event?: DateTimePickerEvent, date?: Date) => {
        setShowToDate(false);
        setSelectedToDate(date as Date);
    };

    const fetchReportedCouponsHistory = async () => {

        const reportedCouponHistoryFormData = new FormData();
        reportedCouponHistoryFormData.append('distributorId', userDetails?.id);
        reportedCouponHistoryFormData.append('fromDate', selectedFromDate.toDateString());
        reportedCouponHistoryFormData.append('toDate', selctedToDate.toDateString());
        reportedCouponHistoryFormData.append('offset', "0");

        try {
            const response = await axiosInstance.post(GET_REPORTED_COUPON_HISTORY, reportedCouponHistoryFormData);

            setReportedCouponHistoryData(response.data);

        } catch (error) {
            setReportedCouponHistoryData(undefined);
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, {
                    data: error.response
                });
            }
        }
    };

    return (
        <View className='bg-white flex-1'>

            <View className='shadow-sm android:shaodw-md bg-white'>
                <View className='flex-row items-center justify-around py-4 border-b border-muted'>
                    <View className='items-center'>
                        <TouchableOpacity className='flex-row items-center gap-2 p-2' onPress={() => setShowFromDate(true)}>
                            <CalendarIcon className='text-primary' height={20} width={20} />
                            <Text>From Date:</Text>
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
                            <Text>To Date</Text>
                            <Text className='text-lg font-semibold'>{selctedToDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>

                        {showToDate && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={selectedFromDate}
                                mode={"date"}
                                is24Hour={true}
                                onChange={onToDateChange}
                            />
                        )}
                    </View>
                </View>
            </View>

            <FlatList
                contentContainerClassName='p-4'
                data={reportedCouponHistoryData?.reportedCouponHistory}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <Separator className='my-4' />}
                ListEmptyComponent={() => (
                    <View className='flex-1 items-center justify-center'>
                        <Text className='text-xl font-medium'>
                            No Data found.
                            Try another date range.
                        </Text>
                    </View>
                )}
            />
        </View>
    )
}

export default ReportHistory