import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// डेमो मोड: true रहने पर डमी बटन (ऐड देखो, ₹49 खरीदो, Premium ON/OFF)
/// और डमी लिस्ट दिखती हैं। Play Store पर डालने से पहले इसे false कर देना।
const bool kDemoMode = true;

class AppState extends ChangeNotifier {
  // डमी यूज़र — Google लॉगिन जुड़ने पर असली ईमेल/नाम से बदलेगा
  final String userEmail = 'creator@gmail.com';
  final String userName = 'Creator';

  bool _isPremium = false;
  int _scriptsUsed = 0; // TODO: असली limit सर्वर पर रखनी है
  int _paidCredits = 0; // ऐड देखकर / ₹49 से मिली extra scripts
  bool _isDarkMode = false;
  bool _notificationsEnabled = true;
  String _selectedLanguage = 'Hinglish';
  String _defaultTone = 'Documentary';

  // Getters
  bool get isPremium => _isPremium;
  int get scriptsUsed => _scriptsUsed;
  int get freeLimit => 2;
  int get paidCredits => _paidCredits;
  int get freeScriptsLeft => (freeLimit - _scriptsUsed).clamp(0, freeLimit);
  int get scriptsLeft => freeScriptsLeft + _paidCredits;
  bool get isDarkMode => _isDarkMode;
  bool get notificationsEnabled => _notificationsEnabled;
  String get selectedLanguage => _selectedLanguage;
  String get defaultTone => _defaultTone;
  double get usageProgress =>
      _isPremium ? 1.0 : (_scriptsUsed / freeLimit).clamp(0.0, 1.0);
  bool get canCreateScript => _isPremium || scriptsLeft > 0;

  AppState() {
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    _isPremium = prefs.getBool('isPremium') ?? false;
    _scriptsUsed = prefs.getInt('scriptsUsed') ?? 0;
    _paidCredits = prefs.getInt('paidCredits') ?? 0;
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

  // ---- सिर्फ़ डेमो के लिए (असली पेमेंट/ऐड जुड़ने पर बदलेंगे) ----
  void enablePremium() {
    _isPremium = true;
    _savePreference('isPremium', true);
    notifyListeners();
  }

  void disablePremium() {
    _isPremium = false;
    _savePreference('isPremium', false);
    notifyListeners();
  }

  void addCredit([int count = 1]) {
    _paidCredits += count;
    _savePreference('paidCredits', _paidCredits);
    notifyListeners();
  }
  // -------------------------------------------------------------

  /// पहले free scripts खर्च होती हैं, फिर extra credits।
  bool consumeScriptCredit() {
    if (_isPremium) return true;
    if (_scriptsUsed < freeLimit) {
      _scriptsUsed++;
      _savePreference('scriptsUsed', _scriptsUsed);
      notifyListeners();
      return true;
    }
    if (_paidCredits > 0) {
      _paidCredits--;
      _savePreference('paidCredits', _paidCredits);
      notifyListeners();
      return true;
    }
    return false;
  }
}

class AppStateProvider extends InheritedNotifier<AppState> {
  const AppStateProvider(
      {super.key, required AppState state, required super.child})
      : super(notifier: state);

  static AppState of(BuildContext context) {
    return context
        .dependOnInheritedWidgetOfExactType<AppStateProvider>()!
        .notifier!;
  }
}
