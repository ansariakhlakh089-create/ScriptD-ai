import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// डेमो मोड को false कर दिया गया है ताकि ऐप में नकली डेमो की जगह असली डेटा चले।
/// टेस्टिंग के लिए Plan स्क्रीन में टेस्ट बटन्स को टॉगल करने का विकल्प भी दिया गया है।
const bool kDemoMode = false;

class AppState extends ChangeNotifier {
  bool _isLoggedIn = false;
  String _userEmail = '';
  String _userName = 'Creator';
  String _channelName = 'My YouTube Channel';

  bool _isPremium = false;
  String _activePlanName = 'Free Plan';
  int _scriptsUsed = 0;
  int _paidCredits = 0; // ₹19 Short pack / ₹49 Long pack / Ad से मिली स्क्रिप्ट्स
  int _adsWatchedToday = 0;

  bool _isDarkMode = true;
  bool _notificationsEnabled = true;
  String _selectedLanguage = 'Hinglish';
  String _defaultTone = 'Documentary';
  String _fontStyle = 'Default';
  List<String> _feedbackHistory = [];
  

  // Getters
  bool get isLoggedIn => _isLoggedIn;
  String get userEmail =>
      _userEmail.isNotEmpty ? _userEmail : 'creator@scriptd.ai';
  String get userName => _userName.isNotEmpty ? _userName : 'Creator';
  String get channelName =>
      _channelName.isNotEmpty ? _channelName : 'My Creator Studio';

  bool get isPremium => _isPremium;
  String get activePlanName => _isPremium ? _activePlanName : 'Free Plan';
  int get scriptsUsed => _scriptsUsed;
  int get freeLimit => 2;
  int get paidCredits => _paidCredits;
  int get adsWatchedToday => _adsWatchedToday;
  int get freeScriptsLeft => (freeLimit - _scriptsUsed).clamp(0, freeLimit);
  int get scriptsLeft => freeScriptsLeft + _paidCredits;

  bool get isDarkMode => _isDarkMode;
  bool get notificationsEnabled => _notificationsEnabled;
  String get selectedLanguage => _selectedLanguage;
  String get defaultTone => _defaultTone;
  String get fontStyle => _fontStyle;
  List<String> get feedbackHistory => List.unmodifiable(_feedbackHistory);

  double get usageProgress =>
      _isPremium ? 1.0 : (_scriptsUsed / freeLimit).clamp(0.0, 1.0);
  bool get canCreateScript => _isPremium || scriptsLeft > 0;

  AppState() {
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    _isLoggedIn = prefs.getBool('isLoggedIn') ?? false;
    _userEmail = prefs.getString('userEmail') ?? '';
    _userName = prefs.getString('userName') ?? 'Creator';
    _channelName = prefs.getString('channelName') ?? 'My YouTube Channel';

    _isPremium = prefs.getBool('isPremium') ?? false;
    _activePlanName = prefs.getString('activePlanName') ?? 'Free Plan';
    _scriptsUsed = prefs.getInt('scriptsUsed') ?? 0;
    _paidCredits = prefs.getInt('paidCredits') ?? 0;
    _adsWatchedToday = prefs.getInt('adsWatchedToday') ?? 0;

    _isDarkMode = prefs.getBool('isDarkMode') ?? true;
    _notificationsEnabled = prefs.getBool('notificationsEnabled') ?? true;
    _selectedLanguage = prefs.getString('language') ?? 'Hinglish';
    _defaultTone = prefs.getString('tone') ?? 'Documentary';
    _fontStyle = prefs.getString('fontStyle') ?? 'Default';
    _feedbackHistory = prefs.getStringList('feedbackHistory') ?? [];
    notifyListeners();
  }

  Future<void> _savePreference(String key, dynamic value) async {
    final prefs = await SharedPreferences.getInstance();
    if (value is bool) await prefs.setBool(key, value);
    if (value is int) await prefs.setInt(key, value);
    if (value is String) await prefs.setString(key, value);
    if (value is List<String>) await prefs.setStringList(key, value);
  }

