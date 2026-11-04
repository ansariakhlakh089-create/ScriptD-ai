import 'package:flutter/material.dart';
import '../state/app_state.dart';
import '../state/chat_store.dart';
import '../script_package.dart';
import 'creation_screen.dart';
import 'plan_screen.dart';
import 'project_screen.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({Key? key}) : super(key: key);

  @override
  State<ChatScreen> createState() => _ChatBodyState();
}

class _ChatBodyState extends State<ChatScreen> {
  // डेमो डेटा (आप इसे अपने ChatStore से कनेक्ट कर सकते हैं)
  final List<Map<String, dynamic>> messages = [
    {'text': 'नमस्ते! मैं ScriptD AI हूँ। आपको कैसी स्क्रिप्ट चाहिए?', 'isUser': false},
    {'text': 'मुझे मोहनजोदड़ो पर एक डॉक्यूमेंट्री स्क्रिप्ट चाहिए।', 'isUser': true},
  ];
  
  bool isTyping = false; // AI टाइप कर रहा है या नहीं
  bool isImageTab = false; // Toggle: Chat vs Image
  final TextEditingController _textController = TextEditingController();

  // मिसिंग मेथड 1: Image Tab के लिए UI
  Widget _buildImageTab() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.image, size: 80, color: Colors.grey),
          SizedBox(height: 16),
          Text(
            'जब आप कोई स्क्रिप्ट जनरेट करेंगे, \nतो सीन की 8K इमेजेज यहाँ दिखेंगी।',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
        ],
      ),
    );
  }

  // मिसिंग मेथड 2: जब AI रिप्लाई जनरेट कर रहा हो (Loading Bubble)
  Widget _buildWaitingBubble() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.grey[300],
          borderRadius: BorderRadius.circular(15),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 15,
              height: 15,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
            SizedBox(width: 10),
            Text('ScriptD AI सोच रहा है...', style: TextStyle(color: Colors.black54)),
          ],
        ),
      ),
    );
  }

  // मिसिंग मेथड 3: चैट बबल (User और AI मैसेज के लिए)
  Widget _buildBubble(Map<String, dynamic> message) {
    final isUser = message['isUser'] == true;
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 12),
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
        decoration: BoxDecoration(
          color: isUser ? const Color(0xFFFF7A00) : Colors.grey[200], // Orange for user
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(15),
            topRight: const Radius.circular(15),
            bottomLeft: isUser ? const Radius.circular(15) : Radius.zero,
            bottomRight: isUser ? Radius.zero : const Radius.circular(15),
          ),
        ),
        child: Text(
          message['text'] ?? '',
          style: TextStyle(
            color: isUser ? Colors.white : Colors.black87,
            fontSize: 16,
          ),
        ),
      ),
    );
  }

  // मैसेज भेजने का फंक्शन
  void _sendMessage() {
    if (_textController.text.trim().isEmpty) return;

    setState(() {
      messages.add({'text': _textController.text, 'isUser': true});
      _textController.clear();
      isTyping = true;
    });

    // डेमो: 2 सेकंड बाद AI का रिप्लाई आएगा (यहाँ आप अपना API कॉल लगाएंगे)
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          isTyping = false;
          messages.add({
            'text': 'मैं आपके लिए इस टॉपिक पर रिसर्च कर रहा हूँ और स्क्रिप्ट तैयार कर रहा हूँ...',
            'isUser': false
          });
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ScriptD AI Studio'),
        actions: [
          // "2 scripts left" बैज
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.orange.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.orange),
            ),
            child: const Center(
              child: Text(
                '2 scripts left',
                style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ),
          )
        ],
      ),
      body: Column(
        children: [
          // Chat / Image Toggle Button
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ToggleButtons(
                  isSelected: [!isImageTab, isImageTab],
                  onPressed: (index) {
                    setState(() {
                      isImageTab = index == 1;
                    });
                  },
                  borderRadius: BorderRadius.circular(20),
                  selectedColor: Colors.white,
                  fillColor: const Color(0xFFFF7A00),
                  children: const [
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 20),
                      child: Text('Chat'),
                    ),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 20),
                      child: Text('Image'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // मुख्य कंटेंट एरिया
          Expanded(
            child: isImageTab
                ? _buildImageTab() // अगर Image टैब चुना है
                : ListView.builder(
                    // अगर Chat टैब चुना है
                    itemCount: messages.length + (isTyping ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == messages.length && isTyping) {
                        return _buildWaitingBubble();
                      }
                      return _buildBubble(messages[index]);
                    },
                  ),
          ),

          // नीचे का Input Area
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                )
              ],
            ),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.mic, color: Colors.grey),
                  onPressed: () {
                    // माइक (Speech to Text) का लॉजिक यहाँ आएगा
                  },
                ),
                Expanded(
                  child: TextField(
                    controller: _textController,
                    decoration: InputDecoration(
                      hintText: 'नया स्क्रिप्ट शुरू करें...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(30),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: Colors.grey[100],
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  backgroundColor: const Color(0xFFFF7A00),
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white, size: 20),
                    onPressed: _sendMessage,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
