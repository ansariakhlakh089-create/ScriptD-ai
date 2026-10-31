import 'package:flutter/material.dart';
import '../theme.dart';

class ExportScreen extends StatelessWidget {
  final String topic;
  const ExportScreen({super.key, required this.topic});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.check_circle, color: Colors.green, size: 100),
              const SizedBox(height: 24),
              const Text("ALL SET! 🎉", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.navy)),
              const SizedBox(height: 12),
              Text("Tumhara video package ready hai!\nScript, visual ideas aur platform details sab mil gayi hain.", textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey, fontSize: 16)),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                  onPressed: () {
                    // Navigate back to home and clear all previous screens
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  },
                  child: const Text("Naya Video Banao", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
