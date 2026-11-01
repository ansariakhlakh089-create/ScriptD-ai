import 'package:flutter/material.dart';
import 'theme.dart';
import 'state/app_state.dart';
import 'screen/main_layout.dart';

void main() {
  runApp(const ScriptDApp());
}

class ScriptDApp extends StatefulWidget {
  const ScriptDApp({super.key});

  @override
  State<ScriptDApp> createState() => _ScriptDAppState();
}

class _ScriptDAppState extends State<ScriptDApp> {
  final AppState _appState = AppState();

  @override
  void dispose() {
    _appState.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AppStateProvider(
      state: _appState,
      child: MaterialApp(
        title: 'ScriptD AI',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const MainLayout(),
      ),
    );
  }
}
