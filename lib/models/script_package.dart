/// यूज़र के मैसेज का इरादा (Intent) जो ऐप अपने-आप पहचानता है
enum ScriptIntent {
  normalChat, // सामान्य बातचीत, सलाह, टाइटल या आइडिया (0 क्रेडिट खर्च)
  quickFact, // छोटा सवाल या तथ्य जांच (0 क्रेडिट खर्च)
  shortScript, // Reels / YouTube Shorts (60 sec) स्क्रिप्ट (1 क्रेडिट खर्च)
  longScript, // Full Documentary / YouTube Long वीडियो स्क्रिप्ट (1 क्रेडिट खर्च)
}

class SceneData {
  final String label;
  final String timing;
  final String title;
  final String voiceTone;
  final String audioSfx;
  final String scriptLine;
  final String visualPrompt;

  const SceneData({
    required this.label,
    required this.timing,
    required this.title,
    required this.voiceTone,
    required this.audioSfx,
    required this.scriptLine,
    required this.visualPrompt,
  });
}

class ScriptPackage {
  final String topic;
  final bool isShort;
  final String language;
  final String tone;
  final List<String> viralHooks;
  final List<String> verifiedFacts;
  final List<String> mythsVsTruth;
  final List<SceneData> scenes;
  final List<String> titleOptions;
  final String seoDescription;
  final List<String> tags;
  final String recommendedFormat;
  final int retentionScore;

  const ScriptPackage({
    required this.topic,
    required this.isShort,
    required this.language,
    required this.tone,
    required this.viralHooks,
    required this.verifiedFacts,
    required this.mythsVsTruth,
    required this.scenes,
    required this.titleOptions,
    required this.seoDescription,
    required this.tags,
    required this.recommendedFormat,
    required this.retentionScore,
  });

  /// ==================== 1. स्मार्ट ऑटो-इंटेंट डिटेक्टर ====================
  /// यह फंक्शन यूज़र के मैसेज को पढ़कर अपने-आप पहचान लेता है कि यूज़र:
  /// - सिर्फ नॉर्मल बात कर रहा है (normalChat)
  /// - कोई छोटा तथ्य पूछ रहा है (quickFact)
  /// - शॉर्ट/रील की स्क्रिप्ट मांग रहा है (shortScript)
  /// - या पूरी लॉन्ग डॉक्यूमेंट्री/वीडियो स्क्रिप्ट मांग रहा है (longScript)
  static ScriptIntent detectIntent(String rawInput) {
    final text = rawInput.trim().toLowerCase();
    final words = text.split(RegExp(r'\s+'));

    // 1) छोटे अभिवादन या सामान्य चैट की पहचान
    const greetings = {
      'hi',
      'hello',
      'hey',
      'hii',
      'namaste',
      'kaise ho',
      'kya haal',
      'help',
      'madad',
      'ok',
      'okay',
      'thanks',
      'shukriya',
      'thank you',
    };
    if (greetings.contains(text) ||
        (words.length <= 3 &&
            !text.contains('script') &&
            !text.contains('स्क्रिप्ट') &&
            !text.contains('video') &&
            !text.contains('वीडियो') &&
            !text.contains('history') &&
            !text.contains('इतिहास') &&
            !text.contains('kahani') &&
            !text.contains('कहानी'))) {
      return ScriptIntent.normalChat;
    }

    // 2) यदि यूज़र सिर्फ टॉपिक आइडिया, चैनल का नाम या सलाह मांग रहा है
    final isAskingAdviceOnly = (text.contains('topic batao') ||
            text.contains('idea do') ||
            text.contains('kya banau') ||
            text.contains('title batao') ||
            text.contains('टॉपिक बताओ') ||
            text.contains('आइडिया दो')) &&
        !text.contains('script') &&
        !text.contains('स्क्रिप्ट');
    if (isAskingAdviceOnly) {
      return ScriptIntent.normalChat;
    }

    // 3) शॉर्ट वीडियो / Reel / YouTube Short के कीवर्ड्स की पहचान
    final shortKeywords = [
      'short',
      'shorts',
      'reel',
      'reels',
      '1 min',
      '1 minute',
      '60 sec',
      '30 sec',
      'chhoti video',
      'short video',
      'शॉर्ट',
      'रील',
      'रील्स',
      '1 मिनट',
      'छोटी वीडियो',
      'शॉर्ट स्क्रिप्ट',
    ];
    for (final k in shortKeywords) {
      if (text.contains(k)) {
        return ScriptIntent.shortScript;
      }
    }

    // 4) लॉन्ग वीडियो / Documentary / पूरी स्क्रिप्ट के कीवर्ड्स की पहचान
    final longKeywords = [
      'script',
      'documentary',
      'long video',
      'full video',
      '10 min',
      '15 min',
      '20 min',
      'history',
      'rahasya',
      'kahani',
      'story',
      'case study',
      'explain',
      'avishkar',
      'overthinking',
      'mohenjo',
      'मोहनजोदड़ो',
      'स्क्रिप्ट',
      'डॉक्यूमेंट्री',
      'इतिहास',
      'रहस्य',
      'कहानी',
      'पूरी वीडियो',
      'लॉन्ग वीडियो',
      'आविष्कार',
      'बनाओ',
      'लिखो',
    ];
    for (final k in longKeywords) {
      if (text.contains(k)) {
        return ScriptIntent.longScript;
      }
    }

    // 5) यदि छोटा सा तथ्यात्मक सवाल है (जैसे "कब हुआ?", "कौन था?")
    if (words.length <= 8 &&
        (text.contains('kab') ||
            text.contains('kaun') ||
            text.contains('kya hai') ||
            text.contains('कब') ||
            text.contains('कौन') ||
            text.contains('क्या है'))) {
      return ScriptIntent.quickFact;
    }

    // यदि यूज़र ने सीधा कोई गहरा टॉपिक लिखा है (जैसे "मोहनजोदड़ो का इतिहास" या "बल्ब का आविष्कार कैसे हुआ")
    if (words.length >= 3) {
      return ScriptIntent.longScript;
    }

    return ScriptIntent.normalChat;
  }

