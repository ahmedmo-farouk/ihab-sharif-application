import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { FONT_BOLD } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";

export default function BrandHeader() {
  const { colors } = useTheme();

  return (
    <View accessibilityLabel="الشيخ إيهاب الشريف" style={styles.container}>
      <Image
        source={require("../../assets/images/logoApplications.jpeg")}
        contentFit="cover"
        style={styles.portrait}
        accessibilityLabel="صورة الشيخ إيهاب الشريف"
      />
      <Text
        numberOfLines={1}
        style={[styles.name, { color: colors.headerText }]}
      >
        الشيخ إيهاب الشريف
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 220,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 8,
  },
  portrait: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  name: {
    fontFamily: FONT_BOLD,
    fontSize: 17,
  },
});
