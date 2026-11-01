import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppState extends ChangeNotifier {
  bool _isPremium = false;
  int _scriptsUsed = 0;
  bool _isDarkMode = false;
  bool _notificationsEnabled = true;
  String _selectedLanguage = 'Hinglish';
  String _defaultTone = 'Documentary';

  // Getters
  bool get isPremium => _isPremium;
  int get scriptsUsed => _scriptsUsed;
  int get freeLimit => 5;
  bool get isDarkMode => _isDarkMode;
  bool get notificationsEnabled => _notificationsEnabled;
  String get selectedLanguage => _selectedLanguage;
  String get defaultTone => _defaultTone;
  double get usageProgress => _isPremium ? 1.0 : (_scriptsUsed / freeLimit).clamp(0.0, 1.0);
  bool get canCreateScript => _isPremium || _scriptsUsed < freeLimit;

  AppState() {
    _loadPreferences(); // ऐप खुलते ही पुरानी सेटिंग्स लोड करें
  }

  // 1. Save & Load Settings (Real Persistence)
  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    _isPremium = prefs.getBool('isPremium') ?? false;
    _scriptsUsed = prefs.getInt('scriptsUsed') ?? 0;
    _isDarkMode = prefs.getBool('isDarkMode') ?? false;
    _notificationsEnabled = prefs.getBool('notificationsEnabled') ?? true;
    _selectedLanguage = prefs.getString('language') ?? 'Hinglish';
    _defaultTone = prefs.getString('tone') ?? 'Documentary';
    notifyListeners();
  }

  Future<void> _savePreference(String key, dynamic value) async {
    final prefs = await SharedPreferences.getInstance();
    if (value is bool) await prefs.setBool(key, value);
    if (value is int) await prefs.setInt(key, value);
    if (value is String) await prefs.setString(key, value);
  }

  // 2. Real Actions
  void toggleTheme(bool value) {
    _isDarkMode = value;
    _savePreference('isDarkMode', value);
    notifyListeners();
  }

  void toggleNotifications(bool value) {
    _notificationsEnabled = value;
    _savePreference('notificationsEnabled', value);
    notifyListeners();
  }

  void setLanguage(String lang) {
    _selectedLanguage = lang;
    _savePreference('language', lang);
    notifyListeners();
  }

  void setTone(String tone) {
    _defaultTone = tone;
    _savePreference('tone', tone);
    notifyListeners();
  }

  void enablePremium() {
    _isPremium = true;
    _savePreference('isPremium', true);
    notifyListeners();
  }

  bool consumeScriptCredit() {
    if (!canCreateScript) return false;
    if (!_isPremium) {
      _scriptsUsed++;
      _savePreference('scriptsUsed', _scriptsUsed);
      notifyListeners();
    }
    return true;
  }
}

// Provider (जो पहले से है)
class AppStateProvider extends InheritedNotifier<AppState> {
  const AppStateProvider({super.key, required AppState state, required super.child}) : super(notifier: state);
  static AppState of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<AppStateProvider>()!.notifier!;
  }
}