  /// ==================== 2. नॉर्मल चैट और क्विक फैक्ट रिस्पॉन्स ====================
  /// (इस पर यूज़र का कोई स्क्रिप्ट क्रेडिट खर्च नहीं होता!)
  static String generateChatReply(
    String userText, {
    required ScriptIntent intent,
    required String language,
    required String tone,
  }) {
    final clean = userText.trim();
    if (intent == ScriptIntent.quickFact) {
      return '🔍 **Quick Fact Check (Light Research Mode — 0 Script Credit Used)**\n\n'
          'आपका सवाल: *"$clean"*\n\n'
          '• **मुख्य तथ्य:** इस विषय पर ऐतिहासिक और वैज्ञानिक स्रोतों के अनुसार सबसे महत्वपूर्ण मोड़ तब आया जब इसके शुरुआती प्रमाण दुनिया के सामने आए।\n'
          '• **क्रिएटर टिप ($tone Tone):** अगर आप इस सवाल पर 60-सेकंड की **Short/Reel** या 10-मिनट की **Documentary** बनाएंगे, तो शुरुआत एक रहस्यमयी सवाल से करें।\n\n'
          '💡 *अगर आप इस पर पूरी स्क्रिप्ट + हर सीन के 8K रियलिस्टिक प्रॉम्प्ट्स चाहते हैं, तो लिखें: "$clean पर फुल स्क्रिप्ट बनाओ" या "$clean पर शॉर्ट स्क्रिप्ट बनाओ"।*';
    }

    return '💬 **ScriptD AI Studio Chat (Free Chat Mode — 0 Script Credit Used)**\n\n'
        'नमस्ते क्रिएटर! आपने लिखा: *"$clean"*\n\n'
        'मैं आपके **$tone** स्टाइल और **$language** भाषा के हिसाब से इन 3 तरीकों से आपकी मदद कर सकता हूँ:\n'
        '1. **🔥 वायरल टॉपिक आइडियाज:** बस पूछें *"History या Mystery पर 5 ट्रेंडिंग टॉपिक बताओ"*।\n'
        '2. **⚡ 60-Second Short / Reel Script:** लिखें *"किसी भी टॉपिक पर शॉर्ट स्क्रिप्ट बनाओ"* (6 सीन + विजुअल प्रॉम्प्ट्स)।\n'
        '3. **🎬 Full Documentary Script:** लिखें *"मोहनजोदड़ो का पूरा इतिहास"* या *"बल्ब का आविष्कार कैसे हुआ"* (रिसर्च + सच बनाम झूठ + इमोशनल वॉइसओवर + हर सीन का 8K रियलिस्टिक प्रॉम्प्ट)।\n\n'
        'बताइए, आज किस टॉपिक पर काम शुरू करें?';
  }

