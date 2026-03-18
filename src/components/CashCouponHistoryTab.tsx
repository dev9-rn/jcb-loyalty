import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { CalendarIcon } from "@/libs/icons/CalendarIcon";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import useUser from '@/hooks/useUser';
import { Separator } from './ui/separator';
import axiosInstance from '@/utils/axiosInstance';
import { GET_REDEEM_HISTORY } from '@/utils/routes';
import formatDateTime from '@/utils/formatDateTime';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { formatDateForAPI } from '@/libs/utils';
import { useFocusEffect } from 'expo-router';

type Props = {};

const CashCouponHistoryTab = ({}: Props) => {
    const { userDetails } = useUser();
    const { t } = useTranslation();

    const [couponHistoryData, setCouponHistoryData] = useState<IRedeemedCouponDetails[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentOffset, setCurrentOffset] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);

    // Date Selection
    const [selectedFromDate, setSelectedFromDate] = useState(new Date());
    const [selectedToDate, setSelectedToDate] = useState(new Date());
    const [showFromDate, setShowFromDate] = useState<boolean>(false);
    const [showToDate, setShowToDate] = useState<boolean>(false);

    // Reset and fetch on screen focus (initial load only)
    useFocusEffect(
        useCallback(() => {
            setCouponHistoryData([]);
            setCurrentOffset(0);
            setHasMore(true);
            fetchCouponHistories({ pageOffset: 0, force: true });
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []) // ← Important: No date dependency here
    );

    // Refetch when dates change
    useEffect(() => {
        setCouponHistoryData([]);
        setCurrentOffset(0);
        setHasMore(true);
        fetchCouponHistories({ pageOffset: 0, force: true });
    }, [selectedFromDate, selectedToDate]);

    const renderCouponItem = useCallback(({ item, index }: { item: IRedeemedCouponDetails; index: number }) => {
        return (
            <View className="py-2" key={index}>
                <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-medium">
                        Serial No :{" "}
                        <Text className="text-lg font-normal">{item.id}</Text>
                    </Text>
                    <Text className="text-lg font-bold">₹ {item.value}</Text>
                </View>
                {item.item_code && (
                    <Text className="text-lg font-medium">
                        Item Code :{" "}
                        <Text className="text-lg font-normal">{item.item_code}</Text>
                    </Text>
                )}
                <Text className="text-lg font-medium">
                    Redemtion Date :{" "}
                    <Text className="text-lg font-normal">
                        {formatDateTime(item.distributor_redemption_date || item?.scanned_date)}
                    </Text>
                </Text>
                <Text className="text-lg font-medium">
                    Status :{" "}
                    <Text className="text-green-600 text-lg font-normal">
                        {item.distributor_redemption_flag}
                    </Text>
                </Text>
            </View>
        );
    }, []);

    const onFromDateChange = (event?: DateTimePickerEvent, date?: Date) => {
        setShowFromDate(false);
        if (date && date.toDateString() !== selectedFromDate.toDateString()) {
            setSelectedFromDate(date);
        }
    };

    const onToDateChange = (event?: DateTimePickerEvent, date?: Date) => {
        setShowToDate(false);
        if (date && date.toDateString() !== selectedToDate.toDateString()) {
            setSelectedToDate(date);
        }
    };

    const fetchCouponHistories = async ({ pageOffset = 0, force = false }: { pageOffset?: number; force?: boolean } = {}) => {
        if (!force && (!hasMore || loading)) return;

        setLoading(true);

        const redeemHistoryFormData = new FormData();
        redeemHistoryFormData.append('distributorId', userDetails?.id || '');
        redeemHistoryFormData.append('fromDate', formatDateForAPI(selectedFromDate));
        redeemHistoryFormData.append('toDate', formatDateForAPI(selectedToDate));
        redeemHistoryFormData.append('offset', pageOffset.toString());
        redeemHistoryFormData.append('redeemType', 'Cash');

        try {
            const response = await axiosInstance.post(GET_REDEEM_HISTORY, redeemHistoryFormData);

            const newData = response.data.redeemHistory || response.data.scannedHistory || [];

            setCouponHistoryData((prevData) => {
                if (pageOffset === 0) {
                    return newData;
                } else {
                    return [...prevData, ...newData];
                }
            });

            setCurrentOffset(response.data.offset || pageOffset + newData.length);
            setHasMore(newData.length > 0); // If no new data, no more to load

        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorData = error.response?.data;
                if (
                    (errorData?.redeemHistory?.length === 0) ||
                    (errorData?.scannedHistory?.length === 0)
                ) {
                    setHasMore(false);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1">
            {/* Date Pickers */}
            <View className="flex-row items-center justify-around py-4 border-b border-muted">
                <View className="items-center">
                    <TouchableOpacity
                        className="flex-row items-center gap-2 p-2"
                        onPress={() => setShowFromDate(true)}
                    >
                        <CalendarIcon className="text-primary" height={20} width={20} />
                        <Text>{t("login.coupon_history_fromDate")}</Text>
                        <Text className="text-lg font-semibold">{selectedFromDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>

                    {showFromDate && (
                        <DateTimePicker
                            testID="fromDatePicker"
                            value={selectedFromDate}
                            mode="date"
                            is24Hour={true}
                            onChange={onFromDateChange}
                        />
                    )}
                </View>

                <View className="items-center">
                    <TouchableOpacity
                        className="flex-row items-center gap-2 p-2"
                        onPress={() => setShowToDate(true)}
                    >
                        <CalendarIcon className="text-primary" height={20} width={20} />
                        <Text>{t("login.coupon_history_toDate")}</Text>
                        <Text className="text-lg font-semibold">{selectedToDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>

                    {showToDate && (
                        <DateTimePicker
                            testID="toDatePicker"
                            value={selectedToDate}
                            mode="date"
                            is24Hour={true}
                            onChange={onToDateChange}
                            accentColor="#144799"
                        />
                    )}
                </View>
            </View>

            {/* Coupon History List */}
            <FlatList
                contentContainerClassName="p-4"
                data={couponHistoryData}
                ItemSeparatorComponent={() => <Separator />}
                renderItem={renderCouponItem}
                keyExtractor={(item) => item.id.toString()}
                onEndReached={() => {
                    if (couponHistoryData.length > 0 && hasMore && !loading) {
                        fetchCouponHistories({ pageOffset: currentOffset });
                    }
                }}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={() => (
                    <View className="items-center py-10">
                        <Text className="font-medium text-lg text-center">
                            {t("login.NoHistory_Error")}
                        </Text>
                    </View>
                )}
                ListFooterComponent={() => (
                    <>
                        {loading ? (
                            <ActivityIndicator size="large" className="my-6" />
                        ) : currentOffset > 0 && !hasMore ? (
                            <View className="w-full my-4">
                                <Text className="text-center text-muted-foreground">
                                    No more redeem history!
                                </Text>
                            </View>
                        ) : null}
                    </>
                )}
            />
        </View>
    );
};

export default CashCouponHistoryTab;