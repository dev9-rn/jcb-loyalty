import { View, FlatList, ScrollView, RefreshControl } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { router, useFocusEffect, useNavigation } from 'expo-router'
import { Button } from '@/components/ui/button'
import { FunnelIcon } from '@/libs/icons/FunnelIcon'
import axiosInstance from '@/utils/axiosInstance'
import { APPROVE_REJECT_DEALER, GET_DEALERS_LIST } from '@/utils/routes'
import useUser from '@/hooks/useUser'
import axios from 'axios'
import { useToast } from 'react-native-toast-notifications'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import FilterBottomSheetModal from '@/components/FilterBottomSheetModal'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import ApproveDealerAlertDialog from '@/components/ApproveDealerAlertDialog'
import RejectDealerAlterDialog from '@/components/RejectDealerAlterDialog'

type Props = {}

const DealersScreen = ({ }: Props) => {

    const [dealerList, setDealerList] = useState<IDealerListDetail[]>([])
    const [statusFilterValue, setStatusFilterValue] = useState<string | undefined>("All");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { userDetails } = useUser();

    const navigation = useNavigation();
    const toast = useToast();

    const filterModalRef = useRef<BottomSheetModal>(null)

    useFocusEffect(
        useCallback(() => {
            fetchDealerList();
        }, [])
    );

    useEffect(() => {
        navigation.setOptions({
            headerRight: ({ tintColor }: { tintColor: string }) => (
                <Button
                    variant={"ghost"}
                    size={"icon"} onPress={() => {
                        filterModalRef.current?.present()
                    }}
                >
                    <FunnelIcon color={tintColor} />
                </Button>
            ),
        })
    }, []);

    const renderDealerCard = useCallback(({ item, index }: { item: IDealerListDetail, index: number }) => {
        return (
            <View key={item.id || index} className='border rounded-lg border-gray-400 p-2 flex-row items-center justify-between gap-2.5 relative'>
                <View className='gap-1 flex-shrink'>
                    <Text>
                        Name:{" "}
                        <Text className='font-medium'>{item.dealer_name}</Text>
                    </Text>
                    <Text>
                        Phone Number:{" "}
                        <Text className='font-medium'>
                            {item.mobile_no}
                        </Text>
                    </Text>
                    <Text>
                        Shop Name:{" "}
                        <Text className='font-medium'>
                            {item.shop_name}
                        </Text>
                    </Text>
                    <Text>
                        Address:{" "}
                        <Text className='font-medium'>
                            {item.address}
                        </Text>
                    </Text>
                    <Text>
                        Date Registered:{" "}
                        <Text className='font-medium'>
                            {new Date(item.created).toLocaleDateString()}
                        </Text>
                    </Text>
                </View>
                <View className='gap-2 '>
                    {item.is_approved === "0" && (
                        <>
                            <ApproveDealerAlertDialog
                                postDealerAction={() => postDealerAction({ dealer_id: item.id, isApproved: "1" })}
                                item={item}
                            />
                            <RejectDealerAlterDialog
                                postDealerAction={() => postDealerAction({ dealer_id: item.id, isApproved: "2" })}
                                item={item}
                            />
                        </>
                    )}
                </View>
                {item.is_approved === "1" && (
                    <Badge className='bg-green-600 absolute top-0 right-0 m-2'>
                        <Text>Approved</Text>
                    </Badge>
                )}
                {item.is_approved === "2" && (
                    <Badge className='absolute top-0 right-0 m-2' variant={"destructive"}>
                        <Text>Rejected</Text>
                    </Badge>
                )}
            </View>
        )
    }, []);

    const fetchDealerList = async () => {

        const dealerListFormData = new FormData();

        dealerListFormData.append("distributorId", userDetails?.id);
        dealerListFormData.append("status", statusFilterValue);
        setIsLoading(true);
        try {
            const response = await axiosInstance.post(GET_DEALERS_LIST, dealerListFormData);

            if (response.data.status != 200) {
                toast.show(response.data.message, {
                    data: response
                });
            };

            setDealerList(response.data.dealersData);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setDealerList(error.response?.data.dealersData);
                toast.show(error.response?.data.message, {
                    data: error.response
                });
            };
        };
        setIsLoading(false);
    };

    const postDealerAction = async ({ dealer_id, isApproved }: { dealer_id: string, isApproved: string }) => {

        const dealerStatusFormData = new FormData();

        dealerStatusFormData.append("distributorId", userDetails?.id);
        dealerStatusFormData.append("dealerId", dealer_id);
        dealerStatusFormData.append("isApproved", isApproved);

        try {
            const response = await axiosInstance.post(APPROVE_REJECT_DEALER, dealerStatusFormData)

            if (response.data.status != 200) {
                toast.show(response.data.message, {
                    data: response
                });
            };

            await fetchDealerList();

            toast.show(response.data.message, {
                data: response
            });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.show(error.response?.data.message, {
                    data: error.response
                });
            };
        }
    }

    return (
        <ScrollView
            className='flex-1 p-4 bg-white'
            refreshControl={
                <RefreshControl
                    refreshing={isLoading}
                    onRefresh={fetchDealerList}
                />
            }
        >
            <View className='flex-row items-center gap-2'>
                <Text className='flex-row items-center text-lg font-medium'>
                    Filter:
                </Text>
                <View>
                    <Badge className='flex-row items-center'>
                        <Text>
                            {statusFilterValue}
                        </Text>
                    </Badge>
                </View>
            </View>

            <View className='my-8'>
                <FlatList
                    scrollEnabled={false}
                    contentContainerClassName='gap-4'
                    data={dealerList}
                    renderItem={renderDealerCard}
                    ListEmptyComponent={() => (
                        <View className='flex-1 items-center justify-center'>
                            <Text className='text-2xl font-semibold'>No request found</Text>
                        </View>
                    )}
                />
            </View>

            <FilterBottomSheetModal
                ref={filterModalRef}
                dealerList={dealerList}
                setStatusFilterValue={setStatusFilterValue}
                statusFilterValue={statusFilterValue}
                fetchDealerList={fetchDealerList}
            />
        </ScrollView>
    )
}

export default DealersScreen