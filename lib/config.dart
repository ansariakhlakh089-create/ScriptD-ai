/// ScriptD AI — केंद्रीय कॉन्फ़िगरेशन फ़ाइल (Central Config)
/// यदि आपके प्रोजेक्ट में `lib/config.dart` फ़ाइल है, तो इसे वहाँ रख सकते हैं।
class AppConfig {
  static const String appName = 'ScriptD AI';
  static const String appTagline = 'Your Content Creation Journey';
  static const String appVersion = '1.0.0';

  /// अभी लोकल रियल मोड चालू है (true करने पर ऑनलाइन API इस्तेमाल होगी)
  static const bool useOnlineApi = false;

  /// भविष्य में ऑनलाइन API जोड़ने के लिए एंडपॉइंट (OpenRouter / Custom Backend)
  static const String apiBaseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  /// फ्री प्लान और टॉप-अप की डिफ़ॉल्ट सीमाएँ
  static const int defaultFreeScripts = 2;
  static const int shortPackScripts = 5; // Rs 19 pack
  static const int longPackScripts = 2; // Rs 49 pack
}
