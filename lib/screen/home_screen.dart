import 'package:flutter/material.dart';
import '../theme.dart';
import '../state/app_state.dart';
import '../state/chat_store.dart';
import 'chat_screen.dart';
import 'creation_screen.dart';
import 'project_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Home का रंग: Pebble (लाइट मोड में Wool)
    return const PaletteTheme(
      dark: AppPalette.pebble,
      light: AppPalette.wool,
      child: _HomeBody(),
    );
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
    'Abhi koi chat nahi hai.\nNeeche "Go Create" dabakar naya script shuru karein.',
    'Aapki banayi hui Short aur Long scripts yahan dikhengi.',
    'Aapke video projects yahan dikhenge.\nNaya project banakar apni scripts aur chats jodein.',
  ];

  void _openNewChat() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const ChatScreen()),
    );
  }

  void _openExistingChat(String chatId) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => ChatScreen(chatId: chatId)),
    );
  }

  void _openCreation(String creationId) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => CreationScreen(creationId: creationId)),
    );
  }

  void _openProject(String projectId) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => ProjectScreen(projectId: projectId)),
    );
  }

  void _openSettings() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const SettingsScreen()),
    );
  }

  Future<void> _createNewProject() async {
    final p = await showCreateProjectDialog(context);
    if (p != null && mounted) {
      _openProject(p.id);
    }
  }

  void _showChatOptions(ChatStore store, ChatSession chat) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.edit_outlined),
              title: const Text('Chat ka naam badlein'),
              onTap: () {
                Navigator.pop(ctx);
                final ctrl = TextEditingController(text: chat.title);
                showDialog(
                  context: context,
                  builder: (dCtx) => AlertDialog(
                    title: const Text('Chat ka naam badlein'),
                    content: TextField(
                      controller: ctrl,
                      autofocus: true,
                      maxLength: 60,
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(dCtx),
                        child: const Text('Cancel'),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          final t = ctrl.text.trim();
                          if (t.isNotEmpty) store.renameChat(chat.id, t);
                          Navigator.pop(dCtx);
                        },
                        child: const Text('Save'),
                      ),
                    ],
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.folder_open),
              title: const Text('Project mein jodein'),
              onTap: () async {
                Navigator.pop(ctx);
                final p = await pickProject(context);
                if (p != null && mounted) {
                  store.attachChat(p.id, chat.id);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('"${p.name}" mein chat jod di')),
                  );
                }
              },
            ),
            ListTile(
              leading: const Icon(Icons.delete_outline, color: Colors.redAccent),
              title: const Text(
                'Delete chat',
                style: TextStyle(color: Colors.redAccent),
              ),
              onTap: () {
                Navigator.pop(ctx);
                store.deleteChat(chat.id);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final store = ChatStoreProvider.of(context);
    final cs = Theme.of(context).colorScheme;
    final initial = appState.userName.isNotEmpty
        ? appState.userName[0].toUpperCase()
        : (appState.userEmail.isNotEmpty
            ? appState.userEmail[0].toUpperCase()
            : 'C');

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
                  if (_tab == 2)
                    IconButton(
                      icon: const Icon(Icons.create_new_folder_outlined),
                      tooltip: 'Naya project',
                      onPressed: _createNewProject,
                    ),
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
                children: List.generate(3, (i) => _buildTabBox(i, store)),
              ),
            ),

            // 3) बीच की बड़ी जगह (100% असली डेटा से जुड़ी हुई)
            Expanded(child: _buildContent(context, store)),

            // 4) सबसे नीचे: बार + Go Create गोल बटन
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: _openNewChat,
                      child: Container(
                        height: 60,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        alignment: Alignment.centerLeft,
                        decoration: BoxDecoration(
                          color: Theme.of(context).cardColor,
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(color: Colors.white24),
                        ),
                        child: Text(
                          'Naya script shuru karein...',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.75),
                            fontSize: 15,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: _openNewChat,
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

  Widget _buildTabBox(int index, ChatStore store) {
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
                ? AppColors.primary.withOpacity(0.16)
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
                color: selected ? AppColors.primary : Colors.white70,
              ),
              const SizedBox(height: 6),
              Text(
                _tabTitles[index],
                textAlign: TextAlign.center,
                maxLines: 2,
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: selected ? AppColors.primary : Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, ChatStore store) {
    // टैब 0: Your Chats
    if (_tab == 0) {
      final chats = store.chats;
      if (chats.isEmpty) return _buildEmptyState(null);
      return ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
        itemCount: chats.length,
        itemBuilder: (context, i) {
          final c = chats[i];
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white24),
            ),
            child: ListTile(
              leading: const Icon(
                Icons.chat_bubble_outline,
                color: AppColors.primary,
              ),
              title: Text(
                c.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              subtitle: Text(
                '${c.messages.length} messages  •  ${ChatStore.formatTime(c.updated)}',
                style: TextStyle(color: AppText.muted(context), fontSize: 12.5),
              ),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => _openExistingChat(c.id),
              onLongPress: () => _showChatOptions(store, c),
            ),
          );
        },
      );
    }

    // टैब 1: Your Creation
    if (_tab == 1) {
      final creations = store.creations;
      if (creations.isEmpty) return _buildEmptyState(null);
      return ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
        itemCount: creations.length,
        itemBuilder: (context, i) {
          final c = creations[i];
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white24),
            ),
            child: ListTile(
              leading: const Icon(
                Icons.auto_awesome_outlined,
                color: AppColors.primary,
              ),
              title: Text(
                c.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              subtitle: Text(
                '${c.kind}  •  ${ChatStore.formatTime(c.time)}',
                style: TextStyle(color: AppText.muted(context), fontSize: 12.5),
              ),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => _openCreation(c.id),
            ),
          );
        },
      );
    }

    // टैब 2: Your Projects
    final projects = store.projects;
    if (projects.isEmpty) {
      return _buildEmptyState(
        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
          ),
          onPressed: _createNewProject,
          icon: const Icon(Icons.add),
          label: const Text('Naya Project Banayein'),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      itemCount: projects.length + 1,
      itemBuilder: (context, i) {
        if (i == 0) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white,
                side: const BorderSide(color: Colors.white38),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              onPressed: _createNewProject,
              icon: const Icon(Icons.add, color: AppColors.primary),
              label: const Text('Naya Video Project Banayein'),
            ),
          );
        }
        final p = projects[i - 1];
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.white24),
          ),
          child: ListTile(
            leading: const Icon(
              Icons.folder_open,
              color: AppColors.primary,
            ),
            title: Text(
              p.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            subtitle: Text(
              '${p.kind}  •  ${p.done.length}/${kProjectStages.length} charan poore',
              style: TextStyle(color: AppText.muted(context), fontSize: 12.5),
            ),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _openProject(p.id),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState(Widget? actionButton) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(_tabIcons[_tab], size: 56, color: Colors.white60),
            const SizedBox(height: 12),
            Text(
              _emptyTexts[_tab],
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white70, height: 1.5),
            ),
            if (actionButton != null) ...[
              const SizedBox(height: 18),
              actionButton,
            ],
          ],
        ),
      ),
    );
  }
}
