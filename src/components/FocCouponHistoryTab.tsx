import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Separator } from "./ui/separator";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import useUser from "@/hooks/useUser";
import { useTranslation } from "react-i18next";
import formatDateTime from "@/utils/formatDateTime";
import {
    GET_DISTRIBUTOR_SCHEMES,
    GET_DISTRIBUTOR_SCHEMES_DETAILS,
} from "@/utils/routes";
import axios from "axios";
import { CalendarIcon } from "@/libs/icons/CalendarIcon";
import axiosInstance from "@/utils/axiosInstance";
import { formatDateForAPI } from "@/libs/utils";
import { useFocusEffect } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import { useRouter } from "expo-router";
import { ChevronDown } from "lucide-react-native";

type Scheme = {
    id: string;
    value: string;
};

type RedeemedCouponDetails = {
    id: string;
    value: string;
    item_code?: string;
    distributor_redemption_date?: string;
    scanned_date?: string;
    distributor_redemption_flag?: string;
};

type SchemeDetail = {
    id: string;
    title: string;
    from_date: string;
    to_date: string;
    totalNoOfCouponsRedeemed: number;
    redeemedCouponsDetails: RedeemedCouponDetails[];
};

const FocCouponHistoryTab = () => {
    const { userDetails } = useUser();
    const { t } = useTranslation();
    const toast = useToast();
    const router = useRouter();

    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [selectedSchemeId, setSelectedSchemeId] = useState<string>("0");
    const [selectedSchemeName, setSelectedSchemeName] = useState<string>("All");

    const [showSchemeDropdown, setShowSchemeDropdown] = useState(false);

    const [couponHistoryData, setCouponHistoryData] = useState<SchemeDetail[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentOffset, setCurrentOffset] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);

    // Date management
    const [selectedFromDate, setSelectedFromDate] = useState(new Date());
    const [selectedToDate, setSelectedToDate] = useState(new Date());
    const [showFromDate, setShowFromDate] = useState(false);
    const [showToDate, setShowToDate] = useState(false);

    // ==================== SCHEMES LOADING ====================
    const getDistributorSchemes = async () => {
        const formData = new FormData();
        formData.append("distributorId", String(userDetails?.id));

        try {
            const response = await axiosInstance.post(GET_DISTRIBUTOR_SCHEMES, formData);

            if (response?.data?.status === 200) {
                const schemeList: Scheme[] = (response.data.schemes || []).map((s: any) => ({
                    id: s.id,
                    value: s.value,
                }));
                setSchemes(schemeList);

                const allScheme = schemeList.find((s) => s.id === "0");
                if (allScheme) {
                    setSelectedSchemeName(allScheme.value);
                }
            } else {
                toast.show(response.data?.message || "Failed to load schemes");
            }
        } catch (error) {
            console.log("DISTRIBUTOR SCHEMES API Error:", error);
            toast.show("Failed to load schemes");
        }
    };

    // ==================== FETCH HISTORY ====================
    const fetchCouponHistories = async ({
        pageOffset = 0,
        force = false,
    }: { pageOffset?: number; force?: boolean } = {}) => {
        if (!force && (!hasMore || loading)) return;

        setLoading(true);

        const formData = new FormData();
        formData.append("distributorId", String(userDetails?.id));
        formData.append("fromDate", formatDateForAPI(selectedFromDate));
        formData.append("schemeId", selectedSchemeId);
        formData.append("toDate", formatDateForAPI(selectedToDate));
        formData.append("offset", pageOffset.toString());
        formData.append("redeemType", "FOC");

        try {
            const response = await axiosInstance.post(
                GET_DISTRIBUTOR_SCHEMES_DETAILS,
                formData
            );

            const newData: SchemeDetail[] = response.data.schemes || [];

            setCouponHistoryData((prev) =>
                pageOffset === 0 ? newData : [...prev, ...newData]
            );

            setCurrentOffset(response.data.offset || 0);
            setHasMore(newData.length > 0);
        } catch (error) {
            console.log("Coupon History Error:", error);
            if (axios.isAxiosError(error)) {
                if (error.response?.data?.schemes?.length === 0) {
                    setHasMore(false);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    // Load schemes ONLY ONCE
    useEffect(() => {
        getDistributorSchemes();
    }, []);

    // Reset + fetch on focus
    useFocusEffect(
        useCallback(() => {
            setCouponHistoryData([]);
            setCurrentOffset(0);
            setHasMore(true);
            fetchCouponHistories({ pageOffset: 0, force: true });
        }, [selectedSchemeId, selectedFromDate, selectedToDate])
    );

    // Refetch when scheme or dates change
    useEffect(() => {
        setCouponHistoryData([]);
        setCurrentOffset(0);
        setHasMore(true);
        fetchCouponHistories({ pageOffset: 0, force: true });
    }, [selectedSchemeId, selectedFromDate, selectedToDate]);

    // ==================== ORIGINAL DATE PICKER HANDLERS + TO DATE VALIDATION ====================
    const onFromDateChange = (event: DateTimePickerEvent, date?: Date) => {
        setShowFromDate(false);

        if (event.type === "set" && date) {
            if (date.getTime() !== selectedFromDate.getTime()) {
                setSelectedFromDate(date);

                // Auto-adjust To Date if it becomes earlier than new From Date
                if (date.getTime() > selectedToDate.getTime()) {
                    setSelectedToDate(date);
                }
            }
        }
    };

    const onToDateChange = (event: DateTimePickerEvent, date?: Date) => {
        setShowToDate(false);

        if (event.type === "set" && date) {
            if (date.getTime() !== selectedToDate.getTime()) {
                // VALIDATION: To Date cannot be before From Date
                if (date.getTime() < selectedFromDate.getTime()) {
                    toast.show("To Date cannot be earlier than From Date",
                        {
                            data: {
                                status: 400
                            }
                        });
                    setSelectedToDate(selectedFromDate);   // Force To Date = From Date
                } else {
                    setSelectedToDate(date);
                }
            }
        }
    };

    const handleSchemeSelect = (scheme: Scheme) => {
        setSelectedSchemeId(scheme.id);
        setSelectedSchemeName(scheme.value);
        setShowSchemeDropdown(false);
    };

    const renderSchemeItem = ({ item }: { item: SchemeDetail }) => (
        <TouchableOpacity
            onPress={() => {
                router.push({
                    pathname: "/scheme-details",
                    params: {
                        schemeId: item.id,
                        schemeTitle: item.title,
                        redeemedCoupons: JSON.stringify(item.redeemedCouponsDetails || []),
                    },
                });
            }}
            className="bg-white p-4 rounded-2xl border border-gray-200 mb-3 active:opacity-80"
        >
            <Text className="text-lg font-semibold text-gray-900">{item.title}</Text>

            <View className="flex-row justify-between mt-2">
                <Text className="text-sm text-gray-600">
                    Redeemed: <Text className="font-medium">{item.totalNoOfCouponsRedeemed}</Text>
                </Text>
                <Text className="text-xs text-gray-500">
                    {item.from_date} → {item.to_date}
                </Text>
            </View>
        </TouchableOpacity>
    );

    console.log(selectedFromDate, "selectedFromDate");
    console.log(showFromDate, "showFromDate");

    return (
        <View className="flex-1 bg-gray-50">
            {/* Date Pickers Row */}
            <View className="flex-row items-center justify-around py-4 border-b border-gray-200 bg-white">
                <View className="items-center">
                    <TouchableOpacity
                        className="flex-row items-center gap-2 p-2"
                        onPress={() => setShowFromDate(true)}
                    >
                        <CalendarIcon className="text-primary" height={20} width={20} />
                        <Text className="text-sm text-gray-600">From</Text>
                        <Text className="text-base font-semibold">
                            {selectedFromDate.toLocaleDateString()}
                        </Text>
                    </TouchableOpacity>

                    {showFromDate && (
                        <DateTimePicker
                            value={selectedFromDate}
                            mode="date"
                            onChange={onFromDateChange}
                        />
                    )}
                </View>

                <View className="items-center">
                    <TouchableOpacity
                        className="flex-row items-center gap-2 p-2"
                        onPress={() => setShowToDate(true)}
                    >
                        <CalendarIcon className="text-primary" height={20} width={20} />
                        <Text className="text-sm text-gray-600">To</Text>
                        <Text className="text-base font-semibold">
                            {selectedToDate.toLocaleDateString()}
                        </Text>
                    </TouchableOpacity>

                    {showToDate && (
                        <DateTimePicker
                            value={selectedToDate}
                            mode="date"
                            onChange={onToDateChange}
                        />
                    )}
                </View>
            </View>

            {/* Custom Scheme Dropdown */}
            <View className="px-4 py-3 bg-white border-b border-gray-200">
                <Text className="text-sm text-gray-600 mb-1">Select Scheme</Text>

                <TouchableOpacity
                    onPress={() => setShowSchemeDropdown(true)}
                    className="flex-row items-center justify-between bg-gray-100 px-4 py-3 rounded-xl border border-gray-300"
                >
                    <Text className="text-base font-medium text-gray-900">
                        {selectedSchemeName}
                    </Text>
                    <ChevronDown size={20} color="#6b7280" />
                </TouchableOpacity>
            </View>

            {/* Main List */}
            <FlatList
                contentContainerClassName="p-4"
                data={couponHistoryData}
                keyExtractor={(item) => item.id}
                renderItem={renderSchemeItem}
                ItemSeparatorComponent={() => <View className="h-2" />}
                onEndReached={() => {
                    if (couponHistoryData.length > 0 && hasMore && !loading && !showFromDate && !showToDate) {
                        fetchCouponHistories({
                            pageOffset: currentOffset,
                        });
                    }
                }}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    !loading ? (
                        <View className="items-center py-12">
                            <Text className="text-lg font-medium text-gray-500 text-center">
                                {t("login.NoHistory_Error")}
                            </Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={
                    loading ? (
                        <ActivityIndicator size="large" className="my-8" />
                    ) : !hasMore && couponHistoryData.length > 0 ? (
                        <Text className="text-center text-gray-500 my-6">
                            No more redeem history!
                        </Text>
                    ) : null
                }
            />

            {/* Custom Dropdown Modal */}
            <Modal
                visible={showSchemeDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSchemeDropdown(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setShowSchemeDropdown(false)}
                    className="flex-1 bg-black/50 justify-end"
                >
                    <View className="bg-white rounded-t-3xl max-h-[70%]">
                        <View className="p-4 border-b border-gray-200">
                            <Text className="text-lg font-semibold text-center">Select Scheme</Text>
                        </View>

                        <ScrollView className="max-h-[60vh]">
                            {schemes.map((scheme) => (
                                <TouchableOpacity
                                    key={scheme.id}
                                    onPress={() => handleSchemeSelect(scheme)}
                                    className={`px-5 py-4 border-b border-gray-100 ${selectedSchemeId === scheme.id ? "bg-blue-50" : ""
                                        }`}
                                >
                                    <Text
                                        className={`text-base ${selectedSchemeId === scheme.id
                                            ? "font-semibold text-blue-700"
                                            : "text-gray-900"
                                            }`}
                                    >
                                        {scheme.value}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            onPress={() => setShowSchemeDropdown(false)}
                            className="p-4 border-t border-gray-200"
                        >
                            <Text className="text-center text-blue-600 font-medium text-lg">
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default FocCouponHistoryTab;