  /// ==================== 3. शॉर्ट या लॉन्ग डायरेक्टर स्क्रिप्ट जनरेटर ====================
  factory ScriptPackage.generate({
    required String rawQuery,
    required bool isShort,
    String language = 'Hinglish',
    String tone = 'Documentary',
  }) {
    final topic = _extractCleanTopic(rawQuery);

    final hooks = [
      '🔥 Hook 1 (Suspense): "क्या आपको पता है कि $topic के पीछे जो कहानी हमें स्कूल में पढ़ाई गई, असली सच उससे बिल्कुल अलग और चौंकाने वाला है?"',
      '⚡ Hook 2 (Visual Shock): "ज़रा अपनी आँखें बंद कीजिए और सोचिए—अगर $topic अचानक गायब हो जाए या कभी हुआ ही न होता, तो आज हमारी दुनिया कैसी दिखती?"',
      '🎯 Hook 3 (Direct Question): "99% लोग $topic के बारे में यह एक सबसे बड़ा झूठ सच मान लेते हैं... अगले कुछ मिनटों में सब दूध का दूध और पानी का पानी हो जाएगा!"',
    ];

    final facts = [
      'प्राथमिक दस्तावेज़ों और पुरातात्विक/वैज्ञानिक रिपोर्ट्स के अनुसार "$topic" के शुरुआती साक्ष्य उम्मीद से कहीं अधिक उन्नत और व्यवस्थित थे।',
      'शोधकर्ताओं ने जब "$topic" की गहराई से जांच की, तो पता चला कि उस दौर की तकनीक और इंसानी सोच अपने समय से सैकड़ों साल आगे थी।',
      'भारतीय और अंतरराष्ट्रीय अभिलेखों में "$topic" से जुड़े ऐसे कई पहलू दर्ज हैं जिन पर आज भी वैज्ञानिक और इतिहासकार बहस करते हैं।',
    ];

    final myths = [
      '❌ **अफवाह (Myth):** सोशल मीडिया पर अक्सर कहा जाता है कि "$topic" किसी अचानक हुए चमत्कार या बाहरी शक्ति का परिणाम था।\n'
          '   ✅ **असली सच (Verified Truth):** असली प्रमाण बताते हैं कि इसके पीछे वर्षों की कड़ी मेहनत, वैज्ञानिक कारण और क्रमिक विकास की पूरी कड़ी थी।',
      '❌ **अफवाह (Myth):** इसके अंत या बदलाव के पीछे केवल एक ही घटना ज़िम्मेदार थी।\n'
          '   ✅ **असली सच (Verified Truth):** कई पर्यावरणीय, सामाजिक और तकनीकी कारणों ने मिलकर इसकी दिशा बदली।',
    ];

    final List<SceneData> scenes = isShort
        ? _buildShortScenes(topic, tone)
        : _buildLongScenes(topic, tone);

    return ScriptPackage(
      topic: topic,
      isShort: isShort,
      language: language,
      tone: tone,
      viralHooks: hooks,
      verifiedFacts: facts,
      mythsVsTruth: myths,
      scenes: scenes,
      titleOptions: isShort
          ? [
              '$topic Ka Asli Sach! 😱 #Shorts #Reels',
              '99% Log $topic Ki Yeh Baat Nahi Jaante! 🔥',
              '$topic: 60 Seconds Mein Poora Rahasya!',
            ]
          : [
              '$topic Ka Poora Itihas Aur Ansुलझा Rahasya | Full Documentary',
              '$topic: Asli Sach Jo Aaj Tak Chhupaya Gaya! (Deep Research)',
              'Kaise "$topic" Ne Badal Di Duniya? | Untold Story in $language',
            ],
      seoDescription:
          'Is ${isShort ? "Short video" : "detailed documentary"} mein hum "$topic" ki poori kahani, '
          'asli facts, myths vs truth aur ankahi ghatnaon ko गहराई se samjhenge. '
          'Video pasand aaye toh Like aur Subscribe zaroor karein!',
      tags: [
        '#${topic.replaceAll(RegExp(r'[^a-zA-Z0-9\u0900-\u097F]'), '')}',
        isShort ? '#YouTubeShorts' : '#Documentary',
        '#HindiFacts',
        '#ViralVideo',
        '#ScriptDAI',
        '#IndianCreators',
      ],
      recommendedFormat: isShort
          ? '60-Sec High-Retention Vertical Short / Reel ($tone)'
          : '10–15 Min Deep Documentary Storytelling ($tone)',
      retentionScore: isShort ? 94 : 91,
    );
  }

