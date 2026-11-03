import '../script_package.dart';

/// यह सर्विस आपके ऐप के चैट और स्क्रिप्ट इंजन को कंट्रोल करती है।
/// अभी यह 100% ऑफलाइन/लोकल रियल मोड में चलती है (कोई API खर्च नहीं)।
/// जब आप अपना ऑनलाइन सर्वर/OpenRouter API जोड़ेंगे, तो सिर्फ `kUseOnlineApi = true` करना होगा।
class AiService {
  static const bool kUseOnlineApi = false;

  /// हर कंपनी के तय किए गए सस्ते (Normal) और प्रो (VIP) मॉडल के नाम
  static const String kNormalChatModel = 'anthropic/claude-haiku-5.5';
  static const String kLightSearchModel = 'perplexity/sonar';
  static const String kDeepSearchModel = 'perplexity/sonar-pro';
  static const String kBlueprintModel = 'google/gemini-3.1-flash-lite';
  static const String kEmotionalScriptModel = 'anthropic/claude-sonnet-5.5';
  static const String kScenePromptModel = 'google/gemini-3.8-flash';

  /// टोकन की सख्त सीमा ताकि कोई भी यूज़र अनलिमिटेड खर्च न कर सके
  static const int kMaxTokensNormalChat = 300; // ~150-200 शब्द
  static const int kMaxTokensShortScript = 1200; // 60-sec Reel/Short
  static const int kMaxTokensLongScript = 4000; // 10-15 min Documentary

  /// 1) यूज़र के मैसेज से अपने-आप इरादा (Intent) पहचानना
  static ScriptIntent detectUserIntent(String message) {
    return ScriptPackage.detectIntent(message);
  }

  /// 2) बताना कि इस मैसेज पर स्क्रिप्ट क्रेडिट कटेगा या नहीं
  static bool requiresScriptCredit(ScriptIntent intent) {
    return intent == ScriptIntent.shortScript ||
        intent == ScriptIntent.longScript;
  }

  /// 3) यूज़र के मैसेज के हिसाब से जवाब या फुल डायरेक्टर स्क्रिप्ट पैकेज तैयार करना
  static Future<AiResponse> processUserMessage({
    required String userMessage,
    required String language,
    required String tone,
    required bool isPaidUser,
  }) async {
    final intent = detectUserIntent(userMessage);

    // अगर सामान्य बातचीत या छोटा सवाल है -> 0 क्रेडिट खर्च
    if (!requiresScriptCredit(intent)) {
      await Future.delayed(const Duration(milliseconds: 650));
      final reply = ScriptPackage.generateChatReply(
        userMessage,
        intent: intent,
        language: language,
        tone: tone,
      );
      return AiResponse(
        intent: intent,
        formattedText: reply,
        scriptPackage: null,
        usedModelSummary: isPaidUser ? kNormalChatModel : 'gemini-flash-free',
      );
    }

    // अगर शॉर्ट या लॉन्ग स्क्रिप्ट मांगी गई है
    final isShort = intent == ScriptIntent.shortScript;
    await Future.delayed(Duration(milliseconds: isShort ? 1200 : 1800));

    final pkg = ScriptPackage.generate(
      rawQuery: userMessage,
      isShort: isShort,
      language: language,
      tone: tone,
    );

    return AiResponse(
      intent: intent,
      formattedText: pkg.toStudioFormattedText(),
      scriptPackage: pkg,
      usedModelSummary: isPaidUser
          ? '$kDeepSearchModel -> $kEmotionalScriptModel -> $kScenePromptModel'
          : 'gemini-3.8-flash-free + groq-free',
    );
  }
}

class AiResponse {
  final ScriptIntent intent;
  final String formattedText;
  final ScriptPackage? scriptPackage;
  final String usedModelSummary;

  const AiResponse({
    required this.intent,
    required this.formattedText,
    required this.scriptPackage,
    required this.usedModelSummary,
  });
}
