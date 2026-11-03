import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppState extends ChangeNotifier {
  String userEmail = 'creator@gmail.com';
  String userName = 'Creator';

  bool _isPremium = false;
  int _scriptsUsed = 0;
  int _paidCredits = 0;
  bool _notificationsEnabled = true;
  String _selectedLanguage = 'English';
  String _defaultTone = 'Documentary';

  bool get isPremium => _isPremium;
  int get scriptsUsed => _scriptsUsed;
  int get freeLimit => 2;
  int get paidCredits => _paidCredits;
  int get freeScriptsLeft => (freeLimit - _scriptsUsed).clamp(0, freeLimit);
  int get scriptsLeft => freeScriptsLeft + _paidCredits;
  bool get notificationsEnabled => _notificationsEnabled;
  String get selectedLanguage => _selectedLanguage;
  String get defaultTone => _defaultTone;
  double get usageProgress => _isPremium ? 1.0 : (_scriptsUsed / freeLimit).clamp(0.0, 1.0);
  bool get canCreateScript => _isPremium || scriptsLeft > 0;

  AppState() {
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    _isPremium = prefs.getBool('isPremium') ?? false;
    _scriptsUsed = prefs.getInt('scriptsUsed') ?? 0;
    _paidCredits = prefs.getInt('paidCredits') ?? 0;
    _notificationsEnabled = prefs.getBool('notificationsEnabled') ?? true;
    _selectedLanguage = prefs.getString('language') ?? 'English';
    _defaultTone = prefs.getString('tone') ?? 'Documentary';
    notifyListeners();
  }

  Future<void> _savePreference(String key, dynamic value) async {
    final prefs = await SharedPreferences.getInstance();
    if (value is bool) await prefs.setBool(key, value);
    if (value is int) await prefs.setInt(key, value);
    if (value is String) await prefs.setString(key, value);
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

  void activatePremium() {
    _isPremium = true;
    _savePreference('isPremium', true);
    notifyListeners();
  }

  void addPaidCredit(int count) {
    _paidCredits += count;
    _savePreference('paidCredits', _paidCredits);
    notifyListeners();
  }
}

class AppStateProvider extends InheritedNotifier<AppState> {
  const AppStateProvider({super.key, required AppState state, required super.child})
      : super(notifier: state);

  static AppState of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<AppStateProvider>()!.notifier!;
  }
}
