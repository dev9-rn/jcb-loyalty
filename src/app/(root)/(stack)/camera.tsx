import {
  Dimensions,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";

import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import BarcodeMask from "react-native-barcode-mask";
import { useFocusEffect, useNavigation, usePathname } from "expo-router"; // ✅ added useFocusEffect
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useToast } from "react-native-toast-notifications";

import { ZapOffIcon } from "@/libs/icons/ZapIconOff";
import { ZapIcon } from "@/libs/icons/ZapIcon";
import useUser from "@/hooks/useUser";
import axiosInstance from "@/utils/axiosInstance";
import {
  CHECK_COUPON,
  REDEEM_COUPON,
  REDEEM_MECHANIC_COUPON,
  SCAN_RETAILER_COUPON,
} from "@/utils/routes";
import CouponRedeemedDialog from "@/components/CouponRedeemedDialog";
import axios from "axios";
import CouponErrorDialog from "@/components/CouponErrorDialog";
import * as Haptics from "expo-haptics";
import { useAudioPlayer } from "expo-audio";
import CouponTypeRedeemDialog from "@/components/CouponTypeRedeemDialog";
import { useTranslation } from "react-i18next";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import CustomModal from "@/components/CustomModel";
import { getRelativeTime } from "@/libs/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import Entypo from "@expo/vector-icons/Entypo";
import { IRedeemedCoupon } from "@/types/response";

type Props = {};

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const MASK_WIDTH = SCREEN_WIDTH * 0.7;
const MASK_HEIGHT = SCREEN_WIDTH * 0.7;