  // ---------------- असली लॉगिन और प्रोफाइल सिस्टम ----------------
  Future<void> login({
    required String email,
    String? name,
    String? channel,
  }) async {
    final cleanEmail = email.trim();
    final derivedName = (name != null && name.trim().isNotEmpty)
        ? name.trim()
        : (cleanEmail.contains('@')
            ? cleanEmail.split('@').first
            : 'Creator');

    _isLoggedIn = true;
    _userEmail = cleanEmail;
    _userName = derivedName;
    if (channel != null && channel.trim().isNotEmpty) {
      _channelName = channel.trim();
    }

    await _savePreference('isLoggedIn', true);
    await _savePreference('userEmail', _userEmail);
    await _savePreference('userName', _userName);
    await _savePreference('channelName', _channelName);
    notifyListeners();
  }

  Future<void> updateProfile({
    required String name,
    required String email,
    required String channel,
  }) async {
    if (name.trim().isNotEmpty) _userName = name.trim();
    if (email.trim().isNotEmpty) _userEmail = email.trim();
    if (channel.trim().isNotEmpty) _channelName = channel.trim();

    await _savePreference('userName', _userName);
    await _savePreference('userEmail', _userEmail);
    await _savePreference('channelName', _channelName);
    notifyListeners();
  }

  Future<void> logout() async {
    _isLoggedIn = false;
    await _savePreference('isLoggedIn', false);
    notifyListeners();
  }

  // ---------------- सेटिंग्स और पर्सनलाइजेशन ----------------
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

  void setFontStyle(String style) {
    _fontStyle = style;
    _savePreference('fontStyle', style);
    notifyListeners();
  }

  Future<void> submitFeedback(String message) async {
    final clean = message.trim();
    if (clean.isEmpty) return;
    _feedbackHistory = [
      '${DateTime.now().day}/${DateTime.now().month}/${DateTime.now().year}: $clean',
      ..._feedbackHistory,
    ];
    await _savePreference('feedbackHistory', _feedbackHistory);
    notifyListeners();
  }

  // ---------------- प्लान्स और क्रेडिट्स सिस्टम ----------------
  void enablePremium([String planTitle = 'Monthly Pro (₹399)']) {
    _isPremium = true;
    _activePlanName = planTitle;
    _savePreference('isPremium', true);
    _savePreference('activePlanName', planTitle);
    notifyListeners();
  }

  void disablePremium() {
    _isPremium = false;
    _activePlanName = 'Free Plan';
    _savePreference('isPremium', false);
    _savePreference('activePlanName', 'Free Plan');
    notifyListeners();
  }

  void addCredit([int count = 1]) {
    _paidCredits += count;
    _savePreference('paidCredits', _paidCredits);
    notifyListeners();
  }

  void rewardAdCredit() {
    _adsWatchedToday++;
    _paidCredits += 1;
    _savePreference('adsWatchedToday', _adsWatchedToday);
    _savePreference('paidCredits', _paidCredits);
    notifyListeners();
  }

  void resetFreeCreditsForTesting() {
    _scriptsUsed = 0;
    _savePreference('scriptsUsed', 0);
    notifyListeners();
  }

  /// केवल तभी कॉल होता है जब यूज़र शॉर्ट या लॉन्ग स्क्रिप्ट बनवाता है।
  /// नॉर्मल चैट (सामान्य सवाल/बातचीत) पर यह कॉल नहीं होता और क्रेडिट सुरक्षित रहता है।
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
  const AppStateProvider({
    super.key,
    required AppState state,
    required super.child,
  }) : super(notifier: state);

  static AppState of(BuildContext context) {
    return context
        .dependOnInheritedWidgetOfExactType<AppStateProvider>()!
        .notifier!;
  }

  static AppState? maybeOf(BuildContext context) {
    return context
        .dependOnInheritedWidgetOfExactType<AppStateProvider>()
        ?.notifier;
  }
}
