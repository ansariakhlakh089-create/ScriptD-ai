import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFFFF6B35);
  static const Color navy = Color(0xFF1A1A2E);
  static const Color mint = Color(0xFF00D9A3);
  static const Color background = Color(0xFFFAFAFA);
  static const Color darkBackground = Color(0xFF121212);

  /// withOpacity की जगह (नए Flutter में withOpacity deprecated है)
  static Color fade(Color c, double opacity) {
    final o = opacity < 0 ? 0.0 : (opacity > 1 ? 1.0 : opacity);
    return c.withAlpha((o * 255).round());
  }
}

/// तुम्हारी palette के रंग
class AppPalette {
  static const Color slate = Color(0xFF54474E);
  static const Color pebble = Color(0xFF93847F);
  static const Color wool = Color(0xFFC7BEAD);
  static const Color peanut = Color(0xFFBB9C87);
}

/// टेक्स्ट के रंग — लाइट/डार्क दोनों में सही दिखें
class AppText {
  static bool isDark(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark;

  static Color fg(BuildContext context) =>
      isDark(context) ? Colors.white : const Color(0xFF241C20);

  static Color muted(BuildContext context) =>
      isDark(context) ? Colors.white70 : Colors.black54;
}

/// किसी स्क्रीन को palette का बैकग्राउंड देने वाला wrapper।
/// डार्क मोड में [dark] रंग, लाइट मोड में [light] रंग।
/// अंदर के कार्ड/टेक्स्ट/आइकन अपने आप उसी के हिसाब से बदलते हैं।
class PaletteTheme extends StatelessWidget {
  final Color dark;
  final Color light;
  final Widget child;

  const PaletteTheme({
    super.key,
    required this.dark,
    required this.light,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final brightness = isDark ? Brightness.dark : Brightness.light;
    final bg = isDark ? dark : light;
    final fg = isDark ? Colors.white : const Color(0xFF241C20);

    final base = ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: brightness,
      ),
    );

    // कार्ड का रंग: बैकग्राउंड से थोड़ा अलग
    final card = Color.alphaBlend(
      isDark ? Colors.white.withAlpha(26) : Colors.white.withAlpha(90),
      bg,
    );

    return Theme(
      data: base.copyWith(
        scaffoldBackgroundColor: bg,
        cardColor: card,
        dividerColor: isDark ? Colors.white24 : Colors.black26,
        iconTheme: IconThemeData(color: fg),
        textTheme: base.textTheme.apply(bodyColor: fg, displayColor: fg),
        appBarTheme: AppBarTheme(
          backgroundColor: bg,
          elevation: 0,
          scrolledUnderElevation: 0,
          foregroundColor: fg,
          iconTheme: IconThemeData(color: fg),
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
