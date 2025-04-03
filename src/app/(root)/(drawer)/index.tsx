import { View } from 'react-native'
import React, { useEffect, useState } from 'react'
import useAuth from '@/hooks/useAuth'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { QrCodeIcon } from '@/libs/icons/QrCodeIcon';
import { router, useNavigation } from 'expo-router';
import useUser from '@/hooks/useUser';
import axiosInstance from '@/utils/axiosInstance';
import { GET_DASHBOARD_DATA, GET_MECHANIC_DASHBOARD, GET_RETAILER_DASHBOARD } from '@/utils/routes';

type Props = {}

const HomeScreen = ({ }: Props) => {

	const { logout } = useAuth();
	const { userDetails } = useUser();

	const [dashboardData, setDashboardData] = useState<IDashboardData | undefined>(undefined);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const getDashboardEndpoints = () => {
		if (userDetails?.userType === 0) {
			return {
				endpoint: GET_DASHBOARD_DATA,
				user_id: "distributorId"
			};
		};

		if (userDetails?.userType === 1) {
			return {
				endpoint: GET_MECHANIC_DASHBOARD,
				user_id: "mechanicId"
			};
		};

		return {
			endpoint: GET_RETAILER_DASHBOARD,
			user_id: "dealerId"
		}
	}

	const fetchDashboardData = async () => {
		const dashboardFormData = new FormData();

		// @ts-ignore
		dashboardFormData.append(getDashboardEndpoints()?.user_id, userDetails?.id);
		// @ts-ignore
		dashboardFormData.append('month', new Date().getMonth() + 1);
		// @ts-ignore
		dashboardFormData.append('year', new Date().getFullYear());
		// @ts-ignore
		dashboardFormData.append('userType', userDetails?.userType);
		dashboardFormData.append('language', 'en');

		try {
			const response = await axiosInstance.post(getDashboardEndpoints()?.endpoint, dashboardFormData);
			if (response.data.message != "success") {
				console.log(response.data.message, "ERROR_MESSSAGE");
			}

			setDashboardData(response.data);
		} catch (error) {
			console.log(error, 'SOMETHIGN_WENT_WRONG_DASH');
		};
	};

	return (
		<View className='p-4 flex-1 bg-white'>
			<View className='gap-8'>
				<View className="flex-row flex-wrap justify-between gap-2 xs:gap-3">
					<Card className="w-[48%]">
						<CardHeader className='gap-2'>
							<CardTitle>Coupons Scanned</CardTitle>
							<CardDescription>Total numbers of coupons redeemed</CardDescription>
						</CardHeader>
						<CardContent>
							<Text className='text-2xl font-semibold text-primary'>
								{dashboardData?.totalCouponsRedeemed || dashboardData?.totalCouponsRedeemedCount}
							</Text>
						</CardContent>
					</Card>

					<Card className="w-[48%]">
						<CardHeader className='gap-2'>
							<CardTitle>Redeemed Amount</CardTitle>
							<CardDescription>Total redeemed amount till date</CardDescription>
						</CardHeader>
						<CardContent>
							<Text className='text-2xl font-semibold text-primary'>
								{dashboardData?.totalAmountRedeemed || dashboardData?.totalCouponsRedeemedPoint}
							</Text>
						</CardContent>
					</Card>

					{userDetails?.userType == 1 && (
						<Card className="w-[48%]">
							<CardHeader className='gap-2'>
								<CardTitle>
									{userDetails?.userType === 1 ? "Coupon Scanned for cash" : "Total Balance Point"}
								</CardTitle>
								<CardDescription>
									Total coupons scanned
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Text className='text-2xl font-semibold text-primary'>
									{dashboardData?.totalCouponsRedeemedCash || dashboardData?.totalBalancedPoint}
								</Text>
							</CardContent>
						</Card>
					)}

					{/* <Card className="w-[48%]">
						<CardHeader className='gap-2'>
							<CardTitle>
								Coupons Scanned for scheme
							</CardTitle>
							<CardDescription>
								Total coupons scanned for scheme
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Text className='text-2xl font-semibold text-primary'>
								{dashboardData?.totalCouponsRedeemedFOC}
							</Text>
						</CardContent>
					</Card> */}
				</View>

				<Button className='flex-row gap-4' size={"lg"} onPress={() => router.navigate("/(root)/(stack)/camera")}>
					<QrCodeIcon className='text-white' />
					<Text>Scan</Text>
				</Button>

			</View>
		</View>
	)
}

export default HomeScreen