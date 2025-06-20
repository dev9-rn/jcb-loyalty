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

    const [couponHistoryData, setCouponHistoryData] = useState<IRedeemedCouponDetails[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentOffset, setCurrentOffset] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);

    // Mananging user's date selection
    const [selectedFromDate, setSelectedFromDate] = useState(new Date());
    const [selctedToDate, setSelectedToDate] = useState(new Date());
    const [showFromDate, setShowFromDate] = useState<boolean>(false)
    const [showToDate, setShowToDate] = useState<boolean>(false);

    // useEffect to call only once on initial load
    useEffect(() => {
        if (couponHistoryData.length === 0) {
            setCouponHistoryData([]);
            setCurrentOffset(0);
            setHasMore(true);
            fetchCouponHistories({ pageOffset: 0 });
        }
    }, []);

    useEffect(() => {
        const resetAndFetch = async () => {
            setCouponHistoryData([]);
            setHasMore(true);
            setCurrentOffset(0);
            await fetchCouponHistories({ pageOffset: 10, force: true });
        };

        resetAndFetch();
    }, [selectedFromDate.toDateString(), selctedToDate.toDateString()]);


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

    const fetchCouponHistories = async ({ pageOffset = 0, force = false }: { pageOffset?: number; force?: boolean } = {}) => {

        if (!force && (!hasMore || loading)) return;

        const redeemHistoryFormData = new FormData();
        redeemHistoryFormData.append(getCouponHistoryEndpoint().user_id, userDetails?.id);
        redeemHistoryFormData.append('fromDate', selectedFromDate.toDateString());
        redeemHistoryFormData.append('toDate', selctedToDate.toDateString());
        redeemHistoryFormData.append('offset', pageOffset?.toString());
        redeemHistoryFormData.append('redeemType', 'Cash');
        redeemHistoryFormData.append('userType', userDetails?.userType);

        try {
            setLoading(true)
            const response = await axiosInstance.post(getCouponHistoryEndpoint().endpoint, redeemHistoryFormData);

            if (response.data.status !== 200) {
                setLoading(false);
                return;
            }

            const newData = (response.data.redeemHistory || response.data.scannedHistory) ?? [];
            const nextOffset = response.data.offset;

            // Append new data
            setCouponHistoryData(prev => [...prev, ...newData]);

            // If less than 5 records returned, assume it's the last page
            if (newData.length < 5) {
                setHasMore(false);
            } else {
                setCurrentOffset(nextOffset);
            }

            setLoading(false)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // if (offset === undefined || offset == 0) {
                //     setCouponHistoryData(error.response?.data)
                //     setLoading(false);
                //     return;
                // };

                if (error.response?.data.redeemHistory.length == 0 || error.response?.data.scannedHistory.length == 0) {
                    setCouponHistoryData((prev) => {
                        if (!prev) {
                            return error.response?.data.redeemHistory || error.response?.data.scannedHistory
                        } else {
                            return [...prev]
                        }
                    })
                    setHasMore(false)
                    setLoading(false);
                };
            };
        } finally {
            setLoading(false);
        }
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
                data={couponHistoryData}
                ItemSeparatorComponent={() => <Separator />}
                renderItem={renderCouponItem}
                onEndReached={() => {
                    if (hasMore) {
                        fetchCouponHistories({ pageOffset: currentOffset });
                    }
                }}
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
                ListFooterComponent={() => {
                    return (
                        <>
                            {loading ? (
                                <ActivityIndicator />
                            ) : currentOffset > 0 && !loading && !hasMore ? (
                                <View className='w-full my-4'>
                                    <Text className='text-center'>No more redeem history!</Text>
                                </View>
                            ) : null}
                        </>
                    )
                }}
                keyExtractor={(item) => item.id}
            />
        </View>
    )
}

export default CashCouponHistoryTab