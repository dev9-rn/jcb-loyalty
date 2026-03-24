import { View, StyleSheet, Platform, ActivityIndicator } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { OtpInput } from "react-native-otp-entry";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
  Controller,
  FieldValues,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import useAuth from "@/hooks/useAuth";
import axios, { AxiosResponse } from "axios";
import {
  MECHANIC_LOGIN,
  RETAILER_LOGIN,
  USER_LOGIN,
  VERIFY_MECHANIC,
  VERIFY_OTP,
  VERIFY_RETAILER,
  VERIFY_VALID_RETAILER,
} from "@/utils/routes";
import RetailerApprovalDialog from "@/components/RetailerApprovalDialog";
import useNotification from "@/hooks/useNotification";
import { useTranslation } from "react-i18next";

type Props = {};

type FormData = {
  userOtp: string;
};

const OtpVerificationScreen = ({ }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [approvalDialogContent, setApprovalDialogContent] = useState<
    { status: number; message: string } | undefined
  >(undefined);

  const { verify, login } = useAuth();
  const { expoPushToken } = useNotification();
  const { t } = useTranslation();
  const [time, setTime] = useState("3:00");
  const [btnResendOTPEnabled, setBtnResendOTPEnabled] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null | number>(null);
  const [otpKey, setOtpKey] = useState(0);
  const { userPhone, userType, methodType } = useLocalSearchParams();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm<FormData | FieldValues>({
    defaultValues: {
      userOtp: "",
    },
  });

  const handleUserVerification: SubmitHandler<FormData | FieldValues> = async (formData) => {
    try {
      setIsLoading(true);

      const verifyOtpFormData = new FormData();
      verifyOtpFormData.append("mobileNo", userPhone as string);
      verifyOtpFormData.append("otp", formData.userOtp);
      verifyOtpFormData.append("deviceToken", expoPushToken as string);
      verifyOtpFormData.append("deviceType", Platform.OS);

      const verifyResponse = await verify(
        VERIFY_OTP,
        verifyOtpFormData,
        userType as string
      );

      setIsLoading(false);

      // ✅ check if response exists
      if (!verifyResponse || !verifyResponse.data) {
        setError("userOtp", {
          type: "manual",
          message: "Something went wrong. Please try again.",
        });
        return;
      }

      // ❌ status check
      if (verifyResponse.data.status !== 200) {
        setError("userOtp", {
          type: "manual",
          message: verifyResponse.data.message,
        });
        return;
      }

      // ✅ success case
      console.log("OTP Verified Success", verifyResponse.data);

    } catch (error: any) {
      setIsLoading(false);

      // ✅ axios error handling
      if (axios.isAxiosError(error)) {
        setError("userOtp", {
          type: "manual",
          message: error.response?.data?.message || "Verification failed",
        });
      } else {
        setError("userOtp", {
          type: "manual",
          message: "Unexpected error occurred",
        });
      }
    }
  };

  const handleResendCode = async () => {
    const resendFormData = new FormData();
    resendFormData.append("mobileNo", userPhone as string);

    const loginResponse: AxiosResponse = await login(
      USER_LOGIN,
      resendFormData,
    );

    if (loginResponse.status === 200) {
      reset({ userOtp: "" }); // ✅ clears OTP input
      setOtpKey((prev) => prev + 1);
      startCountdown(); // restart timer
    }

    if (axios.isAxiosError(loginResponse)) {
      setError("userPhone", {
        type: loginResponse.response?.data?.status,
        message: loginResponse.response?.data?.message,
      });
    }

    if (loginResponse.data.status != 200) {
      setError("userPhone", {
        type: loginResponse.data.status,
        message: loginResponse.data.message,
      });
    }
  };

  const startCountdown = () => {
    let minutes = 3;
    let seconds = 0;

    setBtnResendOTPEnabled(false);

    intervalRef.current = setInterval(() => {
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(intervalRef.current!);
          setBtnResendOTPEnabled(true);
          setTime("0:00");
          return;
        }
        minutes--;
        seconds = 59;
      } else {
        seconds--;
      }

      const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
      setTime(`${minutes}:${formattedSeconds}`);
    }, 1000);
  };

  useEffect(() => {
    startCountdown();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 flex-1">
        <Text className="text-3xl font-semibold">Verify your phone number</Text>

        <View className="my-10 gap-4">
          <Text className="text-lg font-medium">
            OTP has been sent to your mobile number, please enter it below.
            {"\n"}
            {/* <Text className='text-primary font-semibold text-lg'>
                            +91 {userPhone}
                        </Text> */}
          </Text>
          <Controller
            control={control}
            name="userOtp"
            render={({ field: { onBlur, onChange, value } }) => (
              <OtpInput
                key={otpKey} // 🔹 important
                numberOfDigits={4}
                focusColor={"#14479c"}
                blurOnFilled={true}
                type="numeric"
                onTextChange={onChange}
                onBlur={onBlur}
                theme={{
                  containerStyle: styles.container,
                  pinCodeContainerStyle: errors.userOtp
                    ? {
                      ...styles.pinCodeContainer,
                      borderColor: "#ef4444",
                      borderWidth: 2,
                    }
                    : styles.pinCodeContainer,
                }}
              />
            )}
          />
          {errors.userOtp && (
            <Text className="text-red-500 font-medium">
              {errors.userOtp.message?.toString()}
            </Text>
          )}
        </View>

        <View className="gap-4">
          <Button onPress={handleSubmit(handleUserVerification)}>
            {isLoading ? (
              <ActivityIndicator size={"small"} color={"#fff"} />
            ) : (
              <Text>Verify</Text>
            )}
          </Button>
          <Button
            variant={"outline"}
            disabled={!btnResendOTPEnabled}
            onPress={handleResendCode}
          >
            <Text>
              {btnResendOTPEnabled
                ? "Resend code via SMS"
                : `Resend OTP in ${time}`}
            </Text>
          </Button>
        </View>

        {/* <RetailerApprovalDialog
                    isApprovalDialogVisible={isApprovalDialogVisible}
                    setIsApprovalDialogVisible={setIsApprovalDialogVisible}
                    approvalDialogContent={approvalDialogContent}
                /> */}
      </View>
    </View>
  );
};

export default OtpVerificationScreen;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  pinCodeContainer: {
    flexGrow: 1,
  },
});
