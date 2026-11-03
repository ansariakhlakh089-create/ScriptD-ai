import 'package:flutter/material.dart';
import '../theme.dart';
import '../state/app_state.dart';
import '../state/chat_store.dart';
import '../services/ai_service.dart';
import 'plan_screen.dart';

class ChatScreen extends StatelessWidget {
  final String? chatId;
  const ChatScreen({super.key, this.chatId});

  @override
  Widget build(BuildContext context) {
    return const PaletteTheme(
      darkBg: AppPalette.slate, 
      lightBg: AppPalette.wool, 
      child: _ChatBody()
    );
  }
}

class _ChatBody extends StatefulWidget {
  const _ChatBody();
  @override
  State<_ChatBody> createState() => _ChatBodyState();
}

class _ChatBodyState extends State<_ChatBody> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scroll = ScrollController();
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  ChatSession? _session;
  bool _isImageTab = false;
  bool _isWaiting = false;
  bool _hasText = false;

  @override
  void initState() {
    super.initState();
    _controller.addListener(() {
      final has = _controller.text.trim().isNotEmpty;
      if (has != _hasText) setState(() => _hasText = has);
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_session == null) {
      final store = ChatStoreProvider.of(context);
      final id = (widget as ChatScreen).chatId;
      if (id != null) {
        _session = store.chatById(id);
      } else {
        _session = store.createChat('New Script Session');
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _scrollDown() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(_scroll.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
      }
    });
  }

  void _newChat() {
    final store = ChatStoreProvider.of(context);
    setState(() {
      _session = store.createChat('New Script Session');
      _isWaiting = false;
      _isImageTab = false;
    });
    _controller.clear();
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _isWaiting || _session == null) return;

    final appState = AppStateProvider.of(context);
    final store = ChatStoreProvider.of(context);

    if (!appState.canCreateScript) {
      _showLimitDialog();
      return;
    }
    appState.consumeScriptCredit();

    setState(() => _isWaiting = true);
    store.addMessage(_session!.id, ChatMessage(text, true, DateTime.now().millisecondsSinceEpoch));
    _controller.clear();
    _scrollDown();

    final aiResponse = await AIService.generateScript(text, appState.defaultTone);

    if (!mounted) return;
    setState(() {
      store.addMessage(_session!.id, ChatMessage(aiResponse, false, DateTime.now().millisecondsSinceEpoch));
      _isWaiting = false;
    });
    _scrollDown();
  }

  void _showLimitDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Free limit reached!'),
        content: const Text('You have used all your free scripts. Please choose a plan to continue creating.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Later')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.push(context, MaterialPageRoute(builder: (_) => const PlanScreen()));
            },
            child: const Text('View Plans'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final store = ChatStoreProvider.of(context);
    final messages = _session != null ? store.chatById(_session!.id)?.messages ?? [] : <ChatMessage>[];

    return Scaffold(
      key: _scaffoldKey,
      drawer: _buildDrawer(store),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(4, 4, 16, 0),
              child: Row(
                children: [
                  IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.pop(context)),
                  const Text('Back to Home', style: TextStyle(fontWeight: FontWeight.w600)),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PlanScreen())),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.12), borderRadius: BorderRadius.circular(16)),
                      child: Text(
                        appState.isPremium ? 'Premium' : '${appState.scriptsLeft} scripts left',
                        style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            _buildTopBar(),
            Expanded(child: _isImageTab ? _buildImageTab() : _buildChatList(messages)),
            _buildInputBox(),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 4, 4, 8),
      child: Row(
        children: [
          IconButton(icon: const Icon(Icons.menu), onPressed: () => _scaffoldKey.currentState?.openDrawer()),
          Expanded(
            child: Container(
              height: 44,
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(22), border: Border.all(color: Colors.white24)),
              child: Row(
                children: [
                  _segment('Chat', Icons.chat_bubble_outline, !_isImageTab, () => setState(() => _isImageTab = false)),
                  _segment('Image', Icons.image_outlined, _isImageTab, () => setState(() => _isImageTab = true)),
                ],
              ),
            ),
          ),
          const SizedBox(width: 6),
          InkWell(
            onTap: _newChat,
            borderRadius: BorderRadius.circular(22),
            child: Container(
              width: 44, height: 44,
              decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: Colors.white38)),
              child: const Icon(Icons.add),
            ),
          ),
        ],
      ),
    );
  }

  Widget _segment(String label, IconData icon, bool selected, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(color: selected ? AppColors.primary : Colors.transparent, borderRadius: BorderRadius.circular(18)),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 18, color: selected ? Colors.white : Colors.grey),
              const SizedBox(width: 6),
              Text(label, style: TextStyle(fontWeight: FontWeight.w600, color: selected ? Colors.white : Colors.grey)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDrawer(ChatStore store) {
    return Drawer(
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.fromLTRB(20, 20, 20, 8),
              child: Text('Your Chats', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ),
            ListTile(leading: const Icon(Icons.add), title: const Text('New chat'), onTap: () { Navigator.pop(context); _newChat(); }),
            const Divider(),
            Expanded(
              child: ListView.builder(
                itemCount: store.chats.length,
                itemBuilder: (context, i) {
                  final c = store.chats[i];
                  return ListTile(
                    leading: const Icon(Icons.chat_bubble_outline),
                    title: Text(c.title, maxLines: 1, overflow: TextOverflow.ellipsis),
                    onTap: () {
                      Navigator.pop(context);
                      setState(() => _session = c);
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
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.auto_awesome, size: 48, color: AppColors.primary),
              SizedBox(height: 12),
              Text('What topic do you want to create a video on?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
              SizedBox(height: 6),
              Text('Type below to get your script and visual ideas.', style: TextStyle(color: Colors.grey), textAlign: TextAlign.center),
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

  Widget _buildBubble(ChatMessage m) {
    final maxWidth = MediaQuery.of(context).size.width * 0.8;
    return Align(
      alignment: m.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(maxWidth: maxWidth),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: m.isUser ? AppColors.primary : Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          border: m.isUser ? null : Border.all(color: Colors.white24),
        ),
        child: Text(m.text, style: TextStyle(color: m.isUser ? Colors.white : null, height: 1.5)),
      ),
    );
  }

  Widget _buildWaitingBubble() {
    final maxWidth = MediaQuery.of(context).size.width * 0.8;
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(maxWidth: maxWidth),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white24),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary)),
            SizedBox(width: 10),
            Text('Generating script...'),
          ],
        ),
      ),
    );
  }

  Widget _buildImageTab() {
    final appState = AppStateProvider.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.image_outlined, size: 56, color: Colors.grey),
            const SizedBox(height: 12),
            const Text('Your generated images will appear here.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
            if (!appState.isPremium) ...[
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white24)),
                child: Column(
                  children: [
                    const Icon(Icons.lock, color: Colors.amber),
                    const SizedBox(height: 8),
                    const Text('AI images are available in Premium', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    ElevatedButton(
                      onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PlanScreen())),
                      child: const Text('View Plans'),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInputBox() {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 4, 12, 12),
      padding: const EdgeInsets.fromLTRB(16, 10, 8, 8),
      decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(24), border: Border.all(color: Colors.white24)),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _controller,
            minLines: 2,
            maxLines: 6,
            textCapitalization: TextCapitalization.sentences,
            decoration: const InputDecoration(
              hintText: "Type your video topic here...",
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
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('File attachment will be available soon.')));
                },
              ),
              const Spacer(),
              _hasText
                  ? InkWell(
                      onTap: _send,
                      borderRadius: BorderRadius.circular(24),
                      child: Container(
                        width: 44, height: 44,
                        decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                        child: const Icon(Icons.arrow_upward, color: Colors.white),
                      ),
                    )
                  : IconButton(
                      icon: const Icon(Icons.mic_none),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Voice typing will be available soon.')));
                      },
                    ),
            ],
          ),
        ],
      ),
    );
  }
}
