import 'package:flutter/material.dart';
import '../theme.dart';

class ScriptScreen extends StatefulWidget {
  final String topic;
  const ScriptScreen({super.key, required this.topic});

  @override
  State<ScriptScreen> createState() => _ScriptScreenState();
}

class _ScriptScreenState extends State<ScriptScreen> {
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    // Fake loading delay (3 seconds) to show AI is "researching"
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Script Ready ✨", style: TextStyle(fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: isLoading
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const CircularProgressIndicator(color: AppColors.primary),
                    const SizedBox(height: 24),
                    Text(
                      "Research kar raha hoon:\n${widget.topic}...",
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.navy),
                    ),
                    const SizedBox(height: 8),
                    const Text("Sources check kar raha hoon...", style: TextStyle(color: Colors.grey)),
                  ],
                ),
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: Colors.green.shade100, borderRadius: BorderRadius.circular(8)),
                    child: const Text("✓ RESEARCH COMPLETE", style: TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 16),
                  Text(widget.topic, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.navy)),
                  const SizedBox(height: 16),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.black12),
                      ),
                      child: const SingleChildScrollView(
                        child: Text(
                          "Hook: Socho, agar yeh cheez na hoti toh kya hota?\n\n"
                          "Scene 1: Duniya mein jab pehli baar iska idea aaya, logon ne mazaak udaya. Kisi ne socha nahi tha ki yeh itna bada badlav laayega.\n\n"
                          "Scene 2: Phir aaya ek scientist, jisne apni poori zindagi is cheez ko banane mein laga di.\n\n"
                          "Scene 3: Aaj hum iske bina apni zindagi imagine nahi kar sakte. Lekin kya aapne kabhi socha hai ki iske peeche ki asli kahani kya hai?\n\n"
                          "(Yeh ek demo script hai. Aage hum isko Claude AI se connect karenge taaki asli research wali script aaye!)",
                          style: TextStyle(fontSize: 16, height: 1.6),
                        ),
                      ),
                    ),
                  )
                ],
              ),
      ),
    );
  }
}
