import { StyleSheet, Text, View } from 'react-native'
import React, { Component } from 'react'

type Props = {
    children: React.ReactNode
    title: string,
}

const DashboardCard = ({ title, children }: Props) => {
    return (
        <View className='p-3 border-[1px] rounded-md border-gray-400'>
            <View className='flex-row justify-between gap-2 mb-3'>
                <Text className='text-[16px] font-bold'>{title}</Text>
                <Text className='text-[16px] font-medium'>Total</Text>
            </View>
            <>{children}</>
            
        </View>
    )
}

export default DashboardCard

const styles = StyleSheet.create({})