const CameraScreen = ({ }: Props) => {
  const [flashMode, setFlashMode] = useState<boolean>(false);
  const [scanned, setScanned] = useState(false);
  const [active, setActive] = useState<boolean>(false); // ✅ start as false, useFocusEffect will activate

  const [couponValidationData, setCouponValidationData] = useState(undefined);
  const [isCouponInvalid, setIsCouponInvalid] = useState<boolean>(false);
  const [isCouponRedeemed, setIsCouponRedeem] = useState<boolean>(false);
  const [coupondRedeemedData, setCouponRedeemedData] = useState<IRedeemedCoupon | undefined> (undefined);
  const [isCouponTypeMultiple, setIsCouponTypeMultiple] =
    useState<boolean>(false);
  const [qrData, setQrData] = useState<string>("");
  const [showModel, setShowModel] = useState<boolean>(false);

  const { userDetails } = useUser();
  const { t } = useTranslation();

  const pathname = usePathname();
  const routeName = pathname.split("/").pop();

  const toast = useToast();

  const qrSuccessAudio = useAudioPlayer(
    require("@/assets/sounds/qr-scan-success_1.wav")
  );
  const qrErrorAudio = useAudioPlayer(
    require("@/assets/sounds/qr-scan-error_2.mp3")
  );

  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();

  // ✅ FIX: Activate camera only when screen is focused, deactivate on blur
  useFocusEffect(
    React.useCallback(() => {
      // Screen is focused — turn camera on
      setActive(true);
      setScanned(false);

      return () => {
        // Screen is blurred/unmounted — turn camera OFF immediately
        setActive(false);
        setScanned(false);
        setShowModel(false);
      };
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({
      title: t("Scan"),
      headerTransparent: true,
      headerTitleStyle: {
        color: "#FFF",
      },
      headerTintColor: "white",
      headerRight: () => (
        <TouchableOpacity
          className="p-2 rounded-lg active:bg-white/20"
          onPress={() => {
            setFlashMode((prev) => !prev); // ✅ use functional update to avoid stale closure
          }}
        >
          {flashMode ? (
            <ZapIcon color={"#FFF"} />
          ) : (
            <ZapOffIcon color={"#FFF"} />
          )}
        </TouchableOpacity>
      ),
    });
  }, [flashMode, routeName, navigation, t]);

  // ✅ REMOVED the old useEffect that set active(false) on unmount only —
  //    useFocusEffect above handles both focus AND blur/unmount correctly.

  useEffect(() => {
    requestPermission();
  }, []);

  const handleBarCodeScanned = ({ bounds, data }: BarcodeScanningResult) => {
    if (scanned || isCouponRedeemed || isCouponInvalid) return;

    setScanned(true);
    setQrData(data);
    fetchBarCodeDataValidation(data);
    setTimeout(() => setScanned(false), 2000);
  };

  const fetchBarCodeDataValidation = async (data: string) => {
    const barCodeFormData = new FormData();

    barCodeFormData.append("qrText", data);
    barCodeFormData.append("distributorId", String(userDetails?.id));

    try {
      const response = await axiosInstance.post(CHECK_COUPON, barCodeFormData);

      if (response.data.status != 200) {
        setActive(false);
        toast.show(response.data.message, {
          data: response,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCouponValidationData(response?.data);
      setShowModel(true);
      setActive(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        qrErrorAudio.play();
        qrErrorAudio.seekTo(0);
        setCouponValidationData(error.response?.data);
        setIsCouponInvalid(true);
        setIsCouponTypeMultiple(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setActive(false);
    }
  };

  const fetchCouponRedeemResults = async (
    data: string,
    redeemedType?: string
  ) => {
    const redeemFormData = new FormData();
    redeemFormData.append("qrText", data);
    redeemFormData.append("distributorId", String(userDetails?.id));
    redeemFormData.append("redeemType", redeemedType);

    try {
      const response = await axiosInstance.post(REDEEM_COUPON, redeemFormData);

      if (response.data.status != 200) {
        toast.show(response.data.message, {
          data: response.data,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qrSuccessAudio.play();
      qrSuccessAudio.seekTo(0);
      setCouponRedeemedData(response.data);
      setIsCouponRedeem(true);
      setIsCouponTypeMultiple(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        qrErrorAudio.play();
        qrErrorAudio.seekTo(0);
        setCouponValidationData(error.response?.data);
        setIsCouponInvalid(true);
        setIsCouponTypeMultiple(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        toast.show(error.response?.data?.message || error.message, {
          data: error.response || error.message,
        });
      }
      setTimeout(() => setScanned(false), 2000);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-white items-center justify-center gap-4">
        <Text className="font-medium">
          We need your permission to access your camera to scan coupon QR codes
        </Text>
        <Button onPress={() => requestPermission()}>
          <Text>Grant Camera Access</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 relative">
      {/* ✅ CameraView only mounts when active — ensures hardware camera releases on nav away */}
      {active && (
        <CameraView
          style={styles.camera}
          enableTorch={flashMode}
          onBarcodeScanned={handleBarCodeScanned}
        />
      )}

      <BarcodeMask
        width={MASK_WIDTH}
        height={MASK_HEIGHT}
        showAnimatedLine={false}
        edgeRadius={8}
      />

      {couponValidationData?.status != 200 && (
        <CouponErrorDialog
          isCouponInvalid={isCouponInvalid}
          validationData={couponValidationData}
          setIsCouponInvalid={setIsCouponInvalid}
          setActive={setActive}
        />
      )}

      {isCouponRedeemed && (
        <CouponRedeemedDialog
          isCouponRedeemed={isCouponRedeemed}
          redeemedData={coupondRedeemedData}
          setIsCouponRedeem={setIsCouponRedeem}
          setActive={setActive}
        />
      )}

      <CustomModal
        onClose={() => {
          setShowModel(false);
          setActive(true);
        }}
        visible={showModel}
        showIcon={couponValidationData?.show_links == 1}
        title={`${couponValidationData?.redeemMethods?.[0]?.redeem_type === "1" &&
            couponValidationData?.show_links == 1
            ? "Alert"
            : "Coupon Details"
          }`}
      >
        {couponValidationData?.show_links == 1 ? (
          <View className="bg-white rounded-xl p-5">
            <Text className="text-[16px] text-gray-800 text-center leading-6 mb-5">
              {couponValidationData?.alert}
            </Text>

            <View className="border-b border-gray-300 mb-5" />

            {couponValidationData?.show_links === 1 &&
              couponValidationData.playstoreUrl !== "" && (
                <>
                  <TouchableOpacity
                    className="w-full flex-row items-center justify-center py-3 bg-[#E8F0FE] rounded-lg mb-3 gap-2"
                    onPress={() =>
                      Linking.openURL(couponValidationData.playstoreUrl)
                    }
                  >
                    <Entypo name="google-play" size={22} color="#1A73E8" />
                    <Text className="font-bold text-[16px] text-[#1A73E8]">
                      Play Store
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={couponValidationData.appstoreUrl == ""}
                    style={{
                      opacity:
                        couponValidationData.appstoreUrl === "" ? 0.5 : 1,
                    }}
                    className="w-full flex-row items-center justify-center py-3 bg-[#E8F0FE] rounded-lg gap-2"
                    onPress={() =>
                      Linking.openURL(couponValidationData.appstoreUrl)
                    }
                  >
                    <Ionicons
                      name="logo-apple-appstore"
                      size={22}
                      color="#1A73E8"
                    />
                    <Text className="font-bold text-[16px] text-[#1A73E8]">
                      App Store
                    </Text>
                  </TouchableOpacity>
                </>
              )}
          </View>
        ) : couponValidationData?.redeemMethods?.[0]?.redeem_type == "1" ? (
          <View className="mt-4 px-3">
            {[
              {
                label: t("login.tit"),
                value: couponValidationData?.redeemMethods?.[0]?.details?.title,
              },
              {
                label: t("login.prodName"),
                value:
                  couponValidationData?.redeemMethods?.[0]?.details
                    ?.product_name,
              },
              {
                label: t("login.totalProd"),
                value:
                  couponValidationData?.redeemMethods?.[0]?.details
                    ?.total_products,
              },
              {
                label: t("login.totalBox"),
                value:
                  couponValidationData?.redeemMethods?.[0]?.details
                    ?.total_boxes,
              },
              {
                label: "Target",
                value:
                  couponValidationData?.redeemMethods?.[0]?.details?.target,
              },
            ].map((item, index) => (
              <View key={index} className="flex-row mb-3">
                <Text className="text-gray-500 mr-1">*</Text>
                <Text className="text-gray-500 text-[14px] w-[40%]">
                  {item.label} :
                </Text>
                <Text
                  className="text-black text-[14px] flex-1 flex-wrap"
                  numberOfLines={2}
                >
                  {item.value || "-"}
                </Text>
              </View>
            ))}

            <View className="flex-row mb-3">
              <Text className="text-gray-500 mr-1">*</Text>
              <Text className="text-gray-500 text-[14px] w-[40%]">
                {t("login.validity")} :
              </Text>
              <Text className="text-black text-[14px] flex-1 flex-wrap">
                {t("login.offer")}{" "}
                <Text className="text-green-600">
                  {couponValidationData?.redeemMethods?.[0]?.details?.from_date}
                </Text>{" "}
                till{" "}
                <Text className="text-green-600">
                  {couponValidationData?.redeemMethods?.[0]?.details?.to_date}
                </Text>
              </Text>
            </View>

            <View className="border-b border-gray-400 mt-5" />
            <View className="rounded-md p-5 gap-4">
              <View className="flex-row gap-3">
                <Button
                  onPress={() => {
                    setShowModel(false);
                    fetchCouponRedeemResults(
                      qrData,
                      couponValidationData?.redeemMethods?.[0]?.redeem_type
                    );
                  }}
                >
                  <Text className="text-white font-bold text-[16px]">
                    {t("login.REDEEM")}
                  </Text>
                </Button>

                <Button
                  onPress={() => {
                    setShowModel(false);
                    setActive(true);
                  }}
                  className="flex-1 bg-gray-300 py-3 rounded-lg items-center justify-center"
                >
                  <Text className="font-bold text-[16px] text-grey-600">
                    {t("login.CANCEL")}
                  </Text>
                </Button>
              </View>
            </View>
          </View>
        ) : (
          <View className="rounded-md p-5 gap-4">
            <Text className="text-[18px] text-center mb-4">
              {t("login.RedeemCash")}
            </Text>

            <View className="flex-row gap-3">
              <Button
                onPress={() => {
                  setShowModel(false);
                  fetchCouponRedeemResults(
                    qrData,
                    couponValidationData?.redeemMethods?.[0]?.redeem_type
                  );
                }}
              >
                <Text className="text-white font-bold text-[16px]">
                  {t("login.RedeemCash")}
                </Text>
              </Button>

              <Button
                onPress={() => {
                  setShowModel(false);
                  setActive(true);
                }}
                className="flex-1 bg-gray-300 py-3 rounded-lg items-center justify-center"
              >
                <Text className="font-bold text-[16px] text-grey-600">
                  {t("login.CANCEL")}
                </Text>
              </Button>
            </View>
          </View>
        )}
      </CustomModal>
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
});