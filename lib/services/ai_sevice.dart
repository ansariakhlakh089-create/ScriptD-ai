import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';

class AIService {
  static Future<String> generateScript(String topic, String tone) async {
    if (AppConfig.apiKey == 'YOUR_API_KEY_HERE') {
      await Future.delayed(const Duration(seconds: 3));
      return "AI API Key is missing in config.dart.\n\nBut this is exactly where the real AI response will appear. Once you add the API key, I will generate a complete $tone script for your topic: '$topic'.";
    }

    try {
      final response = await http.post(
        Uri.parse(AppConfig.apiUrl),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': AppConfig.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: jsonEncode({
          "model": "claude-3-sonnet-20240229",
          "max_tokens": 1024,
          "messages": [
            {"role": "user", "content": "Write a $tone video script for the topic: $topic. Provide hook, scenes, and SEO titles."}
          ]
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['content'][0]['text'];
      } else {
        return "Error: Could not generate script. Server returned ${response.statusCode}";
      }
    } catch (e) {
      return "Network Error: Please check your internet connection. Details: $e";
    }
  }
}