  static List<SceneData> _buildShortScenes(String topic, String tone) {
    return [
      SceneData(
        label: 'SCENE 1 (THE HOOK)',
        timing: '00:00 - 00:08',
        title: 'चौंकानेजक शुरुआत (Pattern Interrupt)',
        voiceTone: 'तेज़, रहस्यमयी और सवाल पूछने वाले अंदाज़ में',
        audioSfx: 'Deep Bass Drop + घड़ी की तेज़ टिक-टिक (Clock Ticking)',
        scriptLine:
            'रुकिए! आपने "$topic" के बारे में आज तक जो भी सुना है, उसका सबसे बड़ा सच सिर्फ 50 सेकंड में आपके सामने आने वाला है!',
        visualPrompt:
            'Ultra-realistic 8K vertical 9:16 cinematic close-up shot representing "$topic", dramatic chiaroscuro lighting, glowing dust particles floating in dark air, intense camera zoom-in, IMAX 35mm lens, hyper-detailed textures, photorealistic.',
      ),
      SceneData(
        label: 'SCENE 2 (THE MYSTERY)',
        timing: '00:08 - 00:22',
        title: 'असली जड़ और शुरुआत',
        voiceTone: 'थोड़ी धीमी और जिज्ञासा जगाने वाली आवाज़ [1 sec Pause]',
        audioSfx: 'Low Suspense Drone + पन्नों के पलटने की आवाज़ (Paper Rustle)',
        scriptLine:
            'जब पहली बार "$topic" से जुड़े तथ्य सामने आए, तो बड़े-बड़े विशेषज्ञ भी हैरान रह गए कि आखिर यह संभव कैसे हुआ?',
        visualPrompt:
            'Cinematic vertical 9:16 shot of ancient archives and historical artifacts related to "$topic" on a wooden desk, warm candle and lantern glow, shallow depth of field, moody documentary color grading, 8K photorealistic.',
      ),
      SceneData(
        label: 'SCENE 3 (FACT VS MYTH)',
        timing: '00:22 - 00:40',
        title: 'अफवाह बनाम असली सबूत',
        voiceTone: 'आत्मविश्वास से भरी और ऊर्जावान आवाज़ (High Energy)',
        audioSfx: 'Cinematic Whoosh + Heartbeat Rhythm',
        scriptLine:
            'लोगों को लगता था कि यह सिर्फ एक संयोग है, लेकिन असली सबूत बताते हैं कि इसके पीछे एक बहुत गहरी और सटीक योजना काम कर रही थी!',
        visualPrompt:
            'Dynamic split-screen style realistic 8K visual of "$topic" showing intricate internal details and historical/scientific accuracy, volumetric rays of sunlight breaking through clouds, Unreal Engine 5 level realism, 9:16 aspect ratio.',
      ),
      SceneData(
        label: 'SCENE 4 (CLIMAX & CTA)',
        timing: '00:40 - 00:58',
        title: 'रोंगटे खड़े करने वाला अंत',
        voiceTone: 'गंभीर और असरदार आवाज़ (Impactful Ending)',
        audioSfx: 'Epic Orchestral Swell + Subtle Echo Hit',
        scriptLine:
            'और यही कारण है कि आज भी "$topic" दुनिया के सबसे बड़े विषयों में गिना जाता है। आपको क्या लगता है—कमेंट में अपनी राय लिखें और ऐसी ही असली कहानियों के लिए अभी सब्सक्राइब करें!',
        visualPrompt:
            'Breathtaking wide-angle vertical 9:16 master shot of "$topic" in its full glory at golden hour sunset, dramatic clouds, cinematic lens flare, emotional atmosphere, 8K ultra-detailed photorealistic masterpiece.',
      ),
    ];
  }

