import 'package:flutter/material.dart';
import '../theme.dart';
import '../state/app_state.dart';
import 'plan_screen.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Settings का रंग: Slate
    return const PaletteTheme(bg: AppPalette.slate, child: _SettingsBody());
  }
}

class _SettingsBody extends StatelessWidget {
  const _SettingsBody();

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final initial = appState.userEmail.isNotEmpty
        ? appState.userEmail[0].toUpperCase()
        : 'U';

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
          // गोल फोटो + ईमेल (डमी — Google लॉगिन जुड़ने पर असली)
          const SizedBox(height: 12),
          Center(
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
          const SizedBox(height: 10),
          Center(
            child: Text(
              appState.userEmail,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
            ),
          ),
          const SizedBox(height: 16),

          // Plan कार्ड — दबाने पर Plan स्क्रीन खुलेगी
          _planCard(context, appState),
          const SizedBox(height: 8),

          // 1) Profile (सबसे ऊपर)
          _row(
            icon: Icons.person_outline,
            title: 'Profile',
            onTap: () => _showInfo(
              context,
              'Profile',
              'Profile edit Google login judne ke baad kaam karega.',
            ),
          ),
          // 2) Account settings
          _row(
            icon: Icons.manage_accounts_outlined,
            title: 'Account settings',
            onTap: () => _showInfo(
              context,
              'Account settings',
              'Account settings login judne ke baad kaam karengi.',
            ),
          ),
          // 3) Language (असली — सेव होती है)
          _row(
            icon: Icons.language,
            title: 'Language',
            subtitle: appState.selectedLanguage,
            onTap: () => _showPicker(
              context,
              'Language',
              const ['English', 'Hindi', 'Hinglish'],
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
              const ['Light', 'Dark'],
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
              const ['Documentary', 'Comedy', 'Motivational'],
              appState.defaultTone,
              appState.setTone,
            ),
          ),
          // 6) Service agreement
          _row(
            icon: Icons.description_outlined,
            title: 'Service agreement',
            onTap: () => _showInfo(
              context,
              'Service agreement',
              'Yahan app ke use ke niyam (Terms & Conditions) ka poora text hoga.',
            ),
          ),
          // 7) Help & feedback
          _row(
            icon: Icons.help_outline,
            title: 'Help & feedback',
            onTap: () => _showInfo(
              context,
              'Help & feedback',
              'Support aur feedback ka option jaldi judega.',
            ),
          ),
          // 8) Font style
          _row(
            icon: Icons.text_fields,
            title: 'Font style',
            onTap: () => _showInfo(
              context,
              'Font style',
              'Font style ka option jaldi aayega.',
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
          // 10) Privacy
          _row(
            icon: Icons.privacy_tip_outlined,
            title: 'Privacy',
            onTap: () => _showInfo(
              context,
              'Privacy',
              'Yahan aapki privacy policy ka poora text hoga. '
                  'Hum aapka data surakshit rakhte hain.',
            ),
          ),
          // 11) Log out
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Log out', style: TextStyle(color: Colors.red)),
            onTap: () => _showInfo(
              context,
              'Log out',
              'Log out login judne ke baad kaam karega.',
            ),
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
          color: AppColors.primary.withOpacity(0.12),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.primary),
        ),
        child: Row(
          children: [
            const Icon(Icons.workspace_premium_outlined,
                color: AppColors.primary),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    appState.isPremium ? 'Premium Plan' : 'Free Plan',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    appState.isPremium
                        ? 'Unlimited scripts (demo)'
                        : '${appState.scriptsLeft} scripts bachi hain',
                    style: const TextStyle(fontSize: 13, color: Colors.grey),
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
        content: SingleChildScrollView(child: Text(content)),
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
