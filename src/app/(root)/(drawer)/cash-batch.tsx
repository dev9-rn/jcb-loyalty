import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Pressable,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";

import useUser from "@/hooks/useUser";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { CalendarIcon } from "@/libs/icons/CalendarIcon";
import axiosInstance from "@/utils/axiosInstance";
import {
  EXPORT_CASH_BATCH_REPORT,
  GET_CASH_BATCH_REPORTS,
} from "@/utils/routes";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import formatDateTime from "@/utils/formatDateTime";
import { formatDateForAPI } from "@/libs/utils";
import CustomModal from "@/components/CustomModel";
import { ICashBatchItem } from "@/types/response";
import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer";

type Props = {};

const CashBatchScreen = ({}: Props) => {
  const { userDetails } = useUser();
  const { t } = useTranslation();

  const toast = useToast();

  const [cashBatchReportData, setCashBatchReportData] = useState();
  const [selectedFromDate, setSelectedFromDate] = useState(new Date());
  const [selctedToDate, setSelectedToDate] = useState(new Date());
  const [showFromDate, setShowFromDate] = useState<boolean>(false);
  const [showToDate, setShowToDate] = useState<boolean>(false);
  const [showInfoModel, setShowInfoModel] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ICashBatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingBatchReport, setIsLoadingBatchReport] =
    useState<boolean>(false);
  const today = new Date();

  // Reset dates when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setSelectedFromDate(new Date());
      setSelectedToDate(new Date());
    }, [])
  );

  const formatDate = (date: string) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    fetchCachBatchReports();
  }, [selectedFromDate, selctedToDate]);

  const renderItem = ({ item }: any) => {
    return (
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-200">
        {/* 🔹 Top Row */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-base font-semibold text-gray-800">
            {t("login.batch")} :{" "}
            <Text className="font-bold">#{item.batch_id}</Text>
          </Text>

          <View className="flex-row items-center gap-2">
            <Text className="text-green-600 font-medium capitalize">
              {item.status}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setSelectedItem(item);
                setShowInfoModel(true);
              }}
              className="bg-gray-100 rounded-full p-1"
            >
              <Text className="text-black text-xs">ℹ️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 🔹 Divider */}
        <View className="h-[1px] bg-gray-200 my-2" />

        {/* 🔹 Content */}
        <View className="gap-3">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">{t("login.totalScanCo")} :</Text>
            <Text className="font-medium text-gray-900">
              {item.total_coupons_scanned}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">{t("login.totlAmnt")} :</Text>
            <Text className="font-semibold text-gray-900">
              ₹ {item.total_amount}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">{t("login.range")} :</Text>
            <Text className="text-gray-900 text-right">
              {formatDate(item.start_date)} to {formatDate(item.end_date)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const onFromDateChange = (event?: DateTimePickerEvent, date?: Date) => {
    setShowFromDate(false);

    if (!date) return;

    if (date > selctedToDate) {
      toast.show("From date cannot be greater than To date", {
        placement: "top",
      });
      return;
    }

    setSelectedFromDate(date);
  };

  const onToDateChange = (event?: DateTimePickerEvent, date?: Date) => {
    setShowToDate(false);

    if (!date) return;

    if (date < selectedFromDate) {
      toast.show("To date cannot be less than From date", {
        placement: "top",
      });
      return;
    }

    if (date > today) {
      toast.show("To date cannot be greater than today", {
        placement: "top",
      });
      return;
    }

    setSelectedToDate(date);
  };

  const fetchCachBatchReports = async () => {
    const cashBatchReportsFormData = new FormData();
    setIsLoadingBatchReport(true);
    cashBatchReportsFormData.append("distributorId", String(userDetails?.id));
    cashBatchReportsFormData.append(
      "startDate",
      formatDateForAPI(selectedFromDate)
    );
    cashBatchReportsFormData.append("endDate", formatDateForAPI(selctedToDate));
    cashBatchReportsFormData.append("userType", "0");

    try {
      const response = await axiosInstance.post(
        GET_CASH_BATCH_REPORTS,
        cashBatchReportsFormData
      );

      if (response.data.status !== 200) {
        toast.show(response.data.message, {
          data: response,
        });
        setIsLoadingBatchReport(false);
        return;
      }

      setCashBatchReportData(response.data.batchesData);
      setIsLoadingBatchReport(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setCashBatchReportData(undefined);
        setIsLoadingBatchReport(false);
        toast.show(error.response?.data.message, {
          data: error.response,
        });
      }
    }
  };

  // ─── Request Android storage permission (needed for Android < 13) ────────
  const requestAndroidStoragePermission = async (): Promise<boolean> => {
    // Android 13+ (API 33+) does NOT need WRITE_EXTERNAL_STORAGE for Downloads
    // Only needed for Android 12 and below
    if (Platform.OS !== "android") return true;

    const androidVersion = Platform.Version as number;

    if (androidVersion >= 33) {
      // Android 13+ — no permission needed for app-specific Downloads
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Storage Permission",
          message: "App needs access to storage to download the report.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn("Permission error:", err);
      return false;
    }
  };

  // ─── Build safe local file path per platform ─────────────────────────────
  const getLocalPath = (url: string): string => {
    const filename = url.split("/").pop() ?? "report.xls";
    const decodedFilename = decodeURIComponent(filename);

    if (Platform.OS === "android") {
      // ✅ Use DownloadDirectoryPath on Android so it appears in Downloads folder
      return `${RNFS.DownloadDirectoryPath}/${decodedFilename}`;
    } else {
      // iOS: DocumentDirectoryPath is accessible via Files app
      return `${RNFS.DocumentDirectoryPath}/${decodedFilename}`;
    }
  };

  // ─── Encode URL safely (handles spaces and special chars in path) ─────────
  const buildEncodedUrl = (fileUrl: string): string => {
    return fileUrl
      .split("/")
      .map((segment, index) =>
        // Skip protocol + domain (first 3 parts of https://domain/...)
        index < 3 ? segment : encodeURIComponent(decodeURIComponent(segment))
      )
      .join("/");
  };

  // ─── Core download + open logic ───────────────────────────────────────────
  const downloadFile = async (fileUrl: string) => {
    try {
      // ✅ Request storage permission on Android < 13 before downloading
      const hasPermission = await requestAndroidStoragePermission();
      if (!hasPermission) {
        toast.show(
          "Storage permission denied. Please allow it in app settings.",
          { placement: "top" }
        );
        return;
      }

      setLoading(true);

      const encodedUrl = buildEncodedUrl(fileUrl);
      const localFile = getLocalPath(fileUrl);

      // ✅ Delete existing file first to avoid RNFS stale cache issues on Android
      const fileExists = await RNFS.exists(localFile);
      if (fileExists) {
        await RNFS.unlink(localFile);
      }

      const result = await RNFS.downloadFile({
        fromUrl: encodedUrl,
        toFile: localFile,
        background: true,    // allow download when app is backgrounded
        discretionary: true, // iOS: system decides best time (battery/wifi)
        cacheable: false,    // ✅ always fetch fresh file
      }).promise;

      setLoading(false);

      if (result.statusCode === 200) {
        if (Platform.OS === "android") {
          // ✅ On Android, trigger MediaStore scan so file appears in Downloads app
          await RNFS.scanFile(localFile);
        }

        try {
          await FileViewer.open(localFile, {
            showOpenWithDialog: true,
            mimeType: "application/vnd.ms-excel",
          });
        } catch (viewerError) {
          console.log("FileViewer error:", viewerError);
          // File was downloaded successfully even if no app can open it
          toast.show(
            Platform.OS === "android"
              ? "File saved to Downloads folder."
              : "File downloaded. Open it from your Files app.",
            { placement: "top" }
          );
        }
      } else {
        toast.show(
          `Download failed (status: ${result.statusCode}). Please try again.`,
          { placement: "top" }
        );
      }
    } catch (error) {
      setLoading(false);
      console.log("Download Error:", error);
      toast.show("Download failed. Please try again.", { placement: "top" });
    }
  };

  // ─── Fetch download link from API then trigger download ──────────────────
  const downloadReport = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("distributorId", String(userDetails?.id));
      formData.append("startDate", formatDateForAPI(selectedFromDate));
      formData.append("endDate", formatDateForAPI(selctedToDate));

      const res = await axiosInstance.post(EXPORT_CASH_BATCH_REPORT, formData);

      setLoading(false);

      if (res.data.status !== 200) {
        toast.show(res.data.message, {
          data: { status: 400 },
        });
        return;
      }

      if (res.data?.reportLink) {
        downloadFile(res.data.reportLink);
      } else {
        toast.show("No file available");
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      if (axios.isAxiosError(err)) {
        toast.show(err.response?.data.message, {
          data: err.response,
        });
      }
    }
  };

  return (
    <View className="bg-white flex-1">
      <View className="shadow-sm android:shadow-md bg-white">
        <View className="flex-row items-center justify-around py-4 border-b border-muted">
          <View className="items-center">
            <TouchableOpacity
              className="flex-row items-center gap-2 p-2"
              onPress={() => setShowFromDate(true)}
            >
              <CalendarIcon className="text-primary" height={20} width={20} />
              <Text>{t("login.coupon_history_fromDate")}</Text>
              <Text className="text-lg font-semibold">
                {selectedFromDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {showFromDate && (
              <DateTimePicker
                testID="fromDatePicker"
                value={selectedFromDate}
                mode="date"
                is24Hour={true}
                display="default"
                maximumDate={selctedToDate > today ? today : selctedToDate}
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
              <Text>{t("login.coupon_history_toDate")}</Text>
              <Text className="text-lg font-semibold">
                {selctedToDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {showToDate && (
              <DateTimePicker
                testID="toDatePicker"
                value={selctedToDate}
                mode="date"
                is24Hour={true}
                display="default"
                minimumDate={selectedFromDate}
                maximumDate={today}
                onChange={onToDateChange}
              />
            )}
          </View>
        </View>
      </View>

      {cashBatchReportData?.length > 0 && (
        <View className="justify-end items-center">
          {loading ? (
            <ActivityIndicator size={"large"} />
          ) : (
            <TouchableOpacity
              onPress={downloadReport}
              className="bg-blue-600 p-3 rounded mt-4"
            >
              <Text className="text-white text-center">Download Report</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        contentContainerClassName="p-4"
        data={cashBatchReportData}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <Separator className="" />}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center">
            {isLoadingBatchReport ? (
              <ActivityIndicator size={"small"} />
            ) : (
              <Text className="text-xl font-medium">
                No Data found. Try another date range.
              </Text>
            )}
          </View>
        )}
        ListFooterComponent={() =>
          isLoadingBatchReport && <ActivityIndicator size={"small"} />
        }
      />

      <CustomModal
        title={t("login.couponDetails")}
        visible={showInfoModel}
        onClose={() => setShowInfoModel(false)}
      >
        <View className="bg-white rounded-2xl p-5">
          {/* 🔹 Divider */}
          <View className="h-[1px] bg-gray-200 mb-4" />

          {/* 🔹 Content */}
          {selectedItem ? (
            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-500">{t("login.cnDate")} :</Text>
                <Text className="text-gray-900 font-medium">
                  {selectedItem.credit_note_date
                    ? formatDate(selectedItem.credit_note_date)
                    : "-"}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-500">{t("login.cnNo")} :</Text>
                <Text className="text-gray-900 font-medium">
                  {selectedItem.credit_note_no || "-"}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-500">{t("login.cnValue")} :</Text>
                <Text className="text-gray-900 font-semibold">
                  ₹ {selectedItem.credit_note_value || "0"}
                </Text>
              </View>
            </View>
          ) : (
            <View className="items-center py-6">
              <Text className="text-gray-500">No Details Available</Text>
            </View>
          )}
        </View>
      </CustomModal>
    </View>
  );
};

export default CashBatchScreen;