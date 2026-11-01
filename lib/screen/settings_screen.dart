import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../state/app_state.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text("Settings")),
      body: ListView(
        children: [
          _buildSectionHeader("Account"),
          ListTile(
            leading: const Icon(Icons.person),
            title: const Text("Edit Profile"),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () => _showFeatureDialog(context, "Edit Profile"),
          ),
          ListTile(
            leading: const Icon(Icons.lock),
            title: const Text("Change Password"),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () => _showFeatureDialog(context, "Change Password"),
          ),
          
          _buildSectionHeader("App Preferences"),
          SwitchListTile(
            secondary: const Icon(Icons.dark_mode),
            title: const Text("Dark Mode"),
            value: appState.isDarkMode,
            onChanged: (val) => appState.toggleTheme(val), // Real Theme Toggle
          ),
          ListTile(
            leading: const Icon(Icons.language),
            title: const Text("App Language"),
            subtitle: Text(appState.selectedLanguage),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () => _showLanguagePicker(context, appState),
          ),
          ListTile(
            leading: const Icon(Icons.record_voice_over),
            title: const Text("Default AI Tone"),
            subtitle: Text(appState.defaultTone),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () => _showTonePicker(context, appState),
          ),
          SwitchListTile(
            secondary: const Icon(Icons.notifications),
            title: const Text("Push Notifications"),
            value: appState.notificationsEnabled,
            onChanged: (val) => appState.toggleNotifications(val),
          ),

          _buildSectionHeader("Privacy & Legal"),
          ListTile(
            leading: const Icon(Icons.privacy_tip),
            title: const Text("Privacy Policy"),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () => _showTextDialog(context, "Privacy Policy", "यहाँ आपकी प्राइवेसी पॉलिसी का पूरा टेक्स्ट होगा। हम आपका डेटा सुरक्षित रखते हैं..."),
          ),
          ListTile(
            leading: const Icon(Icons.description),
            title: const Text("Terms & Conditions"),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
            onTap: () => _showTextDialog(context, "Terms & Conditions", "ऐप का उपयोग करने के नियम यहाँ दिए गए हैं..."),
          ),

          _buildSectionHeader("Support & About"),
          ListTile(
            leading: const Icon(Icons.star, color: Colors.amber),
            title: const Text("Rate Us on Play Store"),
            onTap: () => _launchURL("https://play.google.com/store/apps"),
          ),
          ListTile(
            leading: const Icon(Icons.share),
            title: const Text("Share App"),
            onTap: () => _showFeatureDialog(context, "Share App"),
          ),
          ListTile(
            leading: const Icon(Icons.help),
            title: const Text("Help Center"),
            onTap: () => _showFeatureDialog(context, "Help Center"),
          ),
          ListTile(
            leading: const Icon(Icons.info),
            title: const Text("About ScriptD AI"),
            subtitle: const Text("Version 1.0.0"),
            onTap: () => _showTextDialog(context, "About", "ScriptD AI - Made with ❤️ for Indian Creators."),
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey, fontSize: 13)),
    );
  }

  void _showFeatureDialog(BuildContext context, String title) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Text("$title feature जल्द ही अपडेट में आ रहा है।"),
        actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("OK"))],
      ),
    );
  }

  void _showLanguagePicker(BuildContext context, AppState appState) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(title: const Text("English"), onTap: () { appState.setLanguage("English"); Navigator.pop(ctx); }),
          ListTile(title: const Text("Hindi"), onTap: () { appState.setLanguage("Hindi"); Navigator.pop(ctx); }),
          ListTile(title: const Text("Hinglish"), onTap: () { appState.setLanguage("Hinglish"); Navigator.pop(ctx); }),
        ],
      ),
    );
  }

  void _showTonePicker(BuildContext context, AppState appState) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(title: const Text("Documentary"), onTap: () { appState.setTone("Documentary"); Navigator.pop(ctx); }),
          ListTile(title: const Text("Comedy"), onTap: () { appState.setTone("Comedy"); Navigator.pop(ctx); }),
          ListTile(title: const Text("Motivational"), onTap: () { appState.setTone("Motivational"); Navigator.pop(ctx); }),
        ],
      ),
    );
  }

  void _showTextDialog(BuildContext context, String title, String content) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: SingleChildScrollView(child: Text(content)),
        actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Close"))],
      ),
    );
  }

  Future<void> _launchURL(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }
}
