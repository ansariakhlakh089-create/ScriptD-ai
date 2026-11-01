import 'package:flutter/material.dart';
import '../theme.dart';
import 'export_screen.dart';

class PlatformScreen extends StatelessWidget {
  final String topic;
  const PlatformScreen({super.key, required this.topic});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Platform Details 🚀",
          style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.navy),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Viral Titles & Metadata",
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: AppColors.navy,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              "YouTube, Instagram aur Facebook ke liye algorithm-ready details:",
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ListView(
                children: [
                  _buildInfoBox(
                    "🔥 Best Viral Titles (A/B Testing)",
                    "1. $topic - Asli Sach Jo Koi Nahi Batata!\n"
                    "2. Is Ek Galti Ne Badal Di Duniya ($topic)\n"
                    "3. $topic Ki Ansuni Kahani!",
                  ),
                  _buildInfoBox(
                    "📝 SEO Description",
                    "Is video mein hum baat karenge '$topic' ke baare mein. Kaise iski shuruat hui aur iske peeche ka asli rahasya kya hai. Video ko end tak zaroor dekhein!",
                  ),
                  _buildInfoBox(
                    "🏷️ Trending Tags",
                    "#Documentary #HindiFacts #ViralVideo #ScriptDAI #IndianCreators #Knowledge",
                  ),
                  _buildInfoBox(
                    "📊 Best Format & Success Score",
                    "Recommended Format: Documentary / Storytelling\nPredicted Retention Score: 88%",
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ExportScreen(topic: topic),
                    ),
                  );
                },
                child: const Text(
                  "Finish & Package Ready Karein ✓",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoBox(String heading, String content) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.black12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            heading,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.navy,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: const TextStyle(
              fontSize: 15,
              color: Colors.black87,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
