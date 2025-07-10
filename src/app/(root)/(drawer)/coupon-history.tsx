import { TouchableOpacity, View } from 'react-native'
import React, { useRef, useState } from 'react'

import PagerView from 'react-native-pager-view';
import { Text } from '@/components/ui/text';

import CashCouponHistoryTab from '@/components/CashCouponHistoryTab';
import FocCouponHistoryTab from '@/components/FocCouponHistoryTab';

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

    const pagerRef = useRef<PagerView>(null);

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
                style={{ flex: 1 }}
                onPageSelected={(e) => setActivePagerTab(e.nativeEvent.position)}
            >
                <View key="1" className='flex-1'>
                    <CashCouponHistoryTab />
                </View>
                <View className='flex-1' key="2">
                    <FocCouponHistoryTab />
                </View>
            </PagerView>
        </View >
    )
}

export default CouponHistoryScreen