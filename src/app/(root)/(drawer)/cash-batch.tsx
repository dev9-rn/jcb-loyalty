import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'

import useUser from '@/hooks/useUser';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { CalendarIcon } from "@/libs/icons/CalendarIcon"
import axiosInstance from '@/utils/axiosInstance';
import { GET_CASH_BATCH_REPORTS } from '@/utils/routes';
import { useToast } from 'react-native-toast-notifications';
import axios from 'axios';

type Props = {}

const CashBatchScreen = ({ }: Props) => {

    const { userDetails } = useUser();

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
        cashBatchReportsFormData.append('startDate', selectedFromDate.toDateString());
        cashBatchReportsFormData.append('endDate', selctedToDate.toDateString());
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
        </View>
    )
}

export default CashBatchScreen