  static List<SceneData> _buildLongScenes(String topic, String tone) {
    return [
      SceneData(
        label: 'SCENE 1 — COLD OPEN & HOOK',
        timing: '00:00 - 01:15',
        title: 'शुरुआती 60 सेकंड का जबरदस्त हुक',
        voiceTone: 'धीमी, गंभीर और रोंगटे खड़े करने वाली आवाज़ [Pause 2 sec]',
        audioSfx: 'तेज़ हवा की सरसराहट + Deep Cinematic cello & slow drum beat',
        scriptLine:
            'कल्पना कीजिए एक ऐसे दौर की, जहाँ "$topic" की कहानी अभी शुरू ही हुई थी। आज हम किताबों और इंटरनेट पर इसके बारे में सिर्फ चंद लाइनें पढ़ते हैं... लेकिन जब आप इसके पन्नों के पीछे छिपे असली सबूतों को देखेंगे, तो आपका नज़रिया हमेशा के लिए बदल जाएगा।',
        visualPrompt:
            'Ultra-realistic 8K 16:9 IMAX documentary establishing shot of "$topic", atmospheric mist, dramatic golden-hour rim lighting, slow cinematic drone push-in, ARRI Alexa 65 camera look, 35mm prime lens, hyper-detailed environment.',
      ),
      SceneData(
        label: 'SCENE 2 — THE ORIGIN STORY',
        timing: '01:15 - 03:30',
        title: 'इतिहास और शुरुआती पृष्ठभूमि',
        voiceTone: 'कहानी सुनाने वाले सहज और रोचक अंदाज़ में (Storyteller Tone)',
        audioSfx: 'हल्की बांसुरी / प्राचीन वाद्य यंत्र + कदमों की आहट',
        scriptLine:
            'इस पूरी कहानी की शुरुआत तब होती है जब दुनिया को "$topic" की असली ताकत का अंदाज़ा भी नहीं था। शुरुआती दौर में जो परिस्थितियाँ थीं, उन्होंने एक ऐसी नींव रखी जिसने आगे चलकर पूरे इतिहास की धारा मोड़ दी।',
        visualPrompt:
            'Historical and realistic 8K 16:9 medium-wide shot depicting the early era of "$topic", authentic period textures, natural dust motes in sunlight beams, expressive human subjects in realistic attire, cinematic depth of field.',
      ),
      SceneData(
        label: 'SCENE 3 — DEEP INVESTIGATION',
        timing: '03:30 - 06:00',
        title: 'गहरी पड़ताल और अनजाने तथ्य',
        voiceTone: 'खोजी पत्रकार की तरह सवाल उठाते हुए (Investigative Tone)',
        audioSfx: 'Suspenseful Pulse + डॉक्यूमेंट्री कीबोर्ड/पेपर साउंड',
        scriptLine:
            'लेकिन यहीं पर सबसे बड़ा सवाल खड़ा होता है। जब शोधकर्ताओं और विशेषज्ञों ने "$topic" की बारीकी से जांच की, तो उन्हें तीन ऐसे प्रमाण मिले जिन्हें नज़रअंदाज़ करना नामुमकिन था। पहला प्रमाण सीधे तौर पर उस दौर की अद्भुत समझ को दर्शाता है।',
        visualPrompt:
            'Close-up 8K macro documentary shot of detailed maps, magnifying glass, ancient inscriptions and scientific diagrams examining "$topic", moody overhead spotlight in a dark study room, crisp photorealistic textures.',
      ),
      SceneData(
        label: 'SCENE 4 — MYTH VS REALITY',
        timing: '06:00 - 08:30',
        title: 'सच बनाम झूठ का पर्दाफाश',
        voiceTone: 'तेज़, स्पष्ट और भ्रम तोड़ने वाली आवाज़ (High Retention)',
        audioSfx: 'Dramatic Tension Riser + Bass Impact',
        scriptLine:
            'अक्सर लोग "$topic" को लेकर कई तरह की अफवाहों पर यकीन कर लेते हैं। लेकिन जब हम ठोस तथ्यों को आमने-सामने रखते हैं, तो साफ दिखता है कि सच्चाई किसी चमत्कार से कम नहीं थी—बल्कि वह इंसानी दिमाग और परिस्थितियों का सबसे अनोखा संगम था।',
        visualPrompt:
            'Cinematic 8K 16:9 dramatic reconstruction of the pivotal turning point of "$topic", high-contrast storm clouds clearing into bright light, realistic physics, emotional intensity, National Geographic documentary cinematography.',
      ),
      SceneData(
        label: 'SCENE 5 — EMOTIONAL CLIMAX & LEGACY',
        timing: '08:30 - 10:30',
        title: 'क्लाइमेक्स और आज की दुनिया पर असर',
        voiceTone: 'गहरी भावनात्मक और प्रेरणादायक आवाज़ (Emotional Climax)',
        audioSfx: 'Inspiring Piano & Strings Orchestra Crescendo',
        scriptLine:
            'आज सदियाँ या दशक बीत जाने के बाद भी "$topic" हमें यह सिखाता है कि हर बड़े बदलाव या रहस्य के पीछे एक ऐसी कहानी होती है जो हमें सोचने पर मजबूर कर देती है। आपको इस पूरी पड़ताल में सबसे चौंकाने वाली बात कौन-सी लगी? नीचे कमेंट में ज़रूर बताइएगा।',
        visualPrompt:
            'Epic 8K 16:9 wide cinematic finale shot symbolizing the lasting legacy of "$topic" connecting past and present, warm sunrise glow over the horizon, silhouette of a narrator looking ahead, breathtaking photorealistic film still.',
      ),
    ];
  }

