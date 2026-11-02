// VERSION 5 — Creation: Add to project जुड़ा
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme.dart';
import '../state/chat_store.dart';
import 'project_screen.dart';

class CreationScreen extends StatelessWidget {
  final String creationId;
  const CreationScreen({super.key, required this.creationId});

  @override
  Widget build(BuildContext context) {
    return PaletteTheme(
      dark: AppPalette.slate,
      light: AppPalette.peanut,
      child: _CreationBody(creationId: creationId),
    );
  }
}

class _CreationBody extends StatelessWidget {
  final String creationId;
  const _CreationBody({required this.creationId});

  @override
  Widget build(BuildContext context) {
    final store = ChatStoreProvider.of(context);
    final c = store.creationById(creationId);

    if (c == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Creation')),
        body: Center(
          child: Text(
            'Yeh creation ab maujood nahi hai.',
            style: TextStyle(color: AppText.muted(context)),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(c.title, maxLines: 1, overflow: TextOverflow.ellipsis),
        actions: [
          IconButton(
            icon: const Icon(Icons.folder_open),
            tooltip: 'Add to project',
            onPressed: () async {
              final p = await pickProject(context);
              if (p == null) return;
              store.attachCreation(p.id, c.id);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('"${p.name}" project mein jod di')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.copy),
            tooltip: 'Copy',
            onPressed: () {
              Clipboard.setData(ClipboardData(text: c.text));
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Copy ho gaya')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline),
            tooltip: 'Delete',
            onPressed: () {
              showDialog(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Creation delete karein?'),
                  content: const Text('Yeh hamesha ke liye hat jayegi.'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('Cancel'),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        store.deleteCreation(c.id);
                        Navigator.pop(context);
                      },
                      child: const Text('Delete'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: SelectableText(
          c.text,
          style: const TextStyle(fontSize: 15, height: 1.6),
        ),
      ),
    );
  }
}
