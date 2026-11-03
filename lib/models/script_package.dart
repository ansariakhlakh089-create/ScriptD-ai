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
}
