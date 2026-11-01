class SceneData {
  final String label;
  final String title;
  final String hook;
  final String visualPrompt;

  const SceneData({
    required this.label,
    required this.title,
    required this.hook,
    required this.visualPrompt,
  });
}

class ScriptPackage {
  final String topic;
  final String hook;
  final String fullScript;
  final List<SceneData> scenes;
  final List<String> titleOptions;
  final String seoDescription;
  final List<String> tags;
  final String recommendedFormat;
  final int retentionScore;

  const ScriptPackage({
    required this.topic,
    required this.hook,
    required this.fullScript,
    required this.scenes,
    required this.titleOptions,
    required this.seoDescription,
    required this.tags,
    required this.recommendedFormat,
    required this.retentionScore,
  });

  /// Demo generator — बाद में यहाँ AI API call लगाना है।
  factory ScriptPackage.demo(String topic) {
    return ScriptPackage(
      topic: topic,
      hook: 'Socho, agar $topic na hoti toh kya hota?',
      fullScript:
          'Hook: Socho, agar "$topic" na hoti toh kya hota?\n\n'
          'Scene 1: Duniya mein jab pehli baar iska idea aaya, '
          'logon ne mazaak udaya. Kisi ne socha nahi tha ki yeh '
          'itna bada badlav laayega.\n\n'
          'Scene 2: Phir aaya ek scientist, jisne apni poori zindagi '
          'is cheez ko banane mein laga di.\n\n'
          'Scene 3: Aaj hum iske bina apni zindagi imagine nahi kar sakte. '
          'Lekin kya aapne kabhi socha hai ki iske peeche ki asli kahani kya hai?',
      scenes: [
        SceneData(
          label: 'SCENE 1',
          title: 'The Hook',
          hook: 'Socho, agar $topic na hoti toh kya hota?',
          visualPrompt:
              'A cinematic shot of a dark room, a single glowing lightbulb, '
              'and a silhouette of a person thinking about "$topic".',
        ),
        SceneData(
          label: 'SCENE 2',
          title: 'The Struggle',
          hook: 'Logon ne mazaak udaya, par unhone haar nahi maani.',
          visualPrompt:
              'A vintage Indian lab with scattered papers, an old scientist '
              'working on $topic, looking tired but determined.',
        ),
        SceneData(
          label: 'SCENE 3',
          title: 'The Success',
          hook: 'Aaj hum iske bina apni zindagi imagine nahi kar sakte.',
          visualPrompt:
              'Modern Indian city at night, bright lights, people smiling, '
              'looking towards the future — celebrating $topic.',
        ),
      ],
      titleOptions: [
        '$topic - Asli Sach Jo Koi Nahi Batata!',
        'Is Ek Galti Ne Badal Di Duniya ($topic)',
        '$topic Ki Ansuni Kahani!',
      ],
      seoDescription:
          'Is video mein hum baat karenge "$topic" ke baare mein. '
          'Kaise iski shuruat hui aur iske peeche ka asli rahasya kya hai. '
          'Video ko end tak zaroor dekhein!',
      tags: const [
        '#Documentary',
        '#HindiFacts',
        '#ViralVideo',
        '#ScriptDAI',
        '#IndianCreators',
        '#Knowledge',
      ],
      recommendedFormat: 'Documentary / Storytelling',
      retentionScore: 88,
    );
  }
}
