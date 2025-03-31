import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'

import useUser from '@/hooks/useUser';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { CalendarIcon } from "@/libs/icons/CalendarIcon"
import axiosInstance from '@/utils/axiosInstance';
import { GET_CASH_BATCH_REPORTS } from '@/utils/routes';

type Props = {}

const CashBatchScreen = ({ }: Props) => {

    const { userDetails } = useUser();

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
        cashBatchReportsFormData.append('startDate', selectedFromDate.toLocaleDateString());
        cashBatchReportsFormData.append('endDate', selctedToDate.toLocaleDateString());
        cashBatchReportsFormData.append('year', new Date().getFullYear());
        cashBatchReportsFormData.append('userType', userDetails?.userType);

        try {
            const response = await axiosInstance.post(GET_CASH_BATCH_REPORTS, cashBatchReportsFormData);

            console.log(response.data)
        } catch (error) {
            console.log(error, "SOMETHING_WENT_WRONG_CASH_BATCH");
        }
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