import 'package:flutter/material.dart';
import '../theme.dart';
import '../state/app_state.dart';

class PlanScreen extends StatelessWidget {
  const PlanScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PaletteTheme(darkBg: AppPalette.slate, lightBg: AppPalette.peanut, child: _PlanBody());
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
          const Text('Available Plans', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _planCard(
            context,
            title: 'Free',
            price: 'Rs 0',
            highlight: !appState.isPremium,
            points: ['${appState.freeLimit} free scripts', 'Script + visual prompt for every scene', 'Watch ads for extra scripts'],
          ),
          _planCard(
            context,
            title: 'Pay per script',
            price: 'Rs 49 / script',
            highlight: false,
            points: const ['One in-depth researched script', 'Includes visual prompts', 'No subscription required'],
          ),
          _planCard(
            context,
            title: 'Premium',
            price: 'Coming Soon',
            highlight: appState.isPremium,
            points: const ['More scripts every month', 'AI image generation for every scene', 'Ad-free experience'],
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildCurrentPlan(BuildContext context, AppState appState) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.12), borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.primary)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(appState.isPremium ? 'Premium Plan' : 'Free Plan', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.primary)),
          const SizedBox(height: 12),
          if (appState.isPremium)
            const Text('Unlimited scripts')
          else ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(value: appState.usageProgress, minHeight: 10, backgroundColor: Colors.white24, color: AppColors.primary),
            ),
            const SizedBox(height: 10),
            Text('Free scripts: ${appState.scriptsUsed.clamp(0, appState.freeLimit)} / ${appState.freeLimit} used'),
            const SizedBox(height: 4),
            Text('Extra credits: ${appState.paidCredits}'),
            const SizedBox(height: 4),
            Text('Total remaining: ${appState.scriptsLeft}', style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ],
      ),
    );
  }

  Widget _planCard(BuildContext context, {required String title, required String price, required bool highlight, required List<String> points}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: highlight ? AppColors.primary : Colors.white24, width: highlight ? 1.5 : 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
              const Spacer(),
              Text(price, style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 10),
          ...points.map((p) => Padding(padding: const EdgeInsets.only(bottom: 4), child: Text('✓ $p', style: const TextStyle(height: 1.4)))),
        ],
      ),
    );
  }
}
