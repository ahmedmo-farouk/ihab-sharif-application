import * as Linking from "expo-linking";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

import { EmptyState } from "@/components/StateViews";
import { FONT_BOLD, FONT_REGULAR } from "@/constants/fonts";
import audioLinks from "@/data/audioLinks.json";
import { useTheme } from "@/hooks/useTheme";

type AudioLink = (typeof audioLinks)[number];

export default function IbnAlhaythamScreen() {
  const { colors, fontScale } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  const series = useMemo(() => {
    const groups = new Map<string, Map<string, AudioLink>>();

    for (const item of audioLinks) {
      const lessons =
        groups.get(item.seriesName) ?? new Map<string, AudioLink>();
      if (!lessons.has(item.url)) lessons.set(item.url, item);
      groups.set(item.seriesName, lessons);
    }

    return [...groups.entries()]
      .map(([name, lessons]) => ({ name, lessons: [...lessons.values()] }))
      .sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredSeries = useMemo(
    () =>
      series.filter((item) =>
        item.name.toLocaleLowerCase().includes(normalizedQuery),
      ),
    [normalizedQuery, series],
  );
  const filteredSeriesLessonCount = useMemo(
    () =>
      filteredSeries.reduce((count, item) => count + item.lessons.length, 0),
    [filteredSeries],
  );
  const currentSeries = series.find((item) => item.name === selectedSeries);
  const filteredLessons = useMemo(
    () =>
      (currentSeries?.lessons ?? []).filter((item) =>
        item.lessonName.toLocaleLowerCase().includes(normalizedQuery),
      ),
    [currentSeries, normalizedQuery],
  );

  const openAudio = (url: string) => {
    setOpenError(null);
    if (!/^https:\/\//i.test(url)) {
      setOpenError("تم إيقاف هذا الرابط لأنه لا يستخدم اتصالًا آمنًا (HTTPS).");
      return;
    }

    void Linking.openURL(url).catch(() => {
      setOpenError(
        "تعذر فتح الرابط الصوتي. تحقق من اتصال الإنترنت وحاول مرة أخرى.",
      );
    });
  };

  const searchInput = (
    <TextInput
      accessibilityLabel={
        selectedSeries ? "ابحث في دروس السلسلة" : "ابحث باسم السلسلة"
      }
      value={query}
      onChangeText={setQuery}
      placeholder={
        selectedSeries ? "ابحث في دروس السلسلة..." : "ابحث باسم السلسلة..."
      }
      placeholderTextColor={colors.muted}
      returnKeyType="search"
      style={{
        minHeight: 50,
        marginBottom: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        backgroundColor: colors.inputBg,
        color: colors.text,
        fontFamily: FONT_REGULAR,
        fontSize: 15 * fontScale,
      }}
    />
  );

  const header = (
    <View style={{ paddingBottom: 8 }}>
      <Text
        style={{
          color: colors.text,
          fontFamily: FONT_BOLD,
          fontSize: 20 * fontScale,
          marginBottom: 4,
        }}
      >
        {selectedSeries ? "دروس السلسلة" : "السلاسل الصوتية"}
      </Text>
      {selectedSeries && currentSeries ? (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setSelectedSeries(null);
              setQuery("");
              setOpenError(null);
            }}
            hitSlop={8}
            style={{ alignSelf: "flex-start", paddingVertical: 8 }}
          >
            <Text
              style={{
                color: colors.primary,
                fontFamily: FONT_BOLD,
                fontSize: 14 * fontScale,
              }}
            >
              ‹ كل السلاسل
            </Text>
          </Pressable>
          <Text
            style={{
              color: colors.primary,
              fontFamily: FONT_BOLD,
              fontSize: 17 * fontScale,
              marginBottom: 4,
            }}
          >
            {currentSeries.name}
          </Text>

          <Text
            style={{
              color: colors.muted,
              fontFamily: FONT_REGULAR,
              fontSize: 14 * fontScale,
              marginBottom: 12,
            }}
          >
            المعروض: {filteredLessons.length} درس صوتي · سلسلة واحدة من أصل{" "}
            {series.length} سلسلة{" "}
            {query ? `(من إجمالي ${currentSeries.lessons.length})` : ""}
          </Text>
        </>
      ) : (
        <>
          <Text
            style={{
              color: colors.muted,
              fontFamily: FONT_REGULAR,
              fontSize: 14 * fontScale,
            }}
          >
            اختر سلسلة لعرض دروسها فقط
          </Text>
          <Text
            style={{
              color: colors.muted,
              fontFamily: FONT_REGULAR,
              fontSize: 14 * fontScale,
              marginBottom: 14,
            }}
          >
            المعروض: {filteredSeries.length} سلسلة · {filteredSeriesLessonCount}{" "}
            درس صوتي
            {query ? " (مطابقة للبحث)" : ""}
          </Text>
        </>
      )}
      {searchInput}
      {openError ? (
        <Text
          accessibilityRole="alert"
          style={{
            color: colors.danger,
            fontFamily: FONT_REGULAR,
            fontSize: 14 * fontScale,
            marginBottom: 12,
          }}
        >
          {openError}
        </Text>
      ) : null}
    </View>
  );

  if (!selectedSeries) {
    return (
      <FlatList
        data={filteredSeries}
        keyExtractor={(item) => item.name}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={7}
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          backgroundColor: colors.background,
        }}
        style={{ backgroundColor: colors.background }}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyState message="لا توجد سلاسل مطابقة." />}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.name}، ${item.lessons.length} درس صوتي`}
            onPress={() => {
              setSelectedSeries(item.name);
              setQuery("");
            }}
            style={({ pressed }) => ({
              minHeight: 72,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 10,
              padding: 14,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              backgroundColor: colors.card,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text
              style={{
                flex: 1,
                color: colors.text,
                fontFamily: FONT_BOLD,
                fontSize: 15 * fontScale,
              }}
            >
              {item.name}
            </Text>
            <Text
              style={{
                color: colors.primary,
                fontFamily: FONT_REGULAR,
                fontSize: 13 * fontScale,
              }}
            >
              {item.lessons.length} درس
            </Text>
          </Pressable>
        )}
      />
    );
  }

  return (
    <FlatList
      data={filteredLessons}
      keyExtractor={(item) => item.url}
      keyboardShouldPersistTaps="handled"
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={7}
      contentContainerStyle={{
        flexGrow: 1,
        padding: 16,
        backgroundColor: colors.background,
      }}
      style={{ backgroundColor: colors.background }}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <EmptyState message="لا توجد دروس مطابقة في هذه السلسلة." />
      }
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`استمع إلى ${item.lessonName}`}
          onPress={() => openAudio(item.url)}
          style={({ pressed }) => ({
            minHeight: 76,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 10,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            backgroundColor: colors.card,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text
            style={{
              flex: 1,
              color: colors.text,
              fontFamily: FONT_REGULAR,
              fontSize: 15 * fontScale,
            }}
          >
            {item.lessonName}
          </Text>
          <Text
            style={{
              color: colors.primary,
              fontFamily: FONT_BOLD,
              fontSize: 14 * fontScale,
            }}
          >
            استمع
          </Text>
        </Pressable>
      )}
    />
  );
}
