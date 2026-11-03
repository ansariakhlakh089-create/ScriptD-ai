import 'package:flutter/material.dart';
import 'theme.dart';
import 'state/app_state.dart';
import 'state/chat_store.dart';
import 'screen/login_screen.dart';

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
  final ChatStore _chatStore = ChatStore();

  @override
  Widget build(BuildContext context) {
    return AppStateProvider(
      state: _appState,
      child: ChatStoreProvider(
        store: _chatStore,
        child: AnimatedBuilder(
          animation: _appState,
          builder: (context, child) {
            return MaterialApp(
              title: 'ScriptD AI',
              debugShowCheckedModeBanner: false,
              theme: AppTheme.lightTheme,
              darkTheme: AppTheme.darkTheme,
              themeMode: ThemeMode.system,
              home: const LoginScreen(),
            );
          },
        ),
      ),
    );
  }
}
