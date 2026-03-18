import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { TriangleAlert } from "@/libs/icons/TriangleAlert";

type CustomModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  preventCloseOnOutsidePress?: boolean;
  showIcon?: boolean;
};

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  showIcon,
  children,
  preventCloseOnOutsidePress = false,
}) => {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            
            {/* Header */}
            <View style={styles.header}>
              
              {/* Left side (icon + title) */}
              <View style={styles.headerLeft}>
                {showIcon && <TriangleAlert style={styles.icon} />}
                {title && <Text style={styles.title}>{title}</Text>}
              </View>

              {/* Close button */}
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>

            </View>

            {/* Body */}
            <View>{children}</View>

          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "85%",
    elevation: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  icon: {
    marginRight: 8,
    color: "#856404"
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flexShrink: 1,
  },

  closeButton: {
    fontSize: 22,
    color: "#000",
    paddingLeft: 10,
  },
});