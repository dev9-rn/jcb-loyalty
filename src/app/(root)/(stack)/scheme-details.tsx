import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import formatDateTime from "@/utils/formatDateTime";
import { ArrowLeft } from "lucide-react-native";

type RedeemedCouponDetails = {
  id: string;
  coupon_id?: string;
  item_code?: string;
  value: string;
  serial_no?: string;
  serial_no_print?: string;
  distributor_redemption_flag?: string;
  distributor_redemption_date?: string;
  scanned_date?: string;
  brand_code?: string;
};

const SchemeDetailsScreen = () => {
  const router = useRouter();
  const { schemeTitle, redeemedCoupons } = useLocalSearchParams();

  const coupons: RedeemedCouponDetails[] = redeemedCoupons
    ? JSON.parse(redeemedCoupons as string)
    : [];

  const handleGoBack = () => {
    router.back();
  };

  const renderCouponCard = ({ item }: { item: RedeemedCouponDetails }) => (
    <View className="bg-white p-5 mb-4 rounded-2xl border border-gray-200 shadow-sm gap-2">
      {/* Top Row - Serial & Value */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 pr-3">
          <Text className="text-[14px] text-gray-500 mb-0.5">Serial Number</Text>
          <Text className="text-[16px] font-semibold text-gray-900 break-all">
            {item.id}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-[14px] text-gray-500 mb-0.5">Value</Text>
          <Text className="text-[16px] font-bold text-green-600">₹{item.value}</Text>
        </View>
      </View>

      {/* Item Code */}
      {item.item_code && (
        <View className="mb-3">
          <Text className="text-[14px] text-gray-500 mb-0.5">Item Code</Text>
          <Text className="text-[15px] font-medium text-gray-800">{item.item_code}</Text>
        </View>
      )}

      {/* Serial No Print */}
      {/* {(item.serial_no_print || item.serial_no) && (
        <View className="mb-3">
          <Text className="text-xs text-gray-500 mb-0.5">Serial No (Print)</Text>
          <Text className="text-base font-medium text-gray-800">
            {item.serial_no_print || item.serial_no}
          </Text>
        </View>
      )} */}

      {/* Redemption Date */}
      <View className="mb-3">
        <Text className="text-[14px] text-gray-500 mb-0.5">Redemption Date</Text>
        <Text className="text-[15px] font-medium text-gray-800">
          {formatDateTime(
            item.distributor_redemption_date || item.scanned_date || ""
          )}
        </Text>
      </View>

      {/* Status */}
      <View className="mb-3 flex-row justify-start gap-5 items-center">
        <View>
        <Text className="text-[14px] text-gray-500 mb-0.5">Status</Text>
        <Text
          className={`text-base font-semibold ${
            (item.distributor_redemption_flag || "").toLowerCase() === "redeemed"
              ? "text-green-600"
              : "text-blue-600"
          }`}
        >
          {item.distributor_redemption_flag || "Scanned"}
        </Text>
        </View>
        {item.brand_code && (
        <View>
          <Text className="text-[14px] text-gray-500 mb-0.5">Brand Code</Text>
          <Text className="text-base font-medium text-gray-800">{item.brand_code}</Text>
        </View>
      )}
      </View>

      {/* Brand Code */}
      
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      {/* <View className="bg-white px-5 pt-12 pb-5 border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={handleGoBack} >
          <ArrowLeft size={26} color="#374151" />
        </TouchableOpacity>
        <Text 
          className="flex-1 text-xl font-semibold text-gray-900 pr-8" 
          numberOfLines={1}
        >
          {schemeTitle || "Scheme Details"}
        </Text>
      </View> */}

      {/* Total Redeemed Summary */}
      <View className="mx-4 mt-5 p-5 bg-white rounded-2xl border border-gray-200">
        <Text className="text-sm text-gray-500">Total Redeemed Coupons</Text>
        <Text className="text-4xl font-bold text-gray-900 mt-1">
          {coupons.length}
        </Text>
      </View>

      {/* Coupons List */}
      <View className="flex-1 px-4 pt-6">
        {coupons.length > 0 ? (
          <FlatList
            data={coupons}
            keyExtractor={(item) => item.id}
            renderItem={renderCouponCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500 text-lg">No redeemed coupons found</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default SchemeDetailsScreen;