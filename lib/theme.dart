import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFFFF6B35);
  static const Color navy = Color(0xFF1A1A2E);
  static const Color mint = Color(0xFF00D9A3);
  static const Color background = Color(0xFFFAFAFA);
  static const Color darkBackground = Color(0xFF121212);
}

/// तुम्हारी palette के रंग (इमेज से निकाले हुए)
class AppPalette {
  static const Color slate = Color(0xFF54474E); // Chat + Settings (+ Plan) स्क्रीन
  static const Color pebble = Color(0xFF93847F); // Home स्क्रीन
  static const Color wool = Color(0xFFC7BEAD); // अभी इस्तेमाल नहीं हो रहा
  static const Color peanut = Color(0xFFBB9C87); // अभी इस्तेमाल नहीं हो रहा
}

/// किसी स्क्रीन को palette का बैकग्राउंड देने वाला wrapper।
/// अंदर के सारे कार्ड/टेक्स्ट/आइकन इसी के हिसाब से अपने आप बदलते हैं।
class PaletteTheme extends StatelessWidget {
  final Color bg;
  final Widget child;
  const PaletteTheme({super.key, required this.bg, required this.child});

  @override
  Widget build(BuildContext context) {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: Brightness.dark,
      ),
    );
    // कार्ड का रंग: बैकग्राउंड से थोड़ा हल्का
    final card = Color.alphaBlend(Colors.white.withOpacity(0.10), bg);

    return Theme(
      data: base.copyWith(
        scaffoldBackgroundColor: bg,
        cardColor: card,
        dividerColor: Colors.white24,
        iconTheme: const IconThemeData(color: Colors.white),
        appBarTheme: AppBarTheme(
          backgroundColor: bg,
          elevation: 0,
          foregroundColor: Colors.white,
          iconTheme: const IconThemeData(color: Colors.white),
        ),
        drawerTheme: DrawerThemeData(backgroundColor: bg),
      ),
      child: child,
    );
  }
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary, brightness: Brightness.light),
      appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.background,
          elevation: 0,
          iconTheme: IconThemeData(color: AppColors.navy)),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.darkBackground,
      colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary, brightness: Brightness.dark),
      appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.darkBackground,
          elevation: 0,
          iconTheme: IconThemeData(color: Colors.white)),
    );
  }
}
