import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // Copy karne ke liye zaroori hai
import '../theme.dart';
import 'export_screen.dart';

class PlatformScreen extends StatefulWidget {
  final String topic;
  const PlatformScreen({super.key, required this.topic});

  @override
  State<PlatformScreen> createState() => _PlatformScreenState();
}

class _PlatformScreenState extends State<PlatformScreen> {
  String selectedPlatform = "YouTube";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Platform Chuno", style: TextStyle(fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Kahan upload karoge? Uske hisaab se details milengi.", style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 16),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: ["YouTube", "Instagram Reels", "Shorts", "Facebook"].map((platform) {
                bool isSelected = selectedPlatform == platform;
                return GestureDetector(
                  onTap: () => setState(() => selectedPlatform = platform),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary.withValues(alpha: 0.1) : Colors.white,
                      border: Border.all(color: isSelected ? AppColors.primary : Colors.black12, width: 2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(platform, style: TextStyle(color: isSelected ? AppColors.primary : Colors.black87, fontWeight: FontWeight.bold)),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 32),
            
            // Titles
            _buildCopyCard("Title Options", [
              "AI ka Future: Kya Machines Insaan Se Aage Nikal Jayengi?",
              "${widget.topic} - The Untold Story! 🔥",
              "आपको ${widget.topic} के बारे में ये कभी नहीं बताया गया!"
            ]),
            const SizedBox(height: 20),

            // Description
            _buildCopyCard("Description", [
              "${widget.topic} ke baare mein poori sachchai! Is video mein humne deep research karke sab kuch bataya hai. Agar video pasand aaye toh like aur share karein.\n\n#AI #Technology #India #${widget.topic.replaceAll(' ', '')}"
            ]),
            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => ExportScreen(topic: widget.topic)),
                  );
                },
                child: const Text("Export Karo →", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCopyCard(String title, List<String> contents) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.black12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.navy)),
          const SizedBox(height: 12),
          ...contents.map((text) => Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(8)),
            child: Row(
              children: [
                Expanded(child: Text(text, style: const TextStyle(fontSize: 14))),
                IconButton(
                  icon: const Icon(Icons.copy, size: 18, color: AppColors.primary),
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: text));
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Copied to clipboard!"), duration: Duration(seconds: 1)));
                  },
                )
              ],
            ),
          )).toList(),
        ],
      ),
    );
  }
}
