import 'package:flutter/material.dart';

class AppState extends ChangeNotifier {
  bool _isPremium = false;
  int _scriptsUsed = 3;
  static const int _freeLimit = 5;

  bool get isPremium => _isPremium;
  int get scriptsUsed => _scriptsUsed;
  int get freeLimit => _freeLimit;

  double get usageProgress {
    if (_isPremium) return 1.0;
    return (_scriptsUsed / _freeLimit).clamp(0.0, 1.0);
  }

  bool get canCreateScript => _isPremium || _scriptsUsed < _freeLimit;

  void enablePremium() {
    if (!_isPremium) {
      _isPremium = true;
      notifyListeners();
    }
  }

  bool consumeScriptCredit() {
    if (!canCreateScript) return false;
    if (!_isPremium) {
      _scriptsUsed++;
      notifyListeners();
    }
    return true;
  }
}

class AppStateProvider extends InheritedNotifier<AppState> {
  const AppStateProvider({
    super.key,
    required AppState state,
    required super.child,
  }) : super(notifier: state);

  static AppState of(BuildContext context) {
    final provider =
        context.dependOnInheritedWidgetOfExactType<AppStateProvider>();
    assert(provider != null, 'AppStateProvider not found in widget tree');
    return provider!.notifier!;
  }
}
