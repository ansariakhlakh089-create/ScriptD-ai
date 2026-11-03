import 'package:flutter/material.dart';
import '../theme.dart';
import '../state/app_state.dart';
import '../state/chat_store.dart';
import 'plan_screen.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Settings का रंग: Slate
    return const PaletteTheme(
      dark: AppPalette.slate,
      light: AppPalette.peanut,
      child: _SettingsBody(),
    );
  }
}

class _SettingsBody extends StatelessWidget {
  const _SettingsBody();

  void _snack(BuildContext context, String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  // 1) असली Profile Edit डायलॉग (नाम, चैनल, ईमेल सेव करता है)
  void _showEditProfileDialog(BuildContext context, AppState appState) {
    final nameCtrl = TextEditingController(text: appState.userName);
    final channelCtrl = TextEditingController(text: appState.channelName);
    final emailCtrl = TextEditingController(text: appState.userEmail);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Edit Profile'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(
                  labelText: 'Creator Name',
                  prefixIcon: Icon(Icons.person_outline),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: channelCtrl,
                decoration: const InputDecoration(
                  labelText: 'YouTube / Instagram Channel Name',
                  prefixIcon: Icon(Icons.video_library_outlined),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: emailCtrl,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Email Address',
                  prefixIcon: Icon(Icons.email_outlined),
                ),
              ),
            ],
          ),
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
              appState.updateProfile(
                name: nameCtrl.text,
                email: emailCtrl.text,
                channel: channelCtrl.text,
              );
              Navigator.pop(ctx);
              _snack(context, 'Profile save ho gaya!');
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  // 2) असली Account Settings शीट (क्रेडिट रीसेट, हिस्ट्री क्लियर, अकाउंट समरी)
  void _showAccountSettingsDialog(BuildContext context, AppState appState) {
    final store = ChatStoreProvider.read(context);
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Padding(
                padding: EdgeInsets.all(14),
                child: Text(
                  'Account Settings & Data',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.verified_user_outlined,
                    color: AppColors.primary),
                title: Text('Plan: ${appState.activePlanName}'),
                subtitle: Text(
                  'Saved Chats: ${store.chats.length}  •  Saved Creations: ${store.creations.length}  •  Projects: ${store.projects.length}',
                ),
              ),
              ListTile(
                leading: const Icon(Icons.refresh, color: Colors.amber),
                title: const Text('Reset Free Trial Credits (Testing)'),
                subtitle:
                    const Text('2 Free Scripts ko dobara test karne ke liye'),
                onTap: () {
                  Navigator.pop(ctx);
                  appState.resetFreeCreditsForTesting();
                  _snack(context, 'Free script credits reset ho gaye!');
                },
              ),
              ListTile(
                leading:
                    const Icon(Icons.delete_sweep_outlined, color: Colors.red),
                title: const Text(
                  'Clear All Saved Chats',
                  style: TextStyle(color: Colors.red),
                ),
                onTap: () {
                  Navigator.pop(ctx);
                  for (final c in List.of(store.chats)) {
                    store.deleteChat(c.id);
                  }
                  _snack(context, 'Saari chats clear ho gayi!');
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  // 3) असली Help & Feedback डायलॉग
  void _showFeedbackDialog(BuildContext context, AppState appState) {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Help & Feedback'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Aapko ScriptD AI mein kya pasand aaya ya kya naya chahiye? Neeche likhein:',
                style: TextStyle(fontSize: 13.5),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: ctrl,
                maxLines: 4,
                decoration: const InputDecoration(
                  hintText: 'Apna sujhaav ya sawal yahan likhein...',
                  border: OutlineInputBorder(),
                ),
              ),
              if (appState.feedbackHistory.isNotEmpty) ...[
                const SizedBox(height: 14),
                const Text(
                  'Aapke pichhle feedbacks:',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5),
                ),
                const SizedBox(height: 4),
                ...appState.feedbackHistory.take(3).map(
                      (f) => Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Text(
                          '• $f',
                          style: const TextStyle(
                              fontSize: 12, color: Colors.white70),
                        ),
                      ),
                    ),
              ],
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              final msg = ctrl.text.trim();
              if (msg.isEmpty) return;
              appState.submitFeedback(msg);
              Navigator.pop(ctx);
              _snack(context, 'Shukriya! Aapka feedback save ho gaya.');
            },
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }

  // 4) असली Log out कन्फर्मेशन
  void _confirmLogout(BuildContext context, AppState appState) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Log out karein?'),
        content: const Text(
          'Aapki banayi hui scripts aur projects aapke phone mein surakshit rahengi.',
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
            onPressed: () async {
              Navigator.pop(ctx);
              await appState.logout();
              if (context.mounted) {
                Navigator.of(context).popUntil((route) => route.isFirst);
              }
            },
            child: const Text('Log out'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final initial = appState.userName.isNotEmpty
        ? appState.userName[0].toUpperCase()
        : (appState.userEmail.isNotEmpty
            ? appState.userEmail[0].toUpperCase()
            : 'C');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        children: [
          const SizedBox(height: 12),
          Center(
            child: GestureDetector(
              onTap: () => _showEditProfileDialog(context, appState),
              child: CircleAvatar(
                radius: 38,
                backgroundColor: AppColors.primary,
                child: Text(
                  initial,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          Center(
            child: Text(
              appState.userName,
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 2),
          Center(
            child: Text(
              '${appState.channelName}  •  ${appState.userEmail}',
              style: const TextStyle(fontSize: 13, color: Colors.white70),
            ),
          ),
          const SizedBox(height: 16),

          // Plan कार्ड — दबाने पर Plan स्क्रीन खुलेगी
          _planCard(context, appState),
          const SizedBox(height: 8),

          // 1) Profile (असली — नाम/चैनल/ईमेल बदल सकते हैं)
          _row(
            icon: Icons.person_outline,
            title: 'Profile',
            subtitle: '${appState.userName} (${appState.channelName})',
            onTap: () => _showEditProfileDialog(context, appState),
          ),
          // 2) Account settings (असली)
          _row(
            icon: Icons.manage_accounts_outlined,
            title: 'Account settings',
            subtitle: appState.userEmail,
            onTap: () => _showAccountSettingsDialog(context, appState),
          ),
          // 3) Language (असली — सेव होती है)
          _row(
            icon: Icons.language,
            title: 'Language',
            subtitle: appState.selectedLanguage,
            onTap: () => _showPicker(
              context,
              'Language',
              const ['Hinglish', 'Hindi', 'English'],
              appState.selectedLanguage,
              appState.setLanguage,
            ),
          ),
          // 4) Themes (असली — डार्क/लाइट)
          _row(
            icon: Icons.palette_outlined,
            title: 'Themes',
            subtitle: appState.isDarkMode ? 'Dark' : 'Light',
            onTap: () => _showPicker(
              context,
              'Theme',
              const ['Dark', 'Light'],
              appState.isDarkMode ? 'Dark' : 'Light',
              (v) => appState.toggleTheme(v == 'Dark'),
            ),
          ),
          // 5) Personalization (असली — default tone सेव होता है)
          _row(
            icon: Icons.tune,
            title: 'Personalization',
            subtitle: 'Default tone: ${appState.defaultTone}',
            onTap: () => _showPicker(
              context,
              'Default AI Tone',
              const [
                'Documentary',
                'Mystery / Thriller',
                'Comedy',
                'Motivational',
              ],
              appState.defaultTone,
              appState.setTone,
            ),
          ),
          // 6) Service agreement (असली नियम)
          _row(
            icon: Icons.description_outlined,
            title: 'Service agreement',
            onTap: () => _showInfo(
              context,
              'Service Agreement (Terms of Use)',
              '1. ScriptD AI भारतीय कंटेंट क्रिएटर्स के लिए एक वीडियो स्क्रिप्ट और विजुअल प्रॉम्प्ट असिस्टेंट है।\n\n'
                  '2. आपके द्वारा जनरेट की गई सभी स्क्रिप्ट्स, टाइटल्स और सीन प्रॉम्प्ट्स पर आपका 100% कॉपीराइट और व्यावसायिक अधिकार (Commercial Rights) है।\n\n'
                  '3. नॉर्मल चैट पर कोई स्क्रिप्ट क्रेडिट नहीं कटता; केवल फुल शॉर्ट या लॉन्ग स्क्रिप्ट जनरेट करने पर 1 क्रेडिट उपयोग होता है।\n\n'
                  '4. किसी भी गैर-कानूनी या नफरत फैलाने वाले कंटेंट के लिए ऐप का दुरुपयोग वर्जित है।',
            ),
          ),
          // 7) Help & feedback (असली फीडबैक फॉर्म)
          _row(
            icon: Icons.help_outline,
            title: 'Help & feedback',
            onTap: () => _showFeedbackDialog(context, appState),
          ),
          // 8) Font style (असली — पूरे ऐप का फॉन्ट बदलता है)
          _row(
            icon: Icons.text_fields,
            title: 'Font style',
            subtitle: appState.fontStyle,
            onTap: () => _showPicker(
              context,
              'Font style',
              const ['Default', 'Serif (Classic)', 'Monospace (Script)'],
              appState.fontStyle,
              appState.setFontStyle,
            ),
          ),
          // 9) Notification (असली — सेव होता है)
          ListTile(
            leading: const Icon(Icons.notifications_none),
            title: const Text('Notification'),
            trailing: Switch(
              value: appState.notificationsEnabled,
              activeColor: AppColors.primary,
              onChanged: appState.toggleNotifications,
            ),
          ),
          // 10) Privacy (असली प्राइवेसी पॉलिसी)
          _row(
            icon: Icons.privacy_tip_outlined,
            title: 'Privacy',
            onTap: () => _showInfo(
              context,
              'Privacy Policy',
              '1. आपकी सभी चैट्स, स्क्रिप्ट्स (Creations) और प्रोजेक्ट फोल्डर्स आपके फोन की सुरक्षित मेमोरी में सेव रहते हैं।\n\n'
                  '2. हम आपकी निजी स्क्रिप्ट्स या वीडियो आइडियाज किसी तीसरे पक्ष को नहीं बेचते।\n\n'
                  '3. आप कभी भी Account Settings में जाकर अपनी पूरी चैट हिस्ट्री एक क्लिक में हटा सकते हैं।',
            ),
          ),
          // 11) Log out (असली — लॉगिन स्क्रीन पर वापस ले जाता है)
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.redAccent),
            title: const Text(
              'Log out',
              style: TextStyle(color: Colors.redAccent),
            ),
            onTap: () => _confirmLogout(context, appState),
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _planCard(BuildContext context, AppState appState) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const PlanScreen()),
      ),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.14),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.primary),
        ),
        child: Row(
          children: [
            const Icon(
              Icons.workspace_premium_outlined,
              color: AppColors.primary,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    appState.activePlanName,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    appState.isPremium
                        ? 'VIP Long + Short scripts active'
                        : '${appState.scriptsLeft} scripts bachi hain (Tap to upgrade)',
                    style: const TextStyle(fontSize: 13, color: Colors.white70),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right),
          ],
        ),
      ),
    );
  }

  Widget _row({
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: subtitle == null ? null : Text(subtitle),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }

  void _showInfo(BuildContext context, String title, String content) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: SingleChildScrollView(
          child: Text(content, style: const TextStyle(height: 1.5)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showPicker(
    BuildContext context,
    String title,
    List<String> options,
    String current,
    void Function(String) onSelect,
  ) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            ...options.map(
              (o) => ListTile(
                title: Text(o),
                trailing: o == current
                    ? const Icon(Icons.check, color: AppColors.primary)
                    : null,
                onTap: () {
                  onSelect(o);
                  Navigator.pop(ctx);
                },
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
