import 'package:flutter/material.dart';
import '../theme.dart';

class VisualsScreen extends StatelessWidget {
  final String topic;
  const VisualsScreen({super.key, required this.topic});

  @override
  Widget build(BuildContext context) {
    // Dummy data for scenes
    final List<Map<String, String>> scenes = [
      {
        "scene": "SCENE 1",
        "title": "The Hook",
        "text": "Socho, agar yeh cheez na hoti toh kya hota?",
        "visual": "A cinematic shot of a dark room, a single glowing lightbulb, and a silhouette of a person thinking."
      },
      {
        "scene": "SCENE 2",
        "title": "The Struggle",
        "text": "Logon ne mazaak udaya, par unhone haar nahi maani.",
        "visual": "A vintage Indian lab with scattered papers, an old scientist looking tired but determined."
      },
      {
        "scene": "SCENE 3",
        "title": "The Success",
        "text": "Aaj hum iske bina apni zindagi imagine nahi kar sakte.",
        "visual": "Modern Indian city at night, bright lights, people smiling, looking towards the future."
      }
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text("Scene Visuals 🎬", style: TextStyle(fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(24.0),
        itemCount: scenes.length,
        itemBuilder: (context, index) {
          final scene = scenes[index];
          return Container(
            margin: const EdgeInsets.only(bottom: 24),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.black12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(scene["scene"]!, style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 12)),
                    const Icon(Icons.edit, size: 16, color: Colors.grey),
                  ],
                ),
                const SizedBox(height: 8),
                Text(scene["title"]!, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy)),
                const SizedBox(height: 8),
                Text('"${scene["text"]}"', style: const TextStyle(color: Colors.grey, fontStyle: FontStyle.italic)),
                const SizedBox(height: 16),
                
                // Visual Prompt Box
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(8)),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.image, size: 20, color: Colors.grey),
                      const SizedBox(width: 8),
                      Expanded(child: Text(scene["visual"]!, style: const TextStyle(fontSize: 13, color: Colors.black87))),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Image Generation Area (Premium Lock)
                Stack(
                  alignment: Alignment.center,
                  children: [
                    // Dummy blur background to represent image
                    Container(
                      height: 160,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        gradient: LinearGradient(
                          colors: [Colors.blueGrey.shade300, Colors.blueGrey.shade800],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: const Center(child: Text("🎬 AI Image", style: TextStyle(fontSize: 40))),
                    ),
                    // Premium Lock Overlay
                    Container(
                      height: 160,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.lock, color: Colors.amber, size: 32),
                          const SizedBox(height: 8),
                          const Text("Premium Feature", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(color: Colors.amber, borderRadius: BorderRadius.circular(20)),
                            child: const Text("Unlock ₹299", style: TextStyle(color: Colors.black, fontSize: 12, fontWeight: FontWeight.bold)),
                          )
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
