import { StyleSheet, Text, View } from "react-native";
import React, { memo } from "react";

type Props = {
    title: string;
    amount: string | number;
    chipColor: string;
    showRupee?: boolean;
    textColor?: string;
};

const couponChip = ({
    title,
    amount,
    chipColor,
    showRupee,
    textColor,
}: Props) => {
    return (
        <View
            className="flex-row justify-between p-3 rounded-md"
            style={{ backgroundColor: `${chipColor}` }}
        >
            <Text
                className="font-medium text-[14px]"
                style={{ color: `${textColor ?? ""}` }}
            >
                {title}
            </Text>
            <Text>
                {showRupee && "Rs. "}
                {amount}
            </Text>
        </View>
    );
};

export default memo(couponChip);

const styles = StyleSheet.create({});
