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
import CashCouponHistoryTab from '@/components/CashCouponHistoryTab';

type Props = {};

const TABS = [
    {
        id: 1,
        name: "Cash",
    },
    {
        id: 2,
        name: "FOC",
    }
]

const CouponHistoryScreen = ({ }: Props) => {

    const [activePagerTab, setActivePagerTab] = useState<number>(0);

    // Mananging user's date selection
    const [selectedFromDate, setSelectedFromDate] = useState(new Date());
    const [selctedToDate, setSelectedToDate] = useState(new Date());

    const pagerRef = useRef<PagerView>(null);

    const renderMechanicPassbook = useCallback(({ item, index }: { item: IMechanicPassbook, index: number }) => {
        return (
            <View className='py-2' key={index}>
                <View className='flex-row items-center justify-between'>
                    <Text className='text-lg'>
                        Name:{" "}
                        <Text className='text-lg font-medium'>{item.full_name}</Text>
                    </Text>
                    <Text className='text-lg font-semibold'>
                        Points {item.loyalty_points_wallet}
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

    const handleTabSwitch = (index: number) => {
        setActivePagerTab(index);
        pagerRef.current?.setPage(index);
    };

    return (
        <View className='flex-1 bg-white'>

            <View className='bg-white'>
                <View className='flex-row items-center justify-around pt-4'>
                    {TABS.map((tab, index) => (
                        <TouchableOpacity key={tab.id} className={`flex-1 py-2 ${activePagerTab == index ? "border-b-2 border-primary" : "border-0"} `} onPress={() => handleTabSwitch(index)}>
                            <Text className={`text-center text-base xs:text-lg ${activePagerTab == index ? "text-primary font-medium" : ""}`}>
                                {tab.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <PagerView
                ref={pagerRef}
                initialPage={0}
                style={{ flex: 1, }}
                onPageSelected={(e) => setActivePagerTab(e.nativeEvent.position)}
            >
                <View  key="1">
                    <CashCouponHistoryTab />
                </View>
                <View className='items-center justify-center' key="2">
                    <Text>Second page</Text>
                </View>
            </PagerView>
        </View >
    )
}

export default CouponHistoryScreen