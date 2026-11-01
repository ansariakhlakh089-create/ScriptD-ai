import 'package:flutter/material.dart';
import '../theme.dart';
import '../models/script_package.dart';
import '../widgets/custom_button.dart';
import 'visuals_screen.dart';

class ScriptScreen extends StatefulWidget {
  final String topic;
  const ScriptScreen({super.key, required this.topic});

  @override
  State<ScriptScreen> createState() => _ScriptScreenState();
}

class _ScriptScreenState extends State<ScriptScreen> {
  bool _isLoading = true;
  late ScriptPackage _package;

  @override
  void initState() {
    super.initState();
    // TODO: असली AI (Claude API) से replace करना है
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _package = ScriptPackage.demo(widget.topic);
          _isLoading = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Script Ready ✨'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: _isLoading ? _buildLoading() : _buildContent(),
      ),
    );
  }

  Widget _buildLoading() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(color: AppColors.primary),
          const SizedBox(height: 24),
          Text(
            'Research kar raha hoon:\n${widget.topic}...',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.navy,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Sources check kar raha hoon...',
            style: TextStyle(color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.green.shade100,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Text(
            '✓ RESEARCH COMPLETE',
            style: TextStyle(
              color: Colors.green,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          _package.topic,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: AppColors.navy,
          ),
        ),
        const SizedBox(height: 16),
        Expanded(
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.black12),
            ),
            child: SingleChildScrollView(
              child: Text(
                _package.fullScript,
                style: const TextStyle(fontSize: 16, height: 1.6),
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
        CustomButton(
          text: 'Visual Ideas Dekhein',
          icon: Icons.arrow_forward,
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => VisualsScreen(package: _package),
              ),
            );
          },
        ),
      ],
    );
  }
}
