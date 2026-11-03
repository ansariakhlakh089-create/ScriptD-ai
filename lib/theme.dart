import 'package:flutter/material.dart';
import 'state/app_state.dart';

class AppColors {
  static const Color primary = Color(0xFFFF6B35);
  static const Color navy = Color(0xFF1A1A2E);
  static const Color mint = Color(0xFF00D9A3);
  static const Color background = Color(0xFFFAFAFA);
  static const Color darkBackground = Color(0xFF121212);
}

/// आपकी मूल पैलेट के रंग (बिल्कुल वही UI रखा गया है)
class AppPalette {
  static const Color slate = Color(0xFF54474E); // Chat + Settings + Plan स्क्रीन
  static const Color pebble = Color(0xFF93847F); // Home स्क्रीन
  static const Color wool = Color(0xFFC7BEAD); // Light mode विकल्प
  static const Color peanut = Color(0xFFBB9C87); // Light mode कार्ड/बैकग्राउंड
}

/// Version 5 और सभी स्क्रीन्स के लिए टेक्स्ट हेल्पर
class AppText {
  static Color muted(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return isDark ? Colors.white70 : Colors.black54;
  }
}

/// किसी स्क्रीन को palette का बैकग्राउंड देने वाला wrapper।
/// यह पुराने `bg:` और नए Version 5 के `dark:` / `light:` दोनों को सपोर्ट करता है।
class PaletteTheme extends StatelessWidget {
  final Color? bg;
  final Color? dark;
  final Color? light;
  final Widget child;

  const PaletteTheme({
    super.key,
    this.bg,
    this.dark,
    this.light,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.maybeOf(context);
    final isDark = appState?.isDarkMode ?? true;
    final fontStyle = appState?.fontStyle ?? 'Default';

    final Color activeBg = bg ??
        (isDark
            ? (dark ?? AppPalette.slate)
            : (light ?? AppPalette.pebble));

    final String? fontFamily = _resolveFontFamily(fontStyle);

    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      fontFamily: fontFamily,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: Brightness.dark,
      ),
    );

    // कार्ड का रंग: बैकग्राउंड से थोड़ा हल्का
    final card = Color.alphaBlend(Colors.white.withOpacity(0.10), activeBg);

    return Theme(
      data: base.copyWith(
        scaffoldBackgroundColor: activeBg,
        cardColor: card,
        dividerColor: Colors.white24,
        iconTheme: const IconThemeData(color: Colors.white),
        appBarTheme: AppBarTheme(
          backgroundColor: activeBg,
          elevation: 0,
          foregroundColor: Colors.white,
          iconTheme: const IconThemeData(color: Colors.white),
        ),
        drawerTheme: DrawerThemeData(backgroundColor: activeBg),
      ),
      child: child,
    );
  }

  static String? _resolveFontFamily(String style) {
    switch (style) {
      case 'Serif (Classic)':
        return 'serif';
      case 'Monospace (Script)':
        return 'monospace';
      default:
        return null;
    }
  }
}

class AppTheme {
  static ThemeData lightTheme([String fontStyle = 'Default']) {
    final fontFamily = PaletteTheme._resolveFontFamily(fontStyle);
    return ThemeData(
      useMaterial3: true,
      fontFamily: fontFamily,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: Brightness.light,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.background,
        elevation: 0,
        iconTheme: IconThemeData(color: AppColors.navy),
      ),
    );
  }

  static ThemeData darkTheme([String fontStyle = 'Default']) {
    final fontFamily = PaletteTheme._resolveFontFamily(fontStyle);
    return ThemeData(
      useMaterial3: true,
      fontFamily: fontFamily,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.darkBackground,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: Brightness.dark,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.darkBackground,
        elevation: 0,
        iconTheme: IconThemeData(color: Colors.white),
      ),
    );
  }
}
