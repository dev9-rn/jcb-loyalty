import { ActivityIndicator, Modal, ScrollView, View } from "react-native";
import React, { useState } from "react";
import { Text } from "@/components/ui/text";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { router } from "expo-router";
import RemoveAccountDialog from "@/components/RemoveAccountDialog";
import axiosInstance from "@/utils/axiosInstance";
import { DELETE_USER_ACCOUNT } from "@/utils/routes";
import useUser from "@/hooks/useUser";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";
import i18n from "@/libs/i18n";
import DeletionSuccessDialog from "@/components/DeletionSuccessDialog";
import { useTranslation } from "react-i18next";

type Props = {};

const RemoveAccountScreen = ({ }: Props) => {
    const [isConditionChecked, setIsConditionChecked] = useState<boolean>(false);
    const [showConfirmationMessage, setShowConfirmationMessage] =
        useState<boolean>(false);
    const [confirmationMessage, setConfirmationMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const { userDetails } = useUser();
    const { t } = useTranslation();

    const toast = useToast();

    const handleAccountDeletion = async () => {
        const accountDeletionFormData = new FormData();
        accountDeletionFormData.append("distributorId", userDetails?.id);
        accountDeletionFormData.append("userType", "0");
        accountDeletionFormData.append("language", i18n.language);
        setLoading(true);
        try {
            const response = await axiosInstance.post(
                DELETE_USER_ACCOUNT,
                accountDeletionFormData,
            );

            if (response.data.status != 200) {
                setLoading(false);
                toast.show(response.data.message, {
                    data: response,
                });
                return;
            }

            setShowConfirmationMessage(true);
            setConfirmationMessage(response.data.message);
            setLoading(false);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setLoading(false);
                toast.show(error.response?.data.message, {
                    data: error.response,
                });
            }
        }
    };

    return (
        <ScrollView className="px-4 flex-1 my-4">
            <View className="gap-4 flex-1">
                <Text className="text-center text-xl font-semibold">
                    {t("removeAccount.pageTitle")}
                </Text>

                <View className="gap-2">
                    <Text className="mt-6">{t("removeAccount.dataStoredTitle")}</Text>
                    <View className="ml-5 gap-2">
                        <Text>
                            {"\u2B24"} {t("removeAccount.dataPoints.profileInfo")}
                        </Text>
                        <Text>
                            {"\u2B24"} {t("removeAccount.dataPoints.loginHistory")}
                        </Text>
                        <Text>
                            {"\u2B24"} {t("removeAccount.dataPoints.couponHistory")}
                        </Text>
                    </View>
                </View>

                <Text>{t("removeAccount.dataDeletionNote")}</Text>

                <View className="gap-4">
                    <Text>
                        <Text className="font-semibold">
                            {t("removeAccount.warningTitle")}{" "}
                        </Text>
                        {t("removeAccount.warningText")}
                    </Text>
                    <View className="gap-2">
                        <Text>
                            {"\u274C"} {t("removeAccount.warnings.noReRegister")}
                        </Text>
                        <Text>
                            {"\u274C"} {t("removeAccount.warnings.couponLoss")}
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center gap-2 flex-shrink">
                    <Checkbox
                        checked={isConditionChecked}
                        onCheckedChange={setIsConditionChecked}
                    />
                    <Text>{t("removeAccount.checkboxLabel")}</Text>
                </View>

                <View className="flex-row items-center justify-around mt-auto">
                    {loading ? <ActivityIndicator size={'small'} /> : <RemoveAccountDialog
                        isConditionChecked={isConditionChecked}
                        handleAccountDeletion={handleAccountDeletion}
                    />}
                    <Button onPress={() => router.back()}>
                        <Text>{t("removeAccount.goBack")}</Text>
                    </Button>
                </View>

                {showConfirmationMessage && (
                    <DeletionSuccessDialog
                        showConfirmationMessage={showConfirmationMessage}
                        setShowConfirmationMessage={setShowConfirmationMessage}
                        confirmationMessage={confirmationMessage}
                    />
                )}
            </View>
        </ScrollView>
    );
};

export default RemoveAccountScreen;
