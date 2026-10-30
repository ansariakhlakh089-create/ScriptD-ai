import 'package:flutter/material.dart';
import '../theme.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isOutline;

  const CustomButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isOutline = false,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 54,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: isOutline ? Colors.white : AppColors.primary,
          foregroundColor: isOutline ? AppColors.navy : Colors.white,
          side: isOutline ? const BorderSide(color: Colors.black12) : BorderSide.none,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          elevation: isOutline ? 0 : 5,
        ),
        child: Text(text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
