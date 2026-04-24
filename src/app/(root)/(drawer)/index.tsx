import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useUser from "@/hooks/useUser";
import axiosInstance from "@/utils/axiosInstance";
import {
  DISPLAY_NOTIFICATION_DASHBOARD,
  GET_DASHBOARD_DATA,
  GET_MECHANIC_DASHBOARD,
  GET_RETAILER_DASHBOARD,
} from "@/utils/routes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { QrCodeIcon } from "@/libs/icons/QrCodeIcon";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "react-native";
import { useToast } from "react-native-toast-notifications";
import DashboardCard from "@/components/DashboardCard";
import CouponChip from "@/components/ui/couponChip";
import { TriangleAlert } from "@/libs/icons/TriangleAlert";
import { X } from "@/libs/icons/X";
import useAuth from "@/hooks/useAuth";
import CustomModal from "@/components/CustomModel";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
type Props = {};

const HomeScreen = ({}: Props) => {
  const [dashboardData, setDashboardData] = useState<
    IDashboardData | undefined
  >(undefined);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationData, setNotificationData] = useState<string>("");
  const [showDisplayNotification, setShowDisplayNotification] =
    useState<boolean>(false);
  const [displayNotificationData, setDisplayNotificationData] =
    useState<string>("");
  const { userDetails } = useUser();
  const { fetchisMaintenanceApi } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const toast = useToast();

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
      fetchDashboardNotification();
    }, []),
  );

  useEffect(() => {
    fetchDisplayNotification();
  }, []);

  const fetchDisplayNotification = async () => {
    try {
      const { data } = await axiosInstance.get<IFDisplayNotification>(
        DISPLAY_NOTIFICATION_DASHBOARD,
      );
      if (data?.showNotification > 0) {
        setShowDisplayNotification(true);
        setDisplayNotificationData(data?.notification);
      } else {
        setDisplayNotificationData(data?.notification);
      }
    } catch (error) {
      console.log(error, "DISPLAY NOTIFICATION API");
    }
  };

  const fetchDashboardNotification = async () => {
    try {
      const response = await axiosInstance.get(DISPLAY_NOTIFICATION_DASHBOARD);
      if (response?.data?.showNotification > 0) {
        setShowNotification(true);
        setNotificationData(response?.data?.notification);
      } else {
        setShowNotification(false);
        setNotificationData("");
      }
    } catch (error) {
      console.log(error, "response Error");
    }
  };

  const fetchDashboardData = async () => {
    const dashboardFormData = new FormData();

    dashboardFormData.append("distributorId", String(userDetails?.id));
    dashboardFormData.append("month", String(new Date().getMonth() + 1));
    dashboardFormData.append("year", String(new Date().getFullYear()));

    try {
      const response = await axiosInstance.post(
        GET_DASHBOARD_DATA,
        dashboardFormData,
      );

      if (response.data.status !== 200) {
        toast.show(response.data.message, {
          data: response,
        });
      }

      setDashboardData(response.data);
    } catch (error) {}
  };

  return (
    <View className="p-4 flex-1 bg-white" style={{paddingBottom: insets.bottom}}>
      <StatusBar className="bg-primary" barStyle="dark-content" />
      <CustomModal
        visible={showDisplayNotification}
        onClose={() => setShowDisplayNotification(false)}
        title='Important Notice'
        showIcon
      >
        <View className="p-4 bg-white rounded-md">
          {/* <View className="flex-row gap-3 items-center">
            <TriangleAlert className="text-[#856404] mr-2" />
            <Text className="text-[16px] font-bold">Important Notice</Text>
          </View> */}
          <Text className="">{displayNotificationData.trim()}</Text>
        </View>
      </CustomModal>
      {showNotification && (
        <View className="p-3 bg-[#FFF3CD] rounded-md mb-5">
          <View className="flex-row items-start">
            <TriangleAlert className="text-[#856404] mr-2" />

            <Text className="flex-1 text-[#856404] ">{notificationData}</Text>

            <Pressable onPress={() => setShowNotification(false)}>
              <X className="text-[#856404] ml-2" />
            </Pressable>
          </View>
        </View>
      )}
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5"
        showsVerticalScrollIndicator={false}
      >
        <DashboardCard title={t("login.Overall_Information")}>
          <View className="gap-2">
            <CouponChip
              title={t("login.No_of_Coupons_Scanned")}
              amount={dashboardData?.totalNoOfCouponsScanned ?? 0}
              chipColor="#EBF5FB"
            />

            <CouponChip
              title={t("login.Value_of_Coupons_Scanned")}
              amount={dashboardData?.totalValueOfCouponsScanned ?? 0}
              chipColor="#EBF5FB"
              showRupee
            />
          </View>
        </DashboardCard>
        <DashboardCard title={t("login.Cash_Coupons")}>
          <View className="gap-2">
            <CouponChip
              title={t("login.No_of_Coupons_Scanned")}
              amount={dashboardData?.totalNoOfCashCouponsScanned ?? 0}
              chipColor="#f5eef8"
            />

            <CouponChip
              title={t("login.Value_of_Coupons_Scanned")}
              amount={dashboardData?.totalValueOfCashCouponsScanned ?? 0}
              chipColor="#f5eef8"
              showRupee
            />
            <CouponChip
              title={t("login.No_of_Coupons_Credited")}
              amount={dashboardData?.totalNoOfCashCouponsCredited ?? 0}
              chipColor="#f5eef8"
              textColor="green"
            />
            <CouponChip
              title={t("login.Value_of_Coupons_Credited")}
              amount={dashboardData?.totalValueOfCashCouponsCredited ?? 0}
              chipColor="#f5eef8"
              showRupee
              textColor="green"
            />
            <CouponChip
              title={t("login.No_of_Coupons_Pending")}
              amount={dashboardData?.totalNoOfCashCouponsPending ?? 0}
              chipColor="#f5eef8"
              textColor="orange"
            />
            <CouponChip
              title={t("login.Value_of_Coupons_Pending")}
              amount={dashboardData?.totalValueOfCashCouponsPending ?? 0}
              chipColor="#f5eef8"
              showRupee
              textColor="orange"
            />
          </View>
        </DashboardCard>
        <DashboardCard title={t("login.foc_Coupons")}>
          <View className="gap-2">
            <CouponChip
              title={t("login.No_of_Coupons_Scanned")}
              amount={dashboardData?.totalNoOfFOCCouponsScanned ?? 0}
              chipColor="#eafaf1"
            />

            <CouponChip
              title={t("login.Value_of_Coupons_Scanned")}
              amount={dashboardData?.totalValueOfFOCCouponsScanned ?? 0}
              chipColor="#eafaf1"
              showRupee
            />
          </View>
        </DashboardCard>
        <Button
          className="flex-row gap-4"
          size="lg"
          onPress={() => router.navigate("/(root)/(drawer)/camera")}
        >
          <QrCodeIcon className="text-white" />
          <Text>{t("login.scan_button")}</Text>
        </Button>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
