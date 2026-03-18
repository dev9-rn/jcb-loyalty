import useAuth from "@/hooks/useAuth";
import { getRelativeTime } from "@/libs/utils";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";

const { width: deviceWidth } = Dimensions.get("screen");

const MaintenancePage = () => {
  const { maintenanceMsg, fetchisMaintenanceApi } = useAuth();

  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const onRefresh = async () => {
    try {
      setIsLoading(true);
      await fetchisMaintenanceApi();
      setLastRefresh(new Date());
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setLastRefresh(new Date());
  }, []);

//   useEffect(() => {
//   const interval = setInterval(() => {
//     onRefresh();
//   }, 3000);

//   return () => clearInterval(interval);
// }, []);

  console.log(lastRefresh, "lastRefresh");


  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 10, backgroundColor: '#fff' }}>
      <View style={{ justifyContent: "center" }}>
        <Text style={styles.systemStatus}>System status: {maintenanceMsg}</Text>

        <Image
          source={require("@/assets/images/maintenance.jpg")}
          style={styles.image}
          resizeMode="cover"
        />

        <Text style={styles.title}>Under Maintenance</Text>

        <Text style={styles.subText}>
          Temporarily offline for improvements.
        </Text>
        <Text style={styles.subText}>We'll be back soon!</Text>

        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>

        <Text style={styles.lastRefresh}>
          Last Refreshed: {getRelativeTime(lastRefresh)}
        </Text>
      </View>

      {isLoading && <ActivityIndicator size="large" color="#000" />}
    </View>
  );
};

export default MaintenancePage;

const styles = StyleSheet.create({
  systemStatus: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 10,
    color: "red",
    letterSpacing: 1.1,
  },
  image: {
    width: 220,
    height: 220,
    // aspectRatio: 1,
    alignSelf: "center",
    marginVertical: 20,
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    color: "#000",
    fontWeight: "600",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  subText: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 6,
    letterSpacing: 1.1,
  },
  refreshBtn: {
    backgroundColor: "#0096FF",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: "center",
    marginVertical: 15,
  },
  refreshText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1.1,
  },
  lastRefresh: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1.1,
  },
});
