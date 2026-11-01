import 'package:flutter/material.dart';
import '../theme.dart';
import '../state/app_state.dart';
import 'settings_screen.dart'; // <-- यह इम्पोर्ट करें

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SettingsScreen()), // <-- सेटिंग्स पर जाएँ
              );
            },
          )
        ],
      ),
      body: SingleChildScrollView(
        // ... (बाकी कोड वही रहेगा जो पहले था, जैसे CircleAvatar और Premium Card)
        // बस ध्यान रखें कि यहाँ Colors.white की जगह Theme.of(context).cardColor का इस्तेमाल करें 
        // ताकि डार्क मोड में कार्ड्स भी डार्क दिखें।
      ),
    );
  }
}
