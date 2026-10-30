import 'package:flutter/material.dart';
import 'theme.dart';
import 'screen/home_screen.dart';

void main() {
  runApp(const ScriptDirectorApp());
}

class ScriptDirectorApp extends StatelessWidget {
  const ScriptDirectorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Script Director AI',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const HomeScreen(),
    );
  }
}
