# مكتبة فيديوهات القناة

تطبيق Expo عربي لعرض فيديوهات قناة YouTube، تصفح قوائم التشغيل والبحث محليًا، مع حفظ المفضلة وتقدم المشاهدة على الجهاز. يتضمن أيضًا صفحة «ابن الهيثم» للبحث في روابط الدروس الصوتية.

## الإعداد

```bash
npm install
npx expo install @expo-google-fonts/cairo
```

أنشئ ملف `.env` في جذر المشروع وضع مفتاح YouTube Data API v3 فيه:

```env
EXPO_PUBLIC_YT_KEY=your_youtube_data_api_key
```

ملف `.env` مستثنى من Git. لا تضع المفتاح في الشيفرة أو تشاركه؛ مفتاح `EXPO_PUBLIC_` مضمن في تطبيق العميل، لذا قيّده في Google Cloud Console بتطبيقك وحصة YouTube Data API.

## التشغيل

```bash
npx expo start -c
```

افتح التطبيق باستخدام Expo Go على جهاز iOS أو Android. بعد تفعيل RTL لأول مرة، أعد تشغيل Expo Go إذا لم يتغير اتجاه الواجهة فورًا.

## تحديث روابط الدروس الصوتية

بعد تحديث `lectures.csv`، أعد بناء بيانات صفحة «ابن الهيثم» بالأمر:

```bash
npm run build:audio-catalog
```

يتحقق الأمر من أن جميع روابط MP3 تستخدم HTTPS، ويتوقف قبل تحديث الكتالوج إذا وجد روابط غير آمنة. حدّث روابط المصدر إلى عناوين HTTPS مؤكدة يدويًا؛ لا يحوّلها الأمر تلقائيًا.
# ihab-sharif-application
