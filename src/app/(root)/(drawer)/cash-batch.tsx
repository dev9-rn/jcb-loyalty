import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'

import useUser from '@/hooks/useUser';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { CalendarIcon } from "@/libs/icons/CalendarIcon"
import axiosInstance from '@/utils/axiosInstance';
import { GET_CASH_BATCH_REPORTS } from '@/utils/routes';
import { useToast } from 'react-native-toast-notifications';
import axios from 'axios';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import formatDateTime from '@/utils/formatDateTime';

type Props = {}

const CashBatchScreen = ({ }: Props) => {

    const { userDetails } = useUser();
    const { t } = useTranslation();

    const toast = useToast();

    const [cashBatchReportData, setCashBatchReportData] = useState();
    // Mananging user's date selection
    const [selectedFromDate, setSelectedFromDate] = useState(new Date());
    const [selctedToDate, setSelectedToDate] = useState(new Date());
    const [showFromDate, setShowFromDate] = useState<boolean>(false)
    const [showToDate, setShowToDate] = useState<boolean>(false);

    useEffect(() => {
        fetchCachBatchReports();
    }, [selectedFromDate, selctedToDate]);

    const renderItem = useCallback(({ item, index }: { item: ICashBatchReports, index: number }) => {
        return (
            <View className='py-2' key={index}>
                <View className='flex-row items-center justify-between'>
                    <Text className='text-lg'>
                        {t("cash_batch.total_coupons_scanned")}:{" "}
                        <Text className='text-lg font-medium'>{item.total_coupons_scanned}</Text>
                    </Text>
                    <Text className='text-lg font-semibold'>
                        ₹ {item.total_amount}
                    </Text>
                </View>
                <Text className='text-lg'>
                    {t("cash_batch.batch_id")}:{" "}
                    <Text className='text-lg font-medium'>{item.batch_id}</Text>
                </Text>
                <Text className='text-lg'>
                    {t("cash_batch.end_date")}:{" "}
                    <Text className='text-lg font-medium'>{formatDateTime(item.end_date)}</Text>
                </Text>

                <Text className='text-lg'>
                    {t("cash_batch.status")}:{" "}
                    <Text className='text-primary text-lg font-medium capitalize'>{item.status}</Text>
                </Text>
                {item.credit_note_no && (
                    <>
                        <Text className='text-lg'>
                            {t("cash_batch.credit_note_no")}:{" "}
                            <Text className='text-lg font-medium'>{item.credit_note_no}</Text>
                        </Text>

                        <Text className='text-lg'>
                            {t("cash_batch.credit_note_date")}:{" "}
                            <Text className='text-lg font-medium'>{new Date(item.credit_note_date as string).toLocaleDateString()}</Text>
                        </Text>

                        <Text className='text-lg'>
                            {t("cash_batch.credit_note_value")}:{" "}
                            <Text className='text-lg font-medium'>{item.credit_note_value}</Text>
                        </Text>
                    </>

                )}
            </View>
        )
    }, [])

    const onFromDateChange = (event?: DateTimePickerEvent, date?: Date) => {
        const currentDate = date;
        setShowFromDate(false);
        setSelectedFromDate(currentDate as Date);
    };

    const onToDateChange = (event?: DateTimePickerEvent, date?: Date) => {
        setShowToDate(false);
        setSelectedToDate(date as Date);
    };

    const fetchCachBatchReports = async () => {

        const cashBatchReportsFormData = new FormData();

        cashBatchReportsFormData.append('distributorId', userDetails?.id);
        cashBatchReportsFormData.append('startDate', selectedFromDate.toLocaleDateString());
        cashBatchReportsFormData.append('endDate', selctedToDate.toLocaleDateString());
        cashBatchReportsFormData.append('year', new Date().getFullYear());
        cashBatchReportsFormData.append('userType', userDetails?.userType);

        try {
            const response = await axiosInstance.post(GET_CASH_BATCH_REPORTS, cashBatchReportsFormData);

            if (response.data.status !== 200) {
                toast.show(response.data.message, {
                    data: response
                })
            };

            setCashBatchReportData(response.data.batchesData)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setCashBatchReportData(undefined)
                toast.show(error.response?.data.message, {
                    data: error.response
                });
            };
        };
    }

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
                data={cashBatchReportData}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <Separator className='' />}
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

export default CashBatchScreen