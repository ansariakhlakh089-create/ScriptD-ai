import 'dart:async';
import 'package:flutter/material.dart';
import '../theme.dart';
import '../state/app_state.dart';

class PlanScreen extends StatelessWidget {
  const PlanScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PaletteTheme(
      dark: AppPalette.slate,
      light: AppPalette.peanut,
      child: _PlanBody(),
    );
  }
}

class _PlanBody extends StatefulWidget {
  const _PlanBody();

  @override
  State<_PlanBody> createState() => _PlanBodyState();
}

class _PlanBodyState extends State<_PlanBody> {
  bool _watchingAd = false;
  int _adSecondsLeft = 0;

  void _snack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  Future<void> _watchAdForScript(AppState appState) async {
    if (_watchingAd) return;
    setState(() {
      _watchingAd = true;
      _adSecondsLeft = 5;
    });

    for (int i = 5; i > 0; i--) {
      if (!mounted) return;
      setState(() => _adSecondsLeft = i);
      await Future.delayed(const Duration(seconds: 1));
    }

    if (!mounted) return;
    setState(() => _watchingAd = false);
    appState.rewardAdCredit();
    _snack('🎉 +1 Extra Script aapke account mein jud gayi!');
  }

  void _confirmTopUp(
    BuildContext context,
    AppState appState, {
    required String title,
    required String price,
    required int creditsToAdd,
  }) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Text(
          '$price mein aapko +$creditsToAdd VIP Script credits milengi.\n\n'
          'Abhi local testing mode mein ise turant activate karein?',
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
              Navigator.pop(ctx);
              appState.addCredit(creditsToAdd);
              _snack('✅ +$creditsToAdd Scripts aapke balance mein jud gayi!');
            },
            child: Text('Activate ($price)'),
          ),
        ],
      ),
    );
  }

  void _confirmSubscription(
    BuildContext context,
    AppState appState, {
    required String planName,
    required String priceLabel,
  }) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(planName),
        content: Text(
          '$priceLabel plan chalu karne par aapko har mahine VIP Long + Short scripts, '
          'har scene ke 8K visual prompts aur AI images milengi.',
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
              Navigator.pop(ctx);
              appState.enablePremium('$planName ($priceLabel)');
              _snack('👑 $planName सफलतापूर्वक चालू हो गया!');
            },
            child: const Text('Enable Plan'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = AppStateProvider.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Plan'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
        children: [
          // ==================== 1. CURRENT PLAN STATUS CARD ====================
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.primary, width: 1.4),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  appState.isPremium ? appState.activePlanName : 'Free Plan',
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: appState.usageProgress,
                    minHeight: 10,
                    backgroundColor: Colors.white24,
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Free scripts: ${appState.scriptsUsed} / ${appState.freeLimit} use hui',
                  style: const TextStyle(fontSize: 14.5),
                ),
                const SizedBox(height: 4),
                Text(
                  'Extra scripts: ${appState.paidCredits}',
                  style: const TextStyle(fontSize: 14.5),
                ),
                const SizedBox(height: 6),
                Text(
                  appState.isPremium
                      ? 'Kul bachi hui: Unlimited (VIP Active)'
                      : 'Kul bachi hui: ${appState.scriptsLeft}',
                  style: const TextStyle(
                    fontSize: 15.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 22),
          const Text(
            'Plans',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),

          // ==================== 2. FREE PLAN CARD ====================
          _buildPlanCard(
            context,
            title: 'Free',
            price: 'Rs 0',
            isHighlighted: !appState.isPremium,
            features: const [
              '2 free scripts (Short ya Long)',
              'Script + har scene ka 8K visual prompt',
              'Normal chat bilkul free (0 credit cut)',
              'Ad dekhkar 1 extra script',
            ],
            actionWidget: SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white,
                  side: const BorderSide(color: AppColors.primary),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed:
                    _watchingAd ? null : () => _watchAdForScript(appState),
                icon: const Icon(Icons.play_circle_outline,
                    color: AppColors.primary),
                label: Text(
                  _watchingAd
                      ? 'Ad chal raha hai... (${_adSecondsLeft}s)'
                      : 'Ad dekho (+1 extra script paayein)',
                ),
              ),
            ),
          ),

          // ==================== 3. SHORT SCRIPT MICRO TOP-UP (Rs 19) ====================
          _buildPlanCard(
            context,
            title: 'Short Script Pack (Reels/Shorts)',
            price: 'Rs 19 / pack',
            features: const [
              '5 viral Short / Reel scripts (60 sec)',
              'Har scene ke 9:16 vertical visual prompts',
              'Bina kisi monthly subscription ke',
            ],
            actionWidget: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black87,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: () => _confirmTopUp(
                  context,
                  appState,
                  title: 'Short Script Pack',
                  price: 'Rs 19',
                  creditsToAdd: 5,
                ),
                child: const Text(
                  'Rs 19 mein 5 Short Scripts lein',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),

          // ==================== 4. PAY PER SCRIPT (Rs 49) ====================
          _buildPlanCard(
            context,
            title: 'Pay per script (Long Video)',
            price: 'Rs 49 / pack',
            features: const [
              '2 gehri research wali Long scripts (10–15 min)',
              'Fact vs Myth + 8K Visual prompts ke saath',
              'Bina subscription ke (Top-Up)',
            ],
            actionWidget: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black87,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: () => _confirmTopUp(
                  context,
                  appState,
                  title: 'Long Documentary Pack',
                  price: 'Rs 49',
                  creditsToAdd: 2,
                ),
                child: const Text(
                  'Rs 49 mein 2 Long Scripts lein',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),

          // ==================== 5. MONTHLY PRO (MOST POPULAR - Rs 399) ====================
          _buildPlanCard(
            context,
            title: 'Monthly Pro ⭐ Most Popular',
            price: 'Rs 399 / mo',
            isHighlighted: true,
            features: const [
              '25 VIP Long scripts + 30 Short scripts har mahine',
              'Har scene ki AI image + 8K realistic prompts',
              'Priority research + Bina ads ke',
            ],
            actionWidget: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 13),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: () => _confirmSubscription(
                  context,
                  appState,
                  planName: 'Monthly Pro',
                  priceLabel: 'Rs 399/mo',
                ),
                icon: const Icon(Icons.workspace_premium),
                label: const Text(
                  'Monthly Pro Chalu Karein (Rs 399)',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),

          // ==================== 6. YEARLY CREATOR VIP (Rs 2,499) ====================
          _buildPlanCard(
            context,
            title: 'Yearly Creator VIP (Best Value)',
            price: 'Rs 2,499 / yr',
            features: const [
              'Sirf Rs 208/mahina (48% ki bachat!)',
              'Har mahine 30 Long + 50 Short VIP scripts',
              'Har scene ki AI image + Sabse fast Pro AI models',
            ],
            actionWidget: SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white,
                  side: const BorderSide(color: Colors.white38),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: () => _confirmSubscription(
                  context,
                  appState,
                  planName: 'Yearly Creator VIP',
                  priceLabel: 'Rs 2,499/yr',
                ),
                child: const Text(
                  'Yearly VIP Lein (Rs 2,499/year)',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),

          if (appState.isPremium) ...[
            const SizedBox(height: 12),
            Center(
              child: TextButton(
                onPressed: () {
                  appState.disablePremium();
                  _snack('Free Plan par wapas aa gaye');
                },
                child: const Text(
                  'Switch back to Free Plan (Testing)',
                  style: TextStyle(color: Colors.white60),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPlanCard(
    BuildContext context, {
    required String title,
    required String price,
    required List<String> features,
    bool isHighlighted = false,
    Widget? actionWidget,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isHighlighted ? AppColors.primary : Colors.white24,
          width: isHighlighted ? 1.5 : 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                price,
                style: const TextStyle(
                  fontSize: 15.5,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...features.map(
            (f) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('✓ ', style: TextStyle(color: Colors.white)),
                  Expanded(
                    child: Text(
                      f,
                      style: const TextStyle(
                        fontSize: 14.5,
                        color: Colors.white70,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (actionWidget != null) ...[
            const SizedBox(height: 12),
            actionWidget,
          ],
        ],
      ),
    );
  }
}
