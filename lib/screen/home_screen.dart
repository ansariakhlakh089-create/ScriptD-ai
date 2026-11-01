import 'package:flutter/material.dart';
import '../theme.dart';
import '../state/app_state.dart';
import 'chat_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Home का रंग: Pebble
    return const PaletteTheme(bg: AppPalette.pebble, child: _HomeBody());
  }
}

class _HomeBody extends StatefulWidget {
  const _HomeBody();

  @override
  State<_HomeBody> createState() => _HomeBodyState();
}

class _HomeBodyState extends State<_HomeBody> {
  int _tab = 0;

  static const List<String> _tabTitles = [
    'Your Chats',
    'Your Creation',
    'Your Projects',
  ];

  static const List<IconData> _tabIcons = [
    Icons.chat_bubble_outline,
    Icons.auto_awesome_outlined,
    Icons.folder_open,
  ];

  static const List<String> _emptyTexts = [
    'Abhi koi chat nahi hai.\nNeeche "Go Create" dabakar shuru karein.',
    'Aapki banayi hui scripts yahan dikhengi.',
    'Aapke projects yahan dikhenge.',
  ];

  // डमी डेटा (सिर्फ़ दिखाने के लिए) — असली डेटा जुड़ने पर हटेगा
  static const List<List<String>> _demoItems = [
    ['Overthinking par 10 min ki video', 'Bulb ka avishkar kaise hua'],
    ['Overthinking - Final Script', 'ISRO ki kahani - Script'],
    ['Documentary Series'],
  ];

  void _openChat() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const ChatScreen()),
    );
  }

  void _openSettings() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const SettingsScreen()),
    );
  }

  void _comingSoon() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Yeh feature jaldi aayega')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final cs = Theme.of(context).colorScheme;
    final initial = appState.userEmail.isNotEmpty
        ? appState.userEmail[0].toUpperCase()
        : 'U';

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // 1) सबसे ऊपर: ऐप का नाम + प्रोफाइल/सेटिंग आइकन
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 16, 10),
              child: Row(
                children: [
                  Text(
                    'ScriptD AI',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: cs.onSurface,
                    ),
                  ),
                  const Spacer(),
                  InkWell(
                    onTap: _openSettings,
                    borderRadius: BorderRadius.circular(24),
                    child: CircleAvatar(
                      radius: 20,
                      backgroundColor: AppColors.primary,
                      child: Text(
                        initial,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),

            // 2) तीन बॉक्स (टैब की तरह)
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 14, 12, 6),
              child: Row(
                children: List.generate(3, (i) => _buildTabBox(i)),
              ),
            ),

            // 3) बीच की बड़ी जगह
            Expanded(child: _buildContent(context)),

            // 4) सबसे नीचे: बार + Go Create गोल बटन
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: _openChat,
                      child: Container(
                        height: 60,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        alignment: Alignment.centerLeft,
                        decoration: BoxDecoration(
                          color: Theme.of(context).cardColor,
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(color: Colors.white24),
                        ),
                        child: const Text(
                          'Naya script shuru karein...',
                          style: TextStyle(color: Colors.grey, fontSize: 15),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: _openChat,
                    child: Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.4),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Text(
                          'Go\nCreate',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            height: 1.2,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabBox(int index) {
    final selected = _tab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _tab = index),
        child: Container(
          height: 84,
          margin: const EdgeInsets.symmetric(horizontal: 4),
          padding: const EdgeInsets.symmetric(horizontal: 6),
          decoration: BoxDecoration(
            color: selected
                ? AppColors.primary.withOpacity(0.12)
                : Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: selected ? AppColors.primary : Colors.white24,
              width: selected ? 1.5 : 1,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                _tabIcons[index],
                color: selected ? AppColors.primary : Colors.grey,
              ),
              const SizedBox(height: 6),
              Text(
                _tabTitles[index],
                textAlign: TextAlign.center,
                maxLines: 2,
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: selected ? AppColors.primary : null,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context) {
    final items = kDemoMode ? _demoItems[_tab] : <String>[];

    if (items.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(_tabIcons[_tab], size: 56, color: Colors.grey),
              const SizedBox(height: 12),
              Text(
                _emptyTexts[_tab],
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.grey, height: 1.5),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      itemCount: items.length,
      itemBuilder: (context, i) {
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.white24),
          ),
          child: ListTile(
            leading: Icon(_tabIcons[_tab], color: AppColors.primary),
            title: Text(items[i]),
            subtitle: const Text('Demo'),
            trailing: const Icon(Icons.chevron_right),
            onTap: _tab == 0 ? _openChat : _comingSoon,
          ),
        );
      },
    );
  }
}
