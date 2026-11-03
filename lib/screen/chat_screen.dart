```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme.dart';
import '../state/app_state.dart';
import '../state/chat_store.dart';
import '../script_package.dart';
import 'creation_screen.dart';
import 'plan_screen.dart';
import 'project_screen.dart';

class ChatScreen extends StatelessWidget {
  final String? chatId;
  const ChatScreen({super.key, this.chatId});

  @override
  Widget build(BuildContext context) {
    // Chat स्क्रीन का रंग: Slate
    return PaletteTheme(
      dark: AppPalette.slate,
      light: AppPalette.peanut,
      child: _ChatBody(initialChatId: chatId),
    );
  }
}

class _ChatBody extends StatefulWidget {
  final String? initialChatId;
  const _ChatBody({this.initialChatId});

  @override
  State<_ChatBody> createState() => _ChatBodyState();
}

class _ChatBodyState extends State<_ChatBody> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scroll = ScrollController();
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  String? _activeChatId;
  bool _isImageTab = false;
  bool _isWaiting = false;
  String _waitingStatus = 'Research ho rahi hai...';
  bool _hasText = false;
  int _sessionToken = 0;

  @override
  void initState() {
    super.initState();
    _activeChatId = widget.initialChatId;
    _controller.addListener(() {
      final has = _controller.text.trim().isNotEmpty;
      if (has != _hasText) setState(() => _hasText = has);
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _snack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  void _scrollDown() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(
          _scroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _newChat() {
    setState(() {
      _sessionToken++;
      _activeChatId = null;
      _isWaiting = false;
      _isImageTab = false;
    });
    _controller.clear();
  }

  void _openChatSession(String id) {
    setState(() {
      _sessionToken++;
      _activeChatId = id;
      _isWaiting = false;
      _isImageTab = false;
    });
    _scrollDown();
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _isWaiting) return;

    final appState = AppStateProvider.of(context);
    final store = ChatStoreProvider.read(context);

    // 1) ऑटो-इंटेंट डिटेक्शन: मैसेज से खुद पहचानें कि यह नॉर्मल चैट है, छोटा सवाल है, शॉर्ट स्क्रिप्ट है या लॉन्ग स्क्रिप्ट
    final intent = ScriptPackage.detectIntent(text);
    final needsScriptCredit = intent == ScriptIntent.shortScript ||
        intent == ScriptIntent.longScript;

    // 2) केवल शॉर्ट या लॉन्ग स्क्रिप्ट बनने पर ही क्रेडिट चेक करें (नॉर्मल चैट बिल्कुल मुफ्त!)
    if (needsScriptCredit) {
      if (!appState.canCreateScript) {
        _showLimitDialog();
        return;
      }
      appState.consumeScriptCredit();
    }

    // 3) अगर यह नई चैट है तो ChatStore में नया सेशन बनाएं
    String currentId = _activeChatId ?? '';
    if (currentId.isEmpty || store.chatById(currentId) == null) {
      final session = store.createChat(text);
      currentId = session.id;
      _activeChatId = currentId;
    }

    final nowMs = DateTime.now().millisecondsSinceEpoch;
    store.addMessage(
      currentId,
      ChatMessage(text, true, nowMs, modeTag: intent.name),
    );

    final token = _sessionToken;
    setState(() {
      _isWaiting = true;
      _waitingStatus = needsScriptCredit
          ? (intent == ScriptIntent.shortScript
              ? '⚡ 60-Sec Short Script + Scene Prompts ban rahe hain...'
              : '🎬 Deep Research + Full Documentary Script ban rahi hai...')
          : '💬 Smart Studio Reply taiyar ho raha hai (0 Credit)...';
    });
    _controller.clear();
    _scrollDown();

    await Future.delayed(
      Duration(milliseconds: needsScriptCredit ? 1800 : 700),
    );
    if (!mounted || token != _sessionToken) return;

    // 4) इंटेंट के अनुसार जवाब या पूरी स्क्रिप्ट + रियलिस्टिक प्रॉम्प्ट्स बनाएं
    if (!needsScriptCredit) {
      final reply = ScriptPackage.generateChatReply(
        text,
        intent: intent,
        language: appState.selectedLanguage,
        tone: appState.defaultTone,
      );
      store.addMessage(
        currentId,
        ChatMessage(
          reply,
          false,
          DateTime.now().millisecondsSinceEpoch,
          modeTag: intent.name,
        ),
      );
    } else {
      final isShort = intent == ScriptIntent.shortScript;
      final pkg = ScriptPackage.generate(
        rawQuery: text,
        isShort: isShort,
        language: appState.selectedLanguage,
        tone: appState.defaultTone,
      );
      final fullFormatted = pkg.toStudioFormattedText();

      // अपने-आप 'Your Creation' में भी सेव करें ताकि होम स्क्रीन पर दिखे!
      final creation = store.addCreation(
        '${pkg.topic} (${isShort ? "Short" : "Documentary"})',
        fullFormatted,
        kind: isShort ? 'Short' : 'Long video',
      );

      store.addMessage(
        currentId,
        ChatMessage(
          fullFormatted,
          false,
          DateTime.now().millisecondsSinceEpoch,
          modeTag: intent.name,
          creationId: creation.id,
        ),
      );
    }

    if (mounted) {
      setState(() => _isWaiting = false);
      _scrollDown();
    }
  }

  void _showLimitDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Free script limit khatam!'),
        content: const Text(
          'Aapki free scripts khatam ho gayi hain. '
          'Normal chat abhi bhi free hai! Nayi script banane ke liye Ad dekhein ya chhota top-up pack lein.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Baad mein'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PlanScreen()),
              );
            },
            child: const Text('Plans dekhein'),
          ),
        ],
      ),
    );
  }

  void _showAttachSheet() {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Padding(
              padding: EdgeInsets.all(14),
              child: Text(
                'Quick Script Templates & Notes',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.movie_filter_outlined,
                  color: AppColors.primary),
              title: const Text('Full Documentary Template'),
              subtitle: const Text('10–15 min deep history/mystery script'),
              onTap: () {
                Navigator.pop(ctx);
                _controller.text =
                    'Mohenjo-daro ki poori history aur rahasya par 15 min ki documentary script banao ';
                _controller.selection = TextSelection.fromPosition(
                  TextPosition(offset: _controller.text.length),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.bolt, color: AppColors.primary),
              title: const Text('60-Sec Viral Short / Reel Template'),
              subtitle: const Text('Fast-paced 9:16 vertical script + prompts'),
              onTap: () {
                Navigator.pop(ctx);
                _controller.text =
                    'Bulb ka avishkar kaise hua is par 60 sec ki viral short script banao ';
                _controller.selection = TextSelection.fromPosition(
                  TextPosition(offset: _controller.text.length),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.paste_outlined,
                  color: AppColors.primary),
              title: const Text('Clipboard se text paste karein'),
              subtitle: const Text('Apna research note ya article paste karein'),
              onTap: () async {
                Navigator.pop(ctx);
                final data = await Clipboard.getData('text/plain');
                final clip = data?.text?.trim() ?? '';
                if (clip.isEmpty) {
                  _snack('Clipboard mein koi text nahi mila');
                  return;
                }
                _controller.text = '${_controller.text} $clip'.trim();
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
    final currentSession =
        _activeChatId != null ? store.chatById(_activeChatId!) : null;
    final messages = currentSession?.messages ?? <ChatMessage>[];

    return Scaffold(
      key: _scaffoldKey,
      drawer: _buildDrawer(store),
      body: SafeArea(
        child: Column(
          children: [
            // Back to Home + plan chip
            Padding(
              padding: const EdgeInsets.fromLTRB(4, 4, 16, 0),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () => Navigator.pop(context),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: const Text(
                      'Back to Home',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const PlanScreen()),
                    ),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        appState.isPremium
                            ? 'Premium'
                            : '${appState.scriptsLeft} scripts left',
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            _buildTopBar(store, currentSession),
            Expanded(
              child: _isImageTab
                  ? _buildImageTab(messages)
                  : _buildChatList(messages),
            ),
            _buildInputBox(),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar(ChatStore store, ChatSession? currentSession) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 4, 4, 8),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () => _scaffoldKey.currentState?.openDrawer(),
          ),
          Expanded(
            child: Container(
              height: 44,
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: Colors.white24),
              ),
              child: Row(
                children: [
                  _segment(
                    'Chat',
                    Icons.chat_bubble_outline,
                    !_isImageTab,
                    () => setState(() => _isImageTab = false),
                  ),
                  _segment(
                    'Image',
                    Icons.image_outlined,
                    _isImageTab,
                    () => setState(() => _isImageTab = true),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 6),
          InkWell(
            onTap: _newChat,
            borderRadius: BorderRadius.circular(22),
            child: Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white38),
              ),
              child: const Icon(Icons.add),
            ),
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert),
            onSelected: (v) async {
              if (v == 'clear') {
                _newChat();
              } else if (v == 'project') {
                if (currentSession == null) {
                  _snack('Pehle koi chat shuru karein');
                  return;
                }
                final p = await pickProject(context);
                if (p != null && mounted) {
                  store.attachChat(p.id, currentSession.id);
                  _snack('"${p.name}" project mein chat jod di');
                }
              } else if (v == 'copy_all') {
                if (currentSession == null || currentSession.messages.isEmpty) {
                  _snack('Copy karne ke liye abhi koi message nahi hai');
                  return;
                }
                final all = currentSession.messages
                    .map((m) => '${m.isUser ? "You" : "ScriptD AI"}:\n${m.text}')
                    .join('\n\n');
                Clipboard.setData(ClipboardData(text: all));
                _snack('Poori chat copy ho gayi!');
              }
            },
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'clear', child: Text('New / Clear chat')),
              PopupMenuItem(
                  value: 'project', child: Text('Add chat to Project')),
              PopupMenuItem(value: 'copy_all', child: Text('Copy full chat')),
            ],
          ),
        ],
      ),
    );
  }

  Widget _segment(
    String label,
    IconData icon,
    bool selected,
    VoidCallback onTap,
  ) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            color: selected ? AppColors.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(18),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 18,
                color: selected ? Colors.white : Colors.white70,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: selected ? Colors.white : Colors.white70,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDrawer(ChatStore store) {
    final allChats = store.chats;
    return Drawer(
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.fromLTRB(20, 20, 20, 8),
              child: Text(
                'Your Chats',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.add, color: AppColors.primary),
              title: const Text('New chat'),
              onTap: () {
                Navigator.pop(context);
                _newChat();
              },
            ),
            const Divider(),
            Expanded(
              child: allChats.isEmpty
                  ? const Padding(
                      padding: EdgeInsets.all(20),
                      child: Text(
                        'Aapki purani chats yahan dikhengi.',
                        style: TextStyle(color: Colors.white60),
                      ),
                    )
                  : ListView.builder(
                      itemCount: allChats.length,
                      itemBuilder: (ctx, i) {
                        final c = allChats[i];
                        final isCurrent = c.id == _activeChatId;
                        return ListTile(
                          selected: isCurrent,
                          leading: Icon(
                            Icons.chat_bubble_outline,
                            color:
                                isCurrent ? AppColors.primary : Colors.white70,
                          ),
                          title: Text(
                            c.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          subtitle: Text(
                            ChatStore.formatTime(c.updated),
                            style: const TextStyle(fontSize: 11.5),
                          ),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete_outline, size: 18),
                            onPressed: () {
                              store.deleteChat(c.id);
                              if (_activeChatId == c.id) _newChat();
                            },
                          ),
                          onTap: () {
                            Navigator.pop(context);
                            _openChatSession(c.id);
                          },
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChatList(List<ChatMessage> messages) {
    if (messages.isEmpty && !_isWaiting) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: const [
              Icon(Icons.auto_awesome, size: 48, color: AppColors.primary),
              SizedBox(height: 12),
              Text(
                'Kis topic par video banani hai?',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 6),
              Text(
                'Neeche likho, aur script + visual ideas paao.',
                style: TextStyle(color: Colors.white70),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      controller: _scroll,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      itemCount: messages.length + (_isWaiting ? 1 : 0),
      itemBuilder: (context, i) {
        if (i == messages.length) return _buildWaitingBubble();
        return _buildBubble(messages[i]);
      },
    );
  }

  Widget _buildInputBox() {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 4, 12, 12),
      padding: const EdgeInsets.fromLTRB(16, 10, 8, 8),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white24),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _controller,
            minLines: 2,
            maxLines: 6,
            textCapitalization: TextCapitalization.sentences,
            decoration: const InputDecoration(
              hintText: "What's on your mind?",
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              filled: false,
            ),
          ),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.add_circle_outline),
                tooltip: 'Templates & Paste',
                onPressed: _showAttachSheet,
              ),
              const Spacer(),
              _hasText
                  ? InkWell(
                      onTap: _send,
                      borderRadius: BorderRadius.circular(24),
                      child: Container(
                        width: 44,
                        height: 44,
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.arrow_upward,
                          color: Colors.white,
                        ),
                      ),
                    )
                  : IconButton(
                      icon: const Icon(Icons.mic_none),
                      onPressed: () {
                        _showAttachSheet();
                      },
                    ),
            ],
          ),
        ],
      ),
    );
  }
}
