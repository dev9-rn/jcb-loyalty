import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import PagerView from 'react-native-pager-view';
import { Text } from '@/components/ui/text';

import { CalendarIcon } from "@/libs/icons/CalendarIcon"
import axiosInstance from '@/utils/axiosInstance';
import { GET_MECHANIC_PASSBOOK, GET_REDEEM_HISTORY, GET_RETAILER_COUPON_HISTORY } from '@/utils/routes';
import useUser from '@/hooks/useUser';
import { Separator } from '@/components/ui/separator';

type Props = {};

const TABS = [
    {
        id: 1,
        name: "Cash",
    },
    {
        id: 2,
        name: "Scheme",
    }
]

const CouponHistoryScreen = ({ }: Props) => {

    const { userDetails } = useUser();

    const [activePagerTab, setActivePagerTab] = useState<number>(0);
    const [couponHistoryData, setCouponHistoryData] = useState<ICouponHistory | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);

    // Mananging user's date selection
    const [selectedFromDate, setSelectedFromDate] = useState(new Date());
    const [selctedToDate, setSelectedToDate] = useState(new Date());
    const [showFromDate, setShowFromDate] = useState<boolean>(false)
    const [showToDate, setShowToDate] = useState<boolean>(false);

    const pagerRef = useRef<PagerView>(null);

    useEffect(() => {
        fetchCouponHistories({ offset: 0 });
    }, [selectedFromDate, selctedToDate]);

    const renderMechanicPassbook = useCallback(({ item, index }: { item: IMechanicPassbook, index: number }) => {
        return (
            <View className='py-2' key={index}>
                <View className='flex-row items-center justify-between'>
                    <Text className='text-lg'>
                        Name:{" "}
                        <Text className='text-lg font-medium'>{item.full_name}</Text>
                    </Text>
                    <Text className='text-lg font-semibold'>
                        ₹ {item.loyalty_points_wallet}
                    </Text>
                </View>
                <Text className='text-lg'>
                    Reference ID:{" "}
                    <Text className='text-lg font-medium'>{item.reference_id}</Text>
                </Text>
                <Text className='text-lg'>
                    Redeemed Date:{" "}
                    <Text className='text-lg font-medium'>{new Date(item.date).toLocaleString()}</Text>
                </Text>

                <Text className='text-lg'>
                    Type:{" "}
                    <Text className='text-green-600 text-lg font-medium capitalize'>{item.type}</Text>
                </Text>
            </View>
        )
    }, [selectedFromDate, selctedToDate]);

    const renderCouponItem = useCallback(({ item, index }: { item: IRedeemedCoupon, index: number }) => {
        return (
            <View className='py-2' key={index}>
                <View className='flex-row items-center justify-between'>
                    <Text className='text-lg'>
                        Serial No:{" "}
                        <Text className='text-lg font-medium'>{item.id}</Text>
                    </Text>
                    <Text className='text-lg font-semibold'>
                        ₹ {item.value}
                    </Text>
                </View>
                <Text className='text-lg'>
                    Item Code:{" "}
                    <Text className='text-lg font-medium'>{item.item_code}</Text>
                </Text>
                <Text className='text-lg'>
                    Redeemed Date:{" "}
                    <Text className='text-lg font-medium'>{new Date(item.distributor_redemption_date).toLocaleString()}</Text>
                </Text>

                <Text className='text-lg'>
                    Status:{" "}
                    <Text className='text-green-600 text-lg font-medium'>{item.distributor_redemption_flag}</Text>
                </Text>
            </View>
        )
    }, [couponHistoryData]);

    // const handleTabSwitch = (index: number) => {
    //     setActivePagerTab(index);
    //     pagerRef.current?.setPage(index);
    // };

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

    const fetchCouponHistories = async ({ offset = undefined }: { offset: number | undefined }) => {

        if ((couponHistoryData && couponHistoryData?.status != 200) || offset != 0) return;

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
                console.log(response.data, "GET_COUPON_HISTORY");
                setLoading(false);
            };

            setCouponHistoryData(response.data);
            setLoading(false)
        } catch (error) {
            setLoading(false);
            console.log(error, " SOMETHING_WENT_WRONG_HISTORY");
        }
    };

    return (
        <View className='flex-1 bg-white'>

            <View className='shadow-sm android:shaodw-md bg-white'>
                {/* <View className='flex-row items-center justify-around py-4'>
                    {TABS.map((tab, index) => (
                        <TouchableOpacity key={tab.id} className={`flex-1 py-2 ${activePagerTab == index ? "border-b-2 border-primary" : "border-0"} `} onPress={() => handleTabSwitch(index)}>
                            <Text className={`text-center text-base xs:text-lg ${activePagerTab == index ? "text-primary font-medium" : ""}`}>
                                {tab.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View> */}
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
                data={couponHistoryData?.redeemHistory}
                renderItem={userDetails?.userType != 1 ? renderCouponItem : renderMechanicPassbook}
                ItemSeparatorComponent={() => <Separator />}
                ListFooterComponent={loading ? <ActivityIndicator size="large" color="blue" /> : null}
                ListEmptyComponent={() => (
                    <View className='items-center'>
                        <Text className='font-medium text-lg text-center'>
                            No data found for the selected date range. Please adjust your selection and try again.
                        </Text>
                    </View>
                )}
                onEndReached={() => {
                    if (couponHistoryData?.status === 200) {
                        fetchCouponHistories({ offset: couponHistoryData?.offset })
                    }
                }}
                onEndReachedThreshold={0.5}
            />

            {/* <PagerView
                ref={pagerRef}
                initialPage={0}
                style={{ flex: 1, padding: 16, }}
                onPageSelected={(e) => setActivePagerTab(e.nativeEvent.position)}
            >
                <View className='items-center justify-center' key="1">
                    <CashCouponHistoryTab />
                </View>
                <View className='items-center justify-center' key="2">
                    <Text>Second page</Text>
                </View>
            </PagerView> */}
        </View>
    )
}

export default CouponHistoryScreen