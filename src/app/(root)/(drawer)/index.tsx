import { View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useUser from '@/hooks/useUser'
import axiosInstance from '@/utils/axiosInstance'
import {
	GET_DASHBOARD_DATA,
	GET_MECHANIC_DASHBOARD,
	GET_RETAILER_DASHBOARD,
} from '@/utils/routes'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { QrCodeIcon } from '@/libs/icons/QrCodeIcon'
import { router, useFocusEffect } from 'expo-router'
import { StatusBar } from 'react-native'
import { useToast } from 'react-native-toast-notifications'

type Props = {}

const HomeScreen = ({ }: Props) => {

	const [dashboardData, setDashboardData] = useState<IDashboardData | undefined>(undefined)

	const { userDetails } = useUser()
	const { t } = useTranslation()

	const toast = useToast()

	useFocusEffect(
		useCallback(() => {
			fetchDashboardData()
		}, [])
	)

	const getDashboardEndpoints = () => {
		if (userDetails?.userType === 0) {
			return {
				endpoint: GET_DASHBOARD_DATA,
				user_id: 'distributorId',
			}
		}

		if (userDetails?.userType === 1) {
			return {
				endpoint: GET_MECHANIC_DASHBOARD,
				user_id: 'mechanicId',
			}
		}

		return {
			endpoint: GET_RETAILER_DASHBOARD,
			user_id: 'dealerId',
		}
	}

	const fetchDashboardData = async () => {
		const dashboardFormData = new FormData()

		dashboardFormData.append(getDashboardEndpoints().user_id, userDetails?.id)
		dashboardFormData.append('month', new Date().getMonth() + 1)
		dashboardFormData.append('year', new Date().getFullYear())
		dashboardFormData.append('userType', userDetails?.userType)
		dashboardFormData.append('language', 'en')

		try {
			const response = await axiosInstance.post(
				getDashboardEndpoints().endpoint,
				dashboardFormData
			)

			if (response.data.status !== 200) {
				toast.show(response.data.message, {
					data: response,
				})
			}

			setDashboardData(response.data)
		} catch (error) { }
	}

	const isDistributor = userDetails?.userType === 0
	const isMechanic = userDetails?.userType === 1

	return (
		<View className="p-4 flex-1 bg-white">
			<StatusBar className="bg-primary" barStyle="light-content" />
			<View className="gap-8">
				<View className="flex-row flex-wrap justify-between gap-2 xs:gap-3">
					<Card className="w-[48%]">
						<CardHeader className="gap-2">
							<CardTitle>{t('dashboard.couponsScanned')}</CardTitle>
							<CardDescription>{t('dashboard.couponsScannedDesc')}</CardDescription>
						</CardHeader>
						<CardContent>
							<Text className="text-2xl font-semibold text-primary">
								{dashboardData?.totalCouponsRedeemed ||
									dashboardData?.totalCouponsRedeemedCount ||
									dashboardData?.totalCouponsScanned}
							</Text>
						</CardContent>
					</Card>

					<Card className="w-[48%]">
						<CardHeader className="gap-2">
							<CardTitle>
								{isDistributor ? t('dashboard.redeemed') : t('dashboard.scanned')}{" "}
								{isMechanic ? t('dashboard.points') : t('dashboard.amount')}
							</CardTitle>
							<CardDescription>
								{t('dashboard.totalTillDate', {
									type: isDistributor
										? t('dashboard.redeemedPoints')
										: t('dashboard.scannedAmount'),
								})}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Text className="text-2xl font-semibold text-primary">
								{dashboardData?.totalAmountRedeemed ||
									dashboardData?.totalCouponsRedeemedPoint ||
									dashboardData?.totalAmountCouponsScanned}
							</Text>
						</CardContent>
					</Card>

					{/* Uncomment and translate if needed
					{userDetails?.userType === 1 && (
						<Card className="w-[48%]">
							<CardHeader className="gap-2">
								<CardTitle>{t('dashboard.couponScannedForCash')}</CardTitle>
								<CardDescription>{t('dashboard.couponScannedForCashDesc')}</CardDescription>
							</CardHeader>
							<CardContent>
								<Text className="text-2xl font-semibold text-primary">
									{dashboardData?.totalCouponsRedeemedCash || dashboardData?.totalBalancedPoint}
								</Text>
							</CardContent>
						</Card>
					)}

					<Card className="w-[48%]">
						<CardHeader className="gap-2">
							<CardTitle>{t('dashboard.couponScannedForScheme')}</CardTitle>
							<CardDescription>{t('dashboard.couponScannedForSchemeDesc')}</CardDescription>
						</CardHeader>
						<CardContent>
							<Text className="text-2xl font-semibold text-primary">
								{dashboardData?.totalCouponsRedeemedFOC}
							</Text>
						</CardContent>
					</Card> */}

				</View>

				<Button className="flex-row gap-4" size="lg" onPress={() => router.navigate('/(root)/(stack)/camera')}>
					<QrCodeIcon className="text-white" />
					<Text>{t('dashboard.scanButton')}</Text>
				</Button>
			</View>
		</View>
	)
}

export default HomeScreen
