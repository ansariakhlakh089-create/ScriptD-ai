import 'package:flutter/material.dart';
import '../theme.dart';
import '../state/app_state.dart';
import '../state/chat_store.dart';
import 'plan_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PaletteTheme(
      dark: AppPalette.slate,
      light: AppPalette.peanut,
      child: _ProfileBody(),
    );
  }
}

class _ProfileBody extends StatefulWidget {
  const _ProfileBody();

  @override
  State<_ProfileBody> createState() => _ProfileBodyState();
}

class _ProfileBodyState extends State<_ProfileBody> {
  late TextEditingController _nameCtrl;
  late TextEditingController _channelCtrl;
  late TextEditingController _emailCtrl;
  bool _initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_initialized) {
      final appState = AppStateProvider.of(context);
      _nameCtrl = TextEditingController(text: appState.userName);
      _channelCtrl = TextEditingController(text: appState.channelName);
      _emailCtrl = TextEditingController(text: appState.userEmail);
      _initialized = true;
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _channelCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  void _saveProfile(AppState appState) {
    appState.updateProfile(
      name: _nameCtrl.text,
      email: _emailCtrl.text,
      channel: _channelCtrl.text,
    );
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Creator Profile save ho gaya!')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);
    final store = ChatStoreProvider.of(context);
    final initial = appState.userName.isNotEmpty
        ? appState.userName[0].toUpperCase()
        : 'C';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Creator Profile'),
        actions: [
          TextButton(
            onPressed: () => _saveProfile(appState),
            child: const Text(
              'Save',
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Center(
            child: CircleAvatar(
              radius: 44,
              backgroundColor: AppColors.primary,
              child: Text(
                initial,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 34,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Center(
            child: Text(
              appState.activePlanName,
              style: const TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 20),

          // क्रिएटर के आंकड़े (Stats Cards)
          Row(
            children: [
              _statBox('Chats', '${store.chats.length}', Icons.chat_outlined),
              const SizedBox(width: 10),
              _statBox(
                'Scripts',
                '${store.creations.length}',
                Icons.auto_awesome_outlined,
              ),
              const SizedBox(width: 10),
              _statBox(
                'Projects',
                '${store.projects.length}',
                Icons.folder_outlined,
              ),
            ],
          ),

          const SizedBox(height: 24),
          const Text(
            'Channel & Personal Details',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),

          _inputCard(
            label: 'Your Name',
            icon: Icons.person_outline,
            controller: _nameCtrl,
          ),
          const SizedBox(height: 12),
          _inputCard(
            label: 'YouTube / Instagram Channel Name',
            icon: Icons.videocam_outlined,
            controller: _channelCtrl,
          ),
          const SizedBox(height: 12),
          _inputCard(
            label: 'Email ID',
            icon: Icons.email_outlined,
            controller: _emailCtrl,
            keyboardType: TextInputType.emailAddress,
          ),

          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              onPressed: () => _saveProfile(appState),
              icon: const Icon(Icons.check_circle_outline),
              label: const Text(
                'Save Profile Changes',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.white,
              side: const BorderSide(color: Colors.white30),
              padding: const EdgeInsets.symmetric(vertical: 13),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const PlanScreen()),
            ),
            icon: const Icon(Icons.workspace_premium, color: AppColors.primary),
            label: const Text('Manage Subscription & Credits'),
          ),
        ],
      ),
    );
  }

  Widget _statBox(String label, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white24),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppColors.primary, size: 22),
            const SizedBox(height: 6),
            Text(
              value,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(fontSize: 12, color: Colors.white70),
            ),
          ],
        ),
      ),
    );
  }

  Widget _inputCard({
    required String label,
    required IconData icon,
    required TextEditingController controller,
    TextInputType? keyboardType,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white24),
      ),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, color: AppColors.primary),
          border: InputBorder.none,
        ),
      ),
    );
  }
}
