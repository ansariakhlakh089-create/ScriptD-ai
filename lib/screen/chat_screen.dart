import 'package:flutter/material.dart';
import '../theme.dart';
import '../state/app_state.dart';
import 'plan_screen.dart';

class _Msg {
  final String text;
  final bool isUser;
  const _Msg(this.text, this.isUser);
}

class ChatScreen extends StatelessWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Chat स्क्रीन का रंग: Slate
    return const PaletteTheme(bg: AppPalette.slate, child: _ChatBody());
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

  final List<_Msg> _messages = [];
  bool _isImageTab = false;
  bool _isWaiting = false;
  bool _hasText = false;
  int _chatId = 0; // नई चैट खुलने पर पुराना जवाब न जुड़े, इसलिए

  @override
  void initState() {
    super.initState();
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
      _chatId++;
      _messages.clear();
      _isWaiting = false;
      _isImageTab = false;
    });
    _controller.clear();
  }

  void _send() {
    final text = _controller.text.trim();
    if (text.isEmpty || _isWaiting) return;

    final appState = AppStateProvider.of(context);
    if (!appState.canCreateScript) {
      _showLimitDialog();
      return;
    }
    appState.consumeScriptCredit();

    final id = _chatId;
    setState(() {
      _messages.add(_Msg(text, true));
      _isWaiting = true;
    });
    _controller.clear();
    _scrollDown();

    // TODO: यहाँ असली AI (सर्वर: Perplexity -> Gemini -> Claude) जोड़ना है
    Future.delayed(const Duration(seconds: 4), () {
      if (!mounted || id != _chatId) return;
      setState(() {
        _messages.add(_Msg(
          'Yeh ek demo jawab hai. Yahan asli script aayegi '
          '(research + hook + scene-wise visual prompts).\n\n'
          'Aapne likha tha: "$text"',
          false,
        ));
        _isWaiting = false;
      });
      _scrollDown();
    });
  }

  void _showLimitDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Free limit khatam!'),
        content: const Text(
          'Aapki free scripts khatam ho gayi hain. '
          'Ad dekhkar ya chhota pack lekar aur scripts paa sakte hain.',
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
            ListTile(
              leading: const Icon(Icons.photo_outlined),
              title: const Text('Photo'),
              onTap: () {
                Navigator.pop(ctx);
                _snack('Photo upload jaldi aayega');
              },
            ),
            ListTile(
              leading: const Icon(Icons.description_outlined),
              title: const Text('Document'),
              onTap: () {
                Navigator.pop(ctx);
                _snack('Document upload jaldi aayega');
              },
            ),
            ListTile(
              leading: const Icon(Icons.attach_file),
              title: const Text('File'),
              onTap: () {
                Navigator.pop(ctx);
                _snack('File upload jaldi aayega');
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

    return Scaffold(
      key: _scaffoldKey,
      drawer: _buildDrawer(),
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
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.12),
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
            _buildTopBar(),
            Expanded(child: _isImageTab ? _buildImageTab() : _buildChatList()),
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
                  _segment('Chat', Icons.chat_bubble_outline, !_isImageTab,
                      () => setState(() => _isImageTab = false)),
                  _segment('Image', Icons.image_outlined, _isImageTab,
                      () => setState(() => _isImageTab = true)),
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
            onSelected: (v) {
              if (v == 'clear') {
                _newChat();
              } else {
                _snack('Yeh feature jaldi aayega');
              }
            },
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'clear', child: Text('Clear chat')),
              PopupMenuItem(value: 'share', child: Text('Share (jaldi aayega)')),
            ],
          ),
        ],
      ),
    );
  }

  Widget _segment(
      String label, IconData icon, bool selected, VoidCallback onTap) {
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
              Icon(icon,
                  size: 18, color: selected ? Colors.white : Colors.grey),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: selected ? Colors.white : Colors.grey,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDrawer() {
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
              leading: const Icon(Icons.add),
              title: const Text('New chat'),
              onTap: () {
                Navigator.pop(context);
                _newChat();
              },
            ),
            const Divider(),
            if (kDemoMode) ...[
              const ListTile(
                leading: Icon(Icons.chat_bubble_outline),
                title: Text('Overthinking par 10 min ki video'),
                subtitle: Text('Demo'),
              ),
              const ListTile(
                leading: Icon(Icons.chat_bubble_outline),
                title: Text('Bulb ka avishkar kaise hua'),
                subtitle: Text('Demo'),
              ),
            ] else
              const Padding(
                padding: EdgeInsets.all(20),
                child: Text(
                  'Aapki purani chats yahan dikhengi.',
                  style: TextStyle(color: Colors.grey),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildChatList() {
    if (_messages.isEmpty && !_isWaiting) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
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
                style: TextStyle(color: Colors.grey),
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
      itemCount: _messages.length + (_isWaiting ? 1 : 0),
      itemBuilder: (context, i) {
        if (i == _messages.length) return _buildWaitingBubble();
        return _buildBubble(_messages[i]);
      },
    );
  }

  Widget _buildBubble(_Msg m) {
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
        child: Text(
          m.text,
          style: TextStyle(
            color: m.isUser ? Colors.white : null,
            height: 1.5,
          ),
        ),
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
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppColors.primary,
                  ),
                ),
                SizedBox(width: 10),
                Text('Research ho rahi hai...'),
              ],
            ),
            if (kDemoMode) ...[
              const SizedBox(height: 12),
              Container(
                height: 90,
                width: double.infinity,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: Colors.grey.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text(
                  'Ad (demo) - yahan ad aayega',
                  style: TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ),
            ],
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
            const Text(
              'Aapki banayi hui tasveerein yahan dikhengi.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            if (!appState.isPremium) ...[
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).cardColor,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.white24),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.lock, color: Colors.amber),
                    const SizedBox(height: 8),
                    const Text(
                      'AI images Premium mein milengi',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 10),
                    ElevatedButton(
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const PlanScreen()),
                      ),
                      child: const Text('Plans dekhein'),
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
                        child:
                            const Icon(Icons.arrow_upward, color: Colors.white),
                      ),
                    )
                  : IconButton(
                      icon: const Icon(Icons.mic_none),
                      onPressed: () => _snack('Voice typing jaldi aayega'),
                    ),
            ],
          ),
        ],
      ),
    );
  }
}
