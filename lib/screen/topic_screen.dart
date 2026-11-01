import 'package:flutter/material.dart';
import '../theme.dart';
import '../state/app_state.dart';
import '../widgets/custom_button.dart';
import 'script_screen.dart';

class TopicScreen extends StatefulWidget {
  const TopicScreen({super.key});

  @override
  State<TopicScreen> createState() => _TopicScreenState();
}

class _TopicScreenState extends State<TopicScreen> {
  final TextEditingController _topicController = TextEditingController();

  @override
  void dispose() {
    _topicController.dispose();
    super.dispose();
  }

  void _handleResearch() {
    final topic = _topicController.text.trim();
    if (topic.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pehle topic toh likho bhai!')),
      );
      return;
    }

    final appState = AppStateProvider.of(context);
    if (!appState.canCreateScript) {
      _showLimitDialog();
      return;
    }

    appState.consumeScriptCredit();

    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => ScriptScreen(topic: topic)),
    );
  }

  void _showLimitDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Free limit khatam!'),
        content: const Text(
          'Aapne is mahine ke saare free scripts use kar liye hain. '
          'Premium lo aur unlimited scripts banao.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Baad mein'),
          ),
          ElevatedButton(
            onPressed: () {
              AppStateProvider.of(context).enablePremium();
              Navigator.pop(ctx);
            },
            child: const Text('Upgrade (Demo)'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Naya Video'),
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
              'Kis topic par video banana hai?',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.navy,
              ),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _topicController,
              maxLines: 4,
              textCapitalization: TextCapitalization.sentences,
              decoration: const InputDecoration(
                hintText: 'Jaise: Bulb ka avishkar kaise hua...',
              ),
            ),
            const SizedBox(height: 30),
            CustomButton(
              text: 'Research Shuru Karein',
              icon: Icons.search,
              onPressed: _handleResearch,
            ),
          ],
        ),
      ),
    );
  }
}
