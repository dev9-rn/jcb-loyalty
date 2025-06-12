import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { CalendarIcon } from "@/libs/icons/CalendarIcon"
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import useUser from '@/hooks/useUser';
import { Separator } from './ui/separator';
import axiosInstance from '@/utils/axiosInstance';
import { GET_MECHANIC_PASSBOOK, GET_REDEEM_HISTORY, GET_RETAILER_COUPON_HISTORY } from '@/utils/routes';
import formatDateTime from '@/utils/formatDateTime';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

type Props = {}

const CashCouponHistoryTab = ({ }: Props) => {

    const { userDetails } = useUser();
    const { t } = useTranslation();

    const [couponHistoryData, setCouponHistoryData] = useState<ICouponHistory | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);

    // Mananging user's date selection
    const [selectedFromDate, setSelectedFromDate] = useState(new Date());
    const [selctedToDate, setSelectedToDate] = useState(new Date());
    const [showFromDate, setShowFromDate] = useState<boolean>(false)
    const [showToDate, setShowToDate] = useState<boolean>(false);

    useEffect(() => {
        fetchCouponHistories({ offset: 0 });
    }, [selectedFromDate, selctedToDate]);

    const renderCouponItem = useCallback(({ item, index }: { item: IRedeemedCouponDetails, index: number }) => {
        return (
            <View className='py-2' key={index}>
                <View className='flex-row items-center justify-between'>
                    <Text className='text-lg'>
                        {t("coupon-history.serial_no")}{" "}
                        <Text className='text-lg font-medium'>{item.id}</Text>
                    </Text>
                    <Text className='text-lg font-semibold'>
                        ₹ {item.value}
                    </Text>
                </View>
                {item.item_code && (
                    <Text className='text-lg'>
                        {t("coupon-history.item_code")}{" "}
                        <Text className='text-lg font-medium'>{item.item_code}</Text>
                    </Text>
                )}
                <Text className='text-lg'>
                    {t("coupon-history.redeemed_date")}{" "}
                    <Text className='text-lg font-medium'>{formatDateTime(item.distributor_redemption_date || item?.scanned_date)}</Text>
                </Text>

                <Text className='text-lg'>
                    {t("coupon-history.status")}{" "}
                    <Text className='text-green-600 text-lg font-medium'>
                        {item.distributor_redemption_flag || t("coupon-history.scanned")}
                    </Text>
                </Text>
            </View>
        )
    }, [couponHistoryData]);

    const onFromDateChange = (event?: DateTimePickerEvent, date?: Date) => {
        const currentDate = date;
        setShowFromDate(false);
        setSelectedFromDate(currentDate as Date);
    };

    const onToDateChange = (event?: DateTimePickerEvent, date?: Date) => {
        setShowToDate(false);
        setSelectedToDate(date as Date);
    };

    const getCouponHistoryEndpoint = () => {
        if (userDetails?.userType === 0) {
            return {
                endpoint: GET_REDEEM_HISTORY,
                user_id: "distributorId"
            };
        };

        if (userDetails?.userType === 1) {
            return {
                endpoint: GET_MECHANIC_PASSBOOK,
                user_id: "mechanicId"
            };
        };

        return {
            endpoint: GET_RETAILER_COUPON_HISTORY,
            user_id: "dealerId"
        }
    }

    const fetchCouponHistories = async ({ offset }: { offset?: number | undefined }) => {

        // if ((couponHistoryData && couponHistoryData?.status != 200) || offset != 0) return;

        const redeemHistoryFormData = new FormData();
        redeemHistoryFormData.append(getCouponHistoryEndpoint().user_id, userDetails?.id);
        redeemHistoryFormData.append('fromDate', selectedFromDate.toDateString());
        redeemHistoryFormData.append('toDate', selctedToDate.toDateString());
        redeemHistoryFormData.append('offset', offset ? offset.toString() : "0");
        redeemHistoryFormData.append('redeemType', 'Cash');
        redeemHistoryFormData.append('userType', userDetails?.userType);

        try {
            setLoading(true)
            const response = await axiosInstance.post(getCouponHistoryEndpoint().endpoint, redeemHistoryFormData);

            if (response.data.status != 200) {
                setLoading(false);
            };

            // if (!couponHistoryData) {
            // } else {
            //     setCouponHistoryData((prev) => {
            //         return { ...prev, ...response.data }
            //     })
            // }
            setCouponHistoryData(response.data);

            setLoading(false)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (couponHistoryData?.offset === undefined || couponHistoryData?.offset == 0) {
                    setCouponHistoryData(error.response?.data)
                    return;
                };
                
                setCouponHistoryData(error.response?.data)
            };
            setLoading(false);
        }
    };

    const getHistoryList = () => {
        return couponHistoryData?.redeemHistory?.length
            ? couponHistoryData.redeemHistory
            : couponHistoryData?.scannedHistory?.length
                ? couponHistoryData.scannedHistory
                : [];
    };

    return (
        <View className='flex-1'>
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
                data={couponHistoryData?.redeemHistory || couponHistoryData?.scannedHistory}
                renderItem={renderCouponItem}
                // renderItem={userDetails?.userType === 0 ? renderCouponItem : renderMechanicPassbook}
                ItemSeparatorComponent={() => <Separator />}
                ListFooterComponent={() => {
                    return (
                        <>
                            {loading
                                ? <ActivityIndicator size="large" color="blue" />
                                : null
                            }
                        </>
                    )
                }}
                ListEmptyComponent={() => {
                    return (
                        <View className='items-center'>
                            <Text className='font-medium text-lg text-center'>
                                {t("coupon-history.no_data_found")}
                            </Text>
                        </View>
                    )
                }}
                onEndReached={() => {
                    // const historyList = getHistoryList();
                    // if (historyList.length === couponHistoryData?.offset && !couponHistoryData) return;
                    // fetchCouponHistories({ offset: (couponHistoryData?.offset || 20) + 10 })
                }}
                onEndReachedThreshold={0.5}
            />
        </View>
    )
}

export default CashCouponHistoryTab