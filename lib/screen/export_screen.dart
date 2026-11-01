import 'package:flutter/material.dart';
import '../theme.dart';
import '../models/script_package.dart';
import '../widgets/custom_button.dart';

class ExportScreen extends StatelessWidget {
  final ScriptPackage package;
  const ExportScreen({super.key, required this.package});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.check_circle, color: Colors.green, size: 100),
              const SizedBox(height: 24),
              const Text(
                'ALL SET! 🎉',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.navy,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                '"${package.topic}" ka video package ready hai!\n'
                'Script, visual ideas aur platform details sab mil gayi hain.',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.grey, fontSize: 16, height: 1.5),
              ),
              const SizedBox(height: 40),
              CustomButton(
                text: 'Naya Video Banao',
                icon: Icons.add,
                onPressed: () {
                  Navigator.of(context).popUntil((route) => route.isFirst);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
