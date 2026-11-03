import 'package:flutter/material.dart';
import '../theme.dart';
import '../state/chat_store.dart';
import 'chat_screen.dart';
import 'creation_screen.dart';

/// नया project बनाने का डायलॉग। बन जाए तो Project लौटाता है, cancel पर null।
Future<Project?> showCreateProjectDialog(BuildContext context) {
  final store = ChatStoreProvider.read(context);
  final nameC = TextEditingController();
  String kind = 'Long video';

  return showDialog<Project>(
    context: context,
    builder: (ctx) => StatefulBuilder(
      builder: (ctx, setS) => AlertDialog(
        title: const Text('Naya project'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: nameC,
              autofocus: true,
              maxLength: 60,
              decoration: const InputDecoration(
                hintText: 'Video / project ka naam',
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: ['Long video', 'Short']
                  .map(
                    (k) => ChoiceChip(
                      label: Text(k),
                      selected: kind == k,
                      onSelected: (_) => setS(() => kind = k),
                    ),
                  )
                  .toList(),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              final n = nameC.text.trim();
              if (n.isEmpty) return;
              Navigator.pop(ctx, store.createProject(n, kind));
            },
            child: const Text('Banayein'),
          ),
        ],
      ),
    ),
  );
}

/// किसी project को चुनने की शीट ("Naya project" भी बना सकते हैं)
Future<Project?> pickProject(BuildContext context) {
  final store = ChatStoreProvider.read(context);
  final projects = store.projects;

  return showModalBottomSheet<Project>(
    context: context,
    builder: (ctx) => SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              'Project chunein',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.add, color: AppColors.primary),
            title: const Text('Naya project'),
            onTap: () async {
              final p = await showCreateProjectDialog(ctx);
              if (ctx.mounted) Navigator.pop(ctx, p);
            },
          ),
          Flexible(
            child: ListView(
              shrinkWrap: true,
              children: projects
                  .map(
                    (p) => ListTile(
                      leading: const Icon(
                        Icons.folder_open,
                        color: AppColors.primary,
                      ),
                      title: Text(p.name),
                      subtitle: Text(p.kind),
                      onTap: () => Navigator.pop(ctx, p),
                    ),
                  )
                  .toList(),
            ),
          ),
        ],
      ),
    ),
  );
}

class ProjectScreen extends StatelessWidget {
  final String projectId;
  const ProjectScreen({super.key, required this.projectId});

  @override
  Widget build(BuildContext context) {
    return PaletteTheme(
      dark: AppPalette.slate,
      light: AppPalette.peanut,
      child: _ProjectBody(projectId: projectId),
    );
  }
}

class _ProjectBody extends StatelessWidget {
  final String projectId;
  const _ProjectBody({required this.projectId});

