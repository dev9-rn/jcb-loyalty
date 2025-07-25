import { ScrollView, useWindowDimensions, View } from 'react-native'
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
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CircleAlertIcon } from "@/libs/icons/CircleAlertIcon"

type Props = {}

const MIN_COLUMN_WIDTHS = [120, 120, 100, 120];

const HomeScreen = ({ }: Props) => {

	const [dashboardData, setDashboardData] = useState<IDashboardData | undefined>(undefined)

	const { userDetails } = useUser()
	const { t } = useTranslation();
	const { width } = useWindowDimensions();

	const toast = useToast()

	useFocusEffect(
		useCallback(() => {
			fetchDashboardData()
		}, [])
	);

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
	};

	const isDistributor = userDetails?.userType === 0
	const isMechanic = userDetails?.userType === 1

	const columnWidths = React.useMemo(() => {
		return MIN_COLUMN_WIDTHS.map((minWidth) => {
			const evenWidth = width / MIN_COLUMN_WIDTHS.length;
			return evenWidth > minWidth ? evenWidth : minWidth;
		});
	}, [width]);

	return (
		<View className="p-4 flex-1 bg-white">
			<StatusBar className="bg-primary" barStyle="dark-content" />
			<ScrollView className="flex-1" contentContainerClassName='gap-8'>
				<View className="flex-row flex-wrap justify-between gap-2 xs:gap-3">
					<Card className="w-[48%]">
						<CardHeader className="gap-2">
							<CardTitle>{t('dashboard.couponsScanned')}</CardTitle>
							<CardDescription>{t('dashboard.couponsScannedDesc')}</CardDescription>
						</CardHeader>
						<CardContent>
							<Text className="text-2xl font-semibold">
								{dashboardData?.totalCouponsRedeemed?.toString() || dashboardData?.totalCouponsRedeemedCount?.toString() || dashboardData?.totalCouponsScanned?.toString()}
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
								{dashboardData?.totalAmountRedeemed?.toString() ||
									dashboardData?.totalCouponsRedeemedPoint?.toString() ||
									dashboardData?.totalAmountCouponsScanned?.toString()}
							</Text>
						</CardContent>
					</Card>

					{/* Uncomment and translate if needed */}
					{(
						(dashboardData?.totalCouponsRedeemedCash && dashboardData?.totalCouponsRedeemedCash !== 0) ||
						(dashboardData?.totalBalancedPoint && parseInt(dashboardData?.totalBalancedPoint) !== 0)
					) && (
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

					{(dashboardData?.totalCouponsRedeemedFOC || 0) > 0 && (
						<Dialog className='w-[48%] shadow elevation-lg bg-white shadow-gray-400'>
							<DialogTrigger>
								<Card className='border-primary relative'>
									<View className='absolute m-2 right-0'>
										<CircleAlertIcon />
									</View>
									<CardHeader className="gap-2">
										<CardTitle>{t('dashboard.couponScannedForFoc')}</CardTitle>
										<CardDescription>{t('dashboard.couponScannedForFocDesc')}</CardDescription>
									</CardHeader>
									<CardContent>
										<Text className="text-2xl font-semibold text-primary">
											{dashboardData?.totalCouponsRedeemedFOC}
										</Text>
									</CardContent>
								</Card>
							</DialogTrigger>

							<DialogContent className=''>
								<DialogHeader>
									<DialogTitle>FOC Schemes</DialogTitle>
								</DialogHeader>
								<View className='h-1/2 w-full'>
									<ScrollView className='flex-1'>
										<Table aria-labelledby='scheme-table'>
											<TableHeader>
												<TableRow>
													<TableHead className='px-0.5' style={{ width: columnWidths[0] }}>
														<Text>Scheme</Text>
													</TableHead>
													<TableHead style={{ width: columnWidths[1] }}>
														<Text>Total Count</Text>
													</TableHead>
												</TableRow>
											</TableHeader>
										</Table>
										<TableBody>
											{dashboardData?.schemeDetails.map((scheme, i) => (
												<TableRow
													key={i}
												>
													<TableCell style={{ width: columnWidths[0] }}>
														<Text>{scheme.scheme_name}</Text>
													</TableCell>
													<TableCell style={{ width: columnWidths[1] }}>
														<Text className='text-primary font-semibold'>{scheme.FOCSchemeRedeemedCount}</Text>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</ScrollView>
								</View>
								<DialogFooter className='mt-auto'>
									<DialogClose asChild>
										<Button>
											<Text>OK</Text>
										</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					)}
				</View>

				<Button className="flex-row gap-4" size="lg" onPress={() => router.navigate('/(root)/(stack)/camera')}>
					<QrCodeIcon className="text-white" />
					<Text>{t('dashboard.scanButton')}</Text>
				</Button>
			</ScrollView>
		</View>
	)
}

export default HomeScreen
