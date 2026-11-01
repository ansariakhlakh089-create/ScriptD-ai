import 'package:flutter/material.dart';
import '../theme.dart';
import '../models/script_package.dart';
import '../widgets/custom_button.dart';
import 'export_screen.dart';

class PlatformScreen extends StatelessWidget {
  final ScriptPackage package;
  const PlatformScreen({super.key, required this.package});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Platform Details 🚀'),
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
              'Viral Titles & Metadata',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: AppColors.navy,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'YouTube, Instagram aur Facebook ke liye algorithm-ready details:',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ListView(
                children: [
                  _infoBox(
                    '🔥 Best Viral Titles (A/B Testing)',
                    package.titleOptions
                        .asMap()
                        .entries
                        .map((e) => '${e.key + 1}. ${e.value}')
                        .join('\n'),
                  ),
                  _infoBox('📝 SEO Description', package.seoDescription),
                  _infoBox('🏷️ Trending Tags', package.tags.join(' ')),
                  _infoBox(
                    '📊 Best Format & Success Score',
                    'Recommended Format: ${package.recommendedFormat}\n'
                    'Predicted Retention Score: ${package.retentionScore}%',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            CustomButton(
              text: 'Finish & Package Ready Karein',
              icon: Icons.check,
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ExportScreen(package: package),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoBox(String heading, String content) {
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
