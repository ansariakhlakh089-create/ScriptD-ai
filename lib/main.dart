import 'package:flutter/material.dart';
import 'config.dart';
import 'theme.dart';
import 'state/app_state.dart';
import 'state/chat_store.dart';
import 'screen/home_screen.dart';
import 'screen/login_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ScriptDApp());
}

class ScriptDApp extends StatefulWidget {
  const ScriptDApp({super.key});
  @override
  State<ScriptDApp> createState() => _ScriptDAppState();
}

class _ScriptDAppState extends State<ScriptDApp> {
  final AppState _appState = AppState();

  // लॉगिन होने पर उस ईमेल का स्टोर बनता है, लॉगआउट पर खाली स्टोर।
  // यह MaterialApp के ऊपर रखा है ताकि हर नई स्क्रीन (route) को दिखे।
  ChatStore _store = ChatStore(null);
  String? _storeUser;

  @override
  void initState() {
    super.initState();
    _appState.addListener(_syncStore);
  }

  void _syncStore() {
    final user = _appState.isLoggedIn ? _appState.userEmail : null;
    if (user == _storeUser) return;
    final old = _store;
    setState(() {
      _storeUser = user;
      _store = ChatStore(user);
    });
    WidgetsBinding.instance.addPostFrameCallback((_) => old.dispose());
  }

  @override
  void dispose() {
    _appState.removeListener(_syncStore);
    _appState.dispose();
    _store.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AppStateProvider(
      state: _appState,
      child: ChatStoreProvider(
        store: _store,
        child: AnimatedBuilder(
          animation: _appState,
          builder: (context, child) {
            return MaterialApp(
              title: kAppName,
              debugShowCheckedModeBanner: false,
              theme: AppTheme.lightTheme,
              darkTheme: AppTheme.darkTheme,
              themeMode: _appState.themeMode,
              builder: (context, child) {
                final mq = MediaQuery.of(context);
                final system = mq.textScaler.scale(1.0);
                return MediaQuery(
                  data: mq.copyWith(
                    textScaler: TextScaler.linear(system * _appState.fontScale),
                  ),
                  child: child!,
                );
              },
              home: const _Root(),
            );
          },
        ),
      ),
    );
  }
}

/// सेव डेटा लोड होने तक स्प्लैश, फिर लॉगिन या होम
class _Root extends StatelessWidget {
  const _Root();

  @override
  Widget build(BuildContext context) {
    final s = AppStateProvider.of(context);
    if (!s.loaded) return const _Splash();
    return s.isLoggedIn ? const HomeScreen() : const LoginScreen();
  }
}

class _Splash extends StatelessWidget {
  const _Splash();

  @override
  Widget build(BuildContext context) {
    return PaletteTheme(
      dark: AppPalette.slate,
      light: AppPalette.wool,
      child: Builder(
        builder: (context) => Scaffold(
          body: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.auto_awesome,
                    size: 44, color: AppColors.primary),
                const SizedBox(height: 14),
                Text(
                  kAppName,
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppText.fg(context),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
