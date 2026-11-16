import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { FONT_BOLD, FONT_REGULAR } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";

type StateViewProps = {
  message?: string;
};

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function LoadingState({ message = "جارٍ التحميل..." }: StateViewProps) {
  const { colors, fontScale } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={[styles.message, { color: colors.muted, fontSize: 15 * fontScale }]}>
        {message}
      </Text>
    </View>
  );
}

export function EmptyState({ message = "لا توجد عناصر لعرضها." }: StateViewProps) {
  const { colors, fontScale } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.message, { color: colors.muted, fontSize: 16 * fontScale }]}>
        {message}
      </Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { colors, fontScale, isDark } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text
        accessibilityRole="alert"
        style={[styles.errorMessage, { color: colors.danger, fontSize: 15 * fontScale }]}
      >
        {message}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [
          styles.retryButton,
          {
            backgroundColor: colors.primary,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.retryText,
            {
              color: isDark ? colors.background : colors.headerText,
              fontSize: 15 * fontScale,
            },
          ]}
        >
          إعادة المحاولة
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  message: {
    fontFamily: FONT_REGULAR,
    textAlign: "center",
  },
  errorMessage: {
    fontFamily: FONT_REGULAR,
    textAlign: "center",
  },
  retryButton: {
    height: 48,
    minWidth: 150,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    fontFamily: FONT_BOLD,
  },
});
