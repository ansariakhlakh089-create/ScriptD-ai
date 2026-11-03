import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ChatMessage {
  final String text;
  final bool isUser;
  final int time;

  const ChatMessage(this.text, this.isUser, this.time);

  Map<String, dynamic> toJson() => {'t': text, 'u': isUser, 'ms': time};
  factory ChatMessage.fromJson(Map<String, dynamic> j) => ChatMessage(j['t'] as String, j['u'] as bool, j['ms'] as int);
}

class ChatSession {
  final String id;
  String title;
  int updated;
  final List<ChatMessage> messages;

  ChatSession({required this.id, required this.title, required this.updated, List<ChatMessage>? messages})
      : messages = messages ?? [];

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'updated': updated,
        'messages': messages.map((m) => m.toJson()).toList(),
      };

  factory ChatSession.fromJson(Map<String, dynamic> j) => ChatSession(
        id: j['id'] as String,
        title: j['title'] as String,
        updated: j['updated'] as int,
        messages: (j['messages'] as List).map((m) => ChatMessage.fromJson(m as Map<String, dynamic>)).toList(),
      );
}

class Creation {
  final String id;
  final String title;
  final String text;
  final int time;

  const Creation(this.id, this.title, this.text, this.time);

  Map<String, dynamic> toJson() => {'id': id, 'title': title, 'text': text, 'time': time};
  factory Creation.fromJson(Map<String, dynamic> j) => Creation(j['id'] as String, j['title'] as String, j['text'] as String, j['time'] as int);
}

const List<String> kProjectStages = [
  'Research', 'Script', 'Visual prompts', 'Images', 'Title & SEO', 'Editing', 'Upload',
];

class Project {
  final String id;
  String name;
  String kind;
  final int created;
  final List<String> chatIds;
  final List<String> creationIds;
  final List<String> done;

  Project({
    required this.id,
    required this.name,
    required this.kind,
    required this.created,
    List<String>? chatIds,
    List<String>? creationIds,
    List<String>? done,
  })  : chatIds = chatIds ?? [],
        creationIds = creationIds ?? [],
        done = done ?? [];

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'kind': kind,
        'created': created,
        'chatIds': chatIds,
        'creationIds': creationIds,
        'done': done,
      };

  factory Project.fromJson(Map<String, dynamic> j) => Project(
        id: j['id'] as String,
        name: j['name'] as String,
        kind: j['kind'] as String,
        created: j['created'] as int,
        chatIds: List<String>.from(j['chatIds'] as List),
        creationIds: List<String>.from(j['creationIds'] as List),
        done: List<String>.from(j['done'] as List),
      );
}

class ChatStore extends ChangeNotifier {
  final List<ChatSession> _chats = [];
  final List<Creation> _creations = [];
  final List<Project> _projects = [];

  ChatStore() {
    _load();
  }

  List<ChatSession> get chats {
    final l = List<ChatSession>.from(_chats);
    l.sort((a, b) => b.updated.compareTo(a.updated));
    return l;
  }

  List<Creation> get creations {
    final l = List<Creation>.from(_creations);
    l.sort((a, b) => b.time.compareTo(a.time));
    return l;
  }

  List<Project> get projects {
    final l = List<Project>.from(_projects);
    l.sort((a, b) => b.created.compareTo(a.created));
    return l;
  }

  Project? projectById(String id) {
    for (final p in _projects) { if (p.id == id) return p; }
    return null;
  }

  ChatSession? chatById(String id) {
    for (final c in _chats) { if (c.id == id) return c; }
    return null;
  }

  Creation? creationById(String id) {
    for (final c in _creations) { if (c.id == id) return c; }
    return null;
  }

  String _newId() => DateTime.now().microsecondsSinceEpoch.toString();

  ChatSession createChat(String title) {
    final s = ChatSession(id: _newId(), title: title, updated: DateTime.now().millisecondsSinceEpoch);
    _chats.add(s);
    _changed();
    return s;
  }

  void addMessage(String chatId, ChatMessage m) {
    final s = chatById(chatId);
    if (s == null) return;
    s.messages.add(m);
    s.updated = m.time;
    _changed();
  }

  void deleteChat(String chatId) {
    _chats.removeWhere((c) => c.id == chatId);
    for (final p in _projects) { p.chatIds.remove(chatId); }
    _changed();
  }

  Creation addCreation(String title, String text) {
    final c = Creation(_newId(), title, text, DateTime.now().millisecondsSinceEpoch);
    _creations.add(c);
    _changed();
    return c;
  }

  void deleteCreation(String id) {
    _creations.removeWhere((c) => c.id == id);
    for (final p in _projects) { p.creationIds.remove(id); }
    _changed();
  }

  Project createProject(String name, String kind) {
    final p = Project(id: _newId(), name: name, kind: kind, created: DateTime.now().millisecondsSinceEpoch);
    _projects.add(p);
    _changed();
    return p;
  }

  void toggleStage(String id, String stage) {
    final p = projectById(id);
    if (p == null) return;
    if (p.done.contains(stage)) { p.done.remove(stage); } else { p.done.add(stage); }
    _changed();
  }

  void attachChat(String pid, String chatId) {
    final p = projectById(pid);
    if (p == null || p.chatIds.contains(chatId)) return;
    p.chatIds.add(chatId);
    _changed();
  }

  void detachChat(String pid, String chatId) {
    final p = projectById(pid);
    if (p == null) return;
    p.chatIds.remove(chatId);
    _changed();
  }

  void attachCreation(String pid, String creationId) {
    final p = projectById(pid);
    if (p == null || p.creationIds.contains(creationId)) return;
    p.creationIds.add(creationId);
    _changed();
  }

  void detachCreation(String pid, String creationId) {
    final p = projectById(pid);
    if (p == null) return;
    p.creationIds.remove(creationId);
    _changed();
  }

  void _changed() {
    notifyListeners();
    _save();
  }

  Future<void> _load() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString('chat_store_v1');
      if (raw == null) return;
      final data = jsonDecode(raw) as Map<String, dynamic>;
      _chats..clear()..addAll((data['chats'] as List).map((e) => ChatSession.fromJson(e as Map<String, dynamic>)));
      _creations..clear()..addAll((data['creations'] as List).map((e) => Creation.fromJson(e as Map<String, dynamic>)));
      _projects..clear()..addAll(((data['projects'] as List?) ?? []).map((e) => Project.fromJson(e as Map<String, dynamic>)));
      notifyListeners();
    } catch (_) {}
  }

  Future<void> _save() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('chat_store_v1', jsonEncode({
        'chats': _chats.map((c) => c.toJson()).toList(),
        'creations': _creations.map((c) => c.toJson()).toList(),
        'projects': _projects.map((p) => p.toJson()).toList(),
      }));
    } catch (_) {}
  }

  static String formatTime(int ms) {
    final d = DateTime.fromMillisecondsSinceEpoch(ms);
    String two(int n) => n.toString().padLeft(2, '0');
    return '${d.day}/${d.month}/${d.year}  ${two(d.hour)}:${two(d.minute)}';
  }
}

class ChatStoreProvider extends InheritedNotifier<ChatStore> {
  const ChatStoreProvider({super.key, required ChatStore store, required super.child}) : super(notifier: store);

  static ChatStore of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<ChatStoreProvider>()!.notifier!;
  }
  
  static ChatStore read(BuildContext context) {
    return context.getInheritedWidgetOfExactType<ChatStoreProvider>()!.notifier!;
  }
}
