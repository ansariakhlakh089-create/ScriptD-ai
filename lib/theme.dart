import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFFFF6B35);
  static const Color navy = Color(0xFF1A1A2E);
  static const Color mint = Color(0xFF00D9A3);
  static const Color background = Color(0xFFFAFAFA);
  static const Color darkBackground = Color(0xFF121212);
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: ColorScheme.fromSeed(seedColor: AppColors.primary, brightness: Brightness.light),
      appBarTheme: const AppBarTheme(backgroundColor: AppColors.background, elevation: 0, iconTheme: IconThemeData(color: AppColors.navy)),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.darkBackground,
      colorScheme: ColorScheme.fromSeed(seedColor: AppColors.primary, brightness: Brightness.dark),
      appBarTheme: const AppBarTheme(backgroundColor: AppColors.darkBackground, elevation: 0, iconTheme: IconThemeData(color: Colors.white)),
    );
  }
}
