import 'package:flutter/material.dart';
import '../theme.dart';
import '../state/app_state.dart';
import '../widgets/custom_button.dart';

class PlanScreen extends StatelessWidget {
  const PlanScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Plan स्क्रीन का रंग: Slate (Settings वाला)
    return const PaletteTheme(bg: AppPalette.slate, child: _PlanBody());
  }
}

class _PlanBody extends StatelessWidget {
  const _PlanBody();

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Your Plan')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _buildCurrentPlan(context, appState),
          const SizedBox(height: 24),
          const Text(
            'Plans',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          _planCard(
            context,
            title: 'Free',
            price: 'Rs 0',
            highlight: !appState.isPremium,
            points: [
              '${appState.freeLimit} free scripts',
              'Script + har scene ka visual prompt',
              'Ad dekhkar 1 extra script',
            ],
          ),
          _planCard(
            context,
            title: 'Pay per script',
            price: 'Rs 49 / script',
            highlight: false,
            points: const [
              'Ek gehri research wali script',
              'Visual prompts ke saath',
              'Bina subscription ke',
            ],
          ),
          _planCard(
            context,
            title: 'Premium',
            price: 'Jaldi aayega',
            highlight: appState.isPremium,
            points: const [
              'Zyada scripts har mahine',
              'Har scene ki AI image',
              'Bina ads',
            ],
          ),
          if (kDemoMode) ...[
            const SizedBox(height: 20),
            const Divider(),
            const SizedBox(height: 8),
            const Text(
              'Demo buttons (sirf testing ke liye)',
              style: TextStyle(color: Colors.grey, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            CustomButton(
              text: 'Ad dekho (+1 script) - demo',
              icon: Icons.play_circle_outline,
              isOutline: true,
              onPressed: () {
                appState.addCredit();
                _snack(context, '1 script mil gayi (demo)');
              },
            ),
            const SizedBox(height: 10),
            CustomButton(
              text: 'Rs 49 mein 1 script - demo',
              icon: Icons.shopping_bag_outlined,
              isOutline: true,
              onPressed: () {
                appState.addCredit();
                _snack(context, '1 script mil gayi (demo)');
              },
            ),
            const SizedBox(height: 10),
            CustomButton(
              text: appState.isPremium
                  ? 'Premium band karo - demo'
                  : 'Premium chalu karo - demo',
              icon: Icons.workspace_premium_outlined,
              onPressed: () {
                if (appState.isPremium) {
                  appState.disablePremium();
                } else {
                  appState.enablePremium();
                }
              },
            ),
          ],
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  void _snack(BuildContext context, String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  Widget _buildCurrentPlan(BuildContext context, AppState appState) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.12),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            appState.isPremium ? 'Premium Plan' : 'Free Plan',
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 12),
          if (appState.isPremium)
            const Text('Unlimited scripts (demo)')
          else ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: appState.usageProgress,
                minHeight: 10,
                backgroundColor: Colors.white24,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Free scripts: ${appState.scriptsUsed.clamp(0, appState.freeLimit)}'
              ' / ${appState.freeLimit} use hui',
            ),
            const SizedBox(height: 4),
            Text('Extra scripts: ${appState.paidCredits}'),
            const SizedBox(height: 4),
            Text(
              'Kul bachi hui: ${appState.scriptsLeft}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ],
      ),
    );
  }

  Widget _planCard(
    BuildContext context, {
    required String title,
    required String price,
    required bool highlight,
    required List<String> points,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: highlight ? AppColors.primary : Colors.white24,
          width: highlight ? 1.5 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Spacer(),
              Text(
                price,
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ...points.map(
            (p) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text('✓ $p', style: const TextStyle(height: 1.4)),
            ),
          ),
        ],
      ),
    );
  }
}
