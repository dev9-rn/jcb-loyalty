import { View, Dimensions, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import React, { Dispatch, forwardRef, SetStateAction, useState } from 'react'
import { BottomSheetModal, BottomSheetView, useBottomSheetModal } from '@gorhom/bottom-sheet'
import { ToggleGroup, ToggleGroupIcon, ToggleGroupItem } from './ui/toggle-group'
import { Text } from './ui/text'
import { Button } from './ui/button'

type Props = {
    dealerList: IDealerListDetail[]
    setStatusFilterValue: Dispatch<SetStateAction<string | undefined>>;
    statusFilterValue: string | undefined;
    fetchDealerList: () => Promise<void>
}

const FilterBottomSheetModal = forwardRef<BottomSheetModal, Props>(({ dealerList, setStatusFilterValue, statusFilterValue, fetchDealerList }, ref) => {

    const { dismiss } = useBottomSheetModal();

    return (
        <View>
            <BottomSheetModal
                ref={ref}
                index={0}
                enableDynamicSizing
                snapPoints={["30%"]}
                backdropComponent={() => (
                    <TouchableWithoutFeedback
                        onPress={() => dismiss()}
                    >
                        <View style={StyleSheet.absoluteFill} className='bg-black/40' />
                    </TouchableWithoutFeedback>
                )}
            >
                <BottomSheetView className='p-4'>
                    <Text className='text-2xl font-semibold'>Filters</Text>

                    <View className='mt-8 flex-row items-center justify-between'>
                        <Text className='text-lg'>Status Type</Text>

                        <View>
                            <ToggleGroup
                                value={statusFilterValue}
                                type='single'
                                onValueChange={(value) => {
                                    if (!value) return;
                                    setStatusFilterValue(value);
                                }}
                            >
                                <ToggleGroupItem value='All' aria-label='Toggle bold'>
                                    <Text className='font-medium'>All</Text>
                                </ToggleGroupItem>
                                <ToggleGroupItem value='Pending' aria-label='Toggle italic'>
                                    <Text className='font-medium'>Pending</Text>
                                </ToggleGroupItem>
                                <ToggleGroupItem value='Approved' aria-label='Toggle underline'>
                                    <Text className='font-medium'>Approved</Text>
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </View>
                    </View>

                    <Button
                        className='mt-8 mb-6'
                        onPress={async () => {
                            dismiss()
                            await fetchDealerList()
                        }}
                    >
                        <Text>Confirm</Text>
                    </Button>
                </BottomSheetView>
            </BottomSheetModal>
        </View>
    )
})

export default FilterBottomSheetModal