import 'package:flutter/material.dart';
import '../theme.dart';
import '../state/app_state.dart';
import '../state/chat_store.dart';
import 'chat_screen.dart';
import 'settings_screen.dart';
import 'creation_screen.dart';
import 'project_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PaletteTheme(darkBg: AppPalette.pebble, lightBg: AppPalette.wool, child: _HomeBody());
  }
}

class _HomeBody extends StatefulWidget {
  const _HomeBody();
  @override
  State<_HomeBody> createState() => _HomeBodyState();
}

class _HomeBodyState extends State<_HomeBody> {
  int _tab = 0;

  static const List<String> _tabTitles = ['Your Chats', 'Your Creations', 'Your Projects'];
  static const List<IconData> _tabIcons = [Icons.chat_bubble_outline, Icons.auto_awesome_outlined, Icons.folder_open];
  static const List<String> _emptyTexts = [
    'No chats yet.\nTap "Go Create" to start.',
    'Your generated scripts will appear here.',
    'Your projects will appear here.',
  ];

  void _openChat([String? chatId]) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => ChatScreen(chatId: chatId))).then((_) => setState((){}));
  }

  void _openSettings() {
    Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen()));
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final cs = Theme.of(context).colorScheme;
    final initial = appState.userEmail.isNotEmpty ? appState.userEmail[0].toUpperCase() : 'U';

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 16, 10),
              child: Row(
                children: [
                  Text('ScriptD AI', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: cs.onSurface)),
                  const Spacer(),
                  InkWell(
                    onTap: _openSettings,
                    borderRadius: BorderRadius.circular(24),
                    child: CircleAvatar(
                      radius: 20,
                      backgroundColor: AppColors.primary,
                      child: Text(initial, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 14, 12, 6),
              child: Row(children: List.generate(3, (i) => _buildTabBox(i))),
            ),
            Expanded(child: _buildContent(context)),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => _openChat(),
                      child: Container(
                        height: 60,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        alignment: Alignment.centerLeft,
                        decoration: BoxDecoration(
                          color: Theme.of(context).cardColor,
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(color: Colors.white24),
                        ),
                        child: const Text('Start a new script...', style: TextStyle(color: Colors.grey, fontSize: 15)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: () => _openChat(),
                    child: Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.4), blurRadius: 12, offset: const Offset(0, 4))],
                      ),
                      child: const Center(
                        child: Text('Go\nCreate', textAlign: TextAlign.center, style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13, height: 1.2)),
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
            color: selected ? AppColors.primary.withOpacity(0.12) : Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: selected ? AppColors.primary : Colors.white24, width: selected ? 1.5 : 1),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(_tabIcons[index], color: selected ? AppColors.primary : Colors.grey),
              const SizedBox(height: 6),
              Text(_tabTitles[index], textAlign: TextAlign.center, maxLines: 2, style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: selected ? AppColors.primary : null)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context) {
    final store = ChatStoreProvider.of(context);
    List<dynamic> items = [];
    if (_tab == 0) items = store.chats;
    if (_tab == 1) items = store.creations;
    if (_tab == 2) items = store.projects;

    if (items.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(_tabIcons[_tab], size: 56, color: Colors.grey),
              const SizedBox(height: 12),
              Text(_emptyTexts[_tab], textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey, height: 1.5)),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      itemCount: items.length,
      itemBuilder: (context, i) {
        final item = items[i];
        String title = '';
        String subtitle = '';
        VoidCallback onTap = () {};

        if (_tab == 0) {
          title = (item as ChatSession).title;
          subtitle = ChatStore.formatTime(item.updated);
          onTap = () => _openChat(item.id);
        } else if (_tab == 1) {
          title = (item as Creation).title;
          subtitle = ChatStore.formatTime(item.time);
          onTap = () => Navigator.push(context, MaterialPageRoute(builder: (_) => CreationScreen(creationId: item.id)));
        } else if (_tab == 2) {
          title = (item as Project).name;
          subtitle = item.kind;
          onTap = () => Navigator.push(context, MaterialPageRoute(builder: (_) => ProjectScreen(projectId: item.id)));
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.white24),
          ),
          child: ListTile(
            leading: Icon(_tabIcons[_tab], color: AppColors.primary),
            title: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis),
            subtitle: Text(subtitle),
            trailing: const Icon(Icons.chevron_right),
            onTap: onTap,
          ),
        );
      },
    );
  }
}