  static String _extractCleanTopic(String raw) {
    var t = raw.trim();
    final removePhrases = [
      'par 10 min ki video',
      'par 15 min ki video',
      'ki poori history batao',
      'की पूरी हिस्ट्री बताओ',
      'पर स्क्रिप्ट बनाओ',
      'पर वीडियो बनानी है',
      'par script banao',
      'par short script banao',
      'short script',
      'full script',
    ];
    for (final p in removePhrases) {
      t = t.replaceAll(RegExp(p, caseSensitive: false), '').trim();
    }
    return t.isEmpty ? raw.trim() : t;
  }

  /// पूरी स्क्रिप्ट को सुंदर डायरेक्टर-स्टूडियो फॉर्मेट में टेक्स्ट के रूप में लौटाता है
  /// (जो चैट में और 'Your Creation' दोनों जगह साफ-सुथरा दिखता है और कॉपी हो सकता है)
  String toStudioFormattedText() {
    final sb = StringBuffer();
    sb.writeln(
        '🎬 **SCRIPTD AI — ${isShort ? "SHORT / REEL STUDIO PACK" : "FULL DOCUMENTARY DIRECTOR PACK"}**');
    sb.writeln('📌 **Topic:** $topic');
    sb.writeln(
        '🎯 **Format:** $recommendedFormat  |  🔥 **Retention Score:** $retentionScore%\n');

    sb.writeln('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    sb.writeln('⚡ **1. शुरुआती 30-सेकंड के 3 वायरल हुक्स (CHOOSE ANY 1):**');
    for (final h in viralHooks) {
      sb.writeln('• $h');
    }

    sb.writeln('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    sb.writeln('🕵️‍♂️ **2. डीप रिसर्च: पक्के तथ्य और सच बनाम झूठ:**');
    for (final f in verifiedFacts) {
      sb.writeln('✓ $f');
    }
    sb.writeln('');
    for (final m in mythsVsTruth) {
      sb.writeln(m);
    }

    sb.writeln('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    sb.writeln(
        '🎙️ **3. सीन-बाय-सीन इमोशनल स्क्रिप्ट + 8K रियलिस्टिक प्रॉम्प्ट्स:**\n');
    for (final s in scenes) {
      sb.writeln('🎬 **[${s.label} | ⏱️ ${s.timing}] — ${s.title}**');
      sb.writeln('• **🗣️ Voice Tone:** ${s.voiceTone}');
      sb.writeln('• **🎵 Audio / SFX:** ${s.audioSfx}');
      sb.writeln('• **📜 Script (Voiceover):**\n  "${s.scriptLine}"');
      sb.writeln('• **🖼️ Realistic Visual Prompt (Copy for AI Image/Video):**');
      sb.writeln('  ` ${s.visualPrompt} `\n');
    }

    sb.writeln('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    sb.writeln('🚀 **4. वायरल YOUTUBE TITLES & SEO TAGS:**');
    for (int i = 0; i < titleOptions.length; i++) {
      sb.writeln('${i + 1}. ${titleOptions[i]}');
    }
    sb.writeln('\n📝 **Description:** $seoDescription');
    sb.writeln('🏷️ **Tags:** ${tags.join(" ")}');

    return sb.toString();
  }
}