  void _snack(BuildContext context, String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  void _rename(BuildContext context, ChatStore store, Project p) {
    final c = TextEditingController(text: p.name);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Project ka naam badlein'),
        content: TextField(controller: c, autofocus: true, maxLength: 60),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              final t = c.text.trim();
              if (t.isNotEmpty) store.renameProject(p.id, t);
              Navigator.pop(ctx);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _delete(BuildContext context, ChatStore store, Project p) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Project delete karein?'),
        content: const Text(
          'Sirf project hatega. Usmein jodi gayi chats aur creations bachi rahengi.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              Navigator.pop(ctx);
              store.deleteProject(p.id);
              Navigator.pop(context);
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _addChat(BuildContext context, ChatStore store, Project p) {
    final options =
        store.chats.where((c) => !p.chatIds.contains(c.id)).toList();
    if (options.isEmpty) {
      _snack(context, 'Jodne ke liye koi chat nahi bachi');
      return;
    }
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: ListView(
          shrinkWrap: true,
          children: [
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                'Chat chunein',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
            ...options.map(
              (c) => ListTile(
                leading: const Icon(
                  Icons.chat_bubble_outline,
                  color: AppColors.primary,
                ),
                title: Text(
                  c.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                subtitle: Text(ChatStore.formatTime(c.updated)),
                onTap: () {
                  store.attachChat(p.id, c.id);
                  Navigator.pop(ctx);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _addCreation(BuildContext context, ChatStore store, Project p) {
    final options =
        store.creations.where((c) => !p.creationIds.contains(c.id)).toList();
    if (options.isEmpty) {
      _snack(context, 'Jodne ke liye koi creation nahi bachi');
      return;
    }
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: ListView(
          shrinkWrap: true,
          children: [
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                'Creation chunein',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
            ...options.map(
              (c) => ListTile(
                leading: const Icon(
                  Icons.auto_awesome_outlined,
                  color: AppColors.primary,
                ),
                title: Text(
                  c.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                subtitle: Text('${c.kind} • ${ChatStore.formatTime(c.time)}'),
                onTap: () {
                  store.attachCreation(p.id, c.id);
                  Navigator.pop(ctx);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String text) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 18, 4, 8),
      child: Text(
        text,
        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _box(BuildContext context, Widget child) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: child,
    );
  }

  @override
  Widget build(BuildContext context) {
    final store = ChatStoreProvider.of(context);
    final p = store.projectById(projectId);

    if (p == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Project')),
        body: Center(
          child: Text(
            'Yeh project ab maujood nahi hai.',
            style: TextStyle(color: AppText.muted(context)),
          ),
        ),
      );
    }

    final total = kProjectStages.length;
    final doneCount = p.done.length;
    final chats =
        p.chatIds.map(store.chatById).whereType<ChatSession>().toList();
    final creations =
        p.creationIds.map(store.creationById).whereType<Creation>().toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(p.name, maxLines: 1, overflow: TextOverflow.ellipsis),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            tooltip: 'Rename',
            onPressed: () => _rename(context, store, p),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline),
            tooltip: 'Delete',
            onPressed: () => _delete(context, store, p),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          // ऊपर का सार
          _box(
            context,
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${p.kind}  •  ${ChatStore.formatTime(p.created)}',
                    style: TextStyle(color: AppText.muted(context)),
                  ),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: doneCount / total,
                      minHeight: 10,
                      backgroundColor: Theme.of(context).dividerColor,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '$doneCount / $total charan poore',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ),

          // Plan: क्या बन गया, क्या बाकी
          _sectionTitle('Plan (kya ban gaya, kya baaki)'),
          ...kProjectStages.map(
            (st) => _box(
              context,
              CheckboxListTile(
                value: p.done.contains(st),
                activeColor: AppColors.primary,
                controlAffinity: ListTileControlAffinity.leading,
                title: Text(st),
                onChanged: (_) => store.toggleStage(p.id, st),
              ),
            ),
          ),

          // Chats
          _sectionTitle('Chats'),
          if (chats.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
              child: Text(
                'Abhi koi chat nahi jodi gayi.',
                style: TextStyle(color: AppText.muted(context)),
              ),
            ),
          ...chats.map(
            (c) => _box(
              context,
              ListTile(
                leading: const Icon(
                  Icons.chat_bubble_outline,
                  color: AppColors.primary,
                ),
                title: Text(
                  c.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                subtitle: Text(ChatStore.formatTime(c.updated)),
                trailing: IconButton(
                  icon: const Icon(Icons.link_off),
                  tooltip: 'Project se hatayein',
                  onPressed: () => store.detachChat(p.id, c.id),
                ),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => ChatScreen(chatId: c.id)),
                ),
              ),
            ),
          ),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton.icon(
              onPressed: () => _addChat(context, store, p),
              icon: const Icon(Icons.add),
              label: const Text('Chat jodein'),
            ),
          ),

          // Creations
          _sectionTitle('Creations'),
          if (creations.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
              child: Text(
                'Abhi koi creation nahi jodi gayi.',
                style: TextStyle(color: AppText.muted(context)),
              ),
            ),
          ...creations.map(
            (c) => _box(
              context,
              ListTile(
                leading: const Icon(
                  Icons.auto_awesome_outlined,
                  color: AppColors.primary,
                ),
                title: Text(
                  c.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                subtitle: Text('${c.kind} • ${ChatStore.formatTime(c.time)}'),
                trailing: IconButton(
                  icon: const Icon(Icons.link_off),
                  tooltip: 'Project se hatayein',
                  onPressed: () => store.detachCreation(p.id, c.id),
                ),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => CreationScreen(creationId: c.id),
                  ),
                ),
              ),
            ),
          ),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton.icon(
              onPressed: () => _addCreation(context, store, p),
              icon: const Icon(Icons.add),
              label: const Text('Creation jodein'),
            ),
          ),
        ],
      ),
    );
  }
}
