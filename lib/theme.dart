import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFFFF6B35);
  static const Color navy = Color(0xFF1A1A2E);
  static const Color mint = Color(0xFF00D9A3);
  static const Color background = Color(0xFFFAFAFA);
  static const Color darkBackground = Color(0xFF121212);
}

class AppPalette {
  static const Color slate = Color(0xFF54474E);
  static const Color pebble = Color(0xFF93847F);
  static const Color wool = Color(0xFFC7BEAD);
  static const Color peanut = Color(0xFFBB9C87);
}

class AppText {
  static Color muted(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? Colors.white70
        : Colors.black54;
  }
}

class PaletteTheme extends StatelessWidget {
  final Color darkBg;
  final Color lightBg;
  final Widget child;

  const PaletteTheme({
    super.key,
    required this.darkBg,
    required this.lightBg,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? darkBg : lightBg;

    final base = ThemeData(
      useMaterial3: true,
      brightness: isDark ? Brightness.dark : Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: isDark ? Brightness.dark : Brightness.light,
      ),
    );

    final card = isDark
        ? Color.alphaBlend(Colors.white.withOpacity(0.10), bg)
        : Color.alphaBlend(Colors.black.withOpacity(0.05), bg);

    return Theme(
      data: base.copyWith(
        scaffoldBackgroundColor: bg,
        cardColor: card,
        dividerColor: isDark ? Colors.white24 : Colors.black12,
        iconTheme: IconThemeData(color: isDark ? Colors.white : Colors.black87),
        appBarTheme: AppBarTheme(
          backgroundColor: bg,
          elevation: 0,
          foregroundColor: isDark ? Colors.white : Colors.black87,
          iconTheme: IconThemeData(color: isDark ? Colors.white : Colors.black87),
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
