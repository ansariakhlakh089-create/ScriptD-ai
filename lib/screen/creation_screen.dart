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

class _CreationBody extends StatefulWidget {
  final String creationId;
  const _CreationBody({required this.creationId});

  @override
  State<_CreationBody> createState() => _CreationBodyState();
}

class _CreationBodyState extends State<_CreationBody> {
  bool _isEditing = false;
  late TextEditingController _editCtrl;

  @override
  void initState() {
    super.initState();
    _editCtrl = TextEditingController();
  }

  @override
  void dispose() {
    _editCtrl.dispose();
    super.dispose();
  }

  void _snack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  void _saveEditedScript(ChatStore store, Creation oldCreation) {
    final updatedText = _editCtrl.text.trim();
    if (updatedText.isEmpty) return;
    // पुरानी क्रिएशन की जगह अपडेटेड टेक्स्ट सेव करें
    store.deleteCreation(oldCreation.id);
    final newCreation = store.addCreation(
      oldCreation.title,
      updatedText,
      kind: oldCreation.kind,
    );
    setState(() => _isEditing = false);
    _snack('Script save ho gayi!');
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => CreationScreen(creationId: newCreation.id),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final store = ChatStoreProvider.of(context);
    final c = store.creationById(widget.creationId);

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

    if (!_isEditing && _editCtrl.text.isEmpty) {
      _editCtrl.text = c.text;
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(c.title, maxLines: 1, overflow: TextOverflow.ellipsis),
        actions: [
          IconButton(
            icon: Icon(_isEditing ? Icons.check : Icons.edit_outlined),
            tooltip: _isEditing ? 'Save Script' : 'Edit Script',
            onPressed: () {
              if (_isEditing) {
                _saveEditedScript(store, c);
              } else {
                setState(() {
                  _editCtrl.text = c.text;
                  _isEditing = true;
                });
              }
            },
          ),
          IconButton(
            icon: const Icon(Icons.folder_open),
            tooltip: 'Add to project',
            onPressed: () async {
              final p = await pickProject(context);
              if (p == null || !context.mounted) return;
              store.attachCreation(p.id, c.id);
              _snack('"${p.name}" project mein jod di');
            },
          ),
          IconButton(
            icon: const Icon(Icons.copy),
            tooltip: 'Copy Full Script',
            onPressed: () {
              Clipboard.setData(ClipboardData(text: c.text));
              _snack('Poori script copy ho gayi!');
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
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.redAccent,
                        foregroundColor: Colors.white,
                      ),
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
      body: Column(
        children: [
          // ऊपर छोटा मेटाडेटा बार (Short / Long Video टैग + समय)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            color: Colors.black12,
            child: Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primary),
                  ),
                  child: Text(
                    c.kind,
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  ChatStore.formatTime(c.time),
                  style: TextStyle(
                    color: AppText.muted(context),
                    fontSize: 12.5,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _isEditing
                ? Padding(
                    padding: const EdgeInsets.all(16),
                    child: TextField(
                      controller: _editCtrl,
                      maxLines: null,
                      expands: true,
                      style: const TextStyle(fontSize: 15, height: 1.6),
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        hintText: 'Apni script yahan edit karein...',
                      ),
                    ),
                  )
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: SelectableText(
                      c.text,
                      style: const TextStyle(fontSize: 15, height: 1.6),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
