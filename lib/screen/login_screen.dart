import 'dart:async';
import 'package:flutter/material.dart';
import '../theme.dart';
import '../state/app_state.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _glowController;
  late final Animation<double> _glowAnimation;

  final String _fullAnimatedLine = 'Solve your Content Creation Problems';
  String _typedText = '';
  Timer? _typeTimer;
  int _charIndex = 0;
  bool _showEmailBox = false;

  final TextEditingController _emailCtrl = TextEditingController();
  final TextEditingController _nameCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    )..repeat(reverse: true);

    _glowAnimation = CurvedAnimation(
      parent: _glowController,
      curve: Curves.easeInOut,
    );

    _startTypewriter();
  }

  void _startTypewriter() {
    _typeTimer?.cancel();
    _charIndex = 0;
    _typedText = '';
    _typeTimer = Timer.periodic(const Duration(milliseconds: 55), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_charIndex < _fullAnimatedLine.length) {
        setState(() {
          _charIndex++;
          _typedText = _fullAnimatedLine.substring(0, _charIndex);
        });
      } else {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _typeTimer?.cancel();
    _glowController.dispose();
    _emailCtrl.dispose();
    _nameCtrl.dispose();
    super.dispose();
  }

  void _handleGoogleContinue() {
    final nameCtrl = TextEditingController(text: 'Creator');
    final emailCtrl = TextEditingController(text: 'creator@gmail.com');
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppPalette.slate,
        title: const Text(
          'Continue with Google',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Aapka Naam',
                labelStyle: TextStyle(color: Colors.white70),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: emailCtrl,
              keyboardType: TextInputType.emailAddress,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Google Email ID',
                labelStyle: TextStyle(color: Colors.white70),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              final email = emailCtrl.text.trim();
              final name = nameCtrl.text.trim();
              if (email.isEmpty) return;
              Navigator.pop(ctx);
              AppStateProvider.of(context).login(email: email, name: name);
            },
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }

  void _handleEmailLogin() {
    final email = _emailCtrl.text.trim();
    if (email.isEmpty || !email.contains('@')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Kripya sahi email address daalein')),
      );
      return;
    }
    AppStateProvider.of(context).login(
      email: email,
      name: _nameCtrl.text.trim().isNotEmpty ? _nameCtrl.text.trim() : null,
    );
  }

  @override
  Widget build(BuildContext context) {
    return PaletteTheme(
      bg: AppPalette.slate,
      child: Scaffold(
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                minHeight: MediaQuery.of(context).size.height - 80,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // ==================== 1. TOP HEADER ====================
                  Column(
                    children: [
                      const SizedBox(height: 16),
                      const Text(
                        'SCRIPTD AI',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 2.2,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Your Content Creation Journey',
                        style: TextStyle(
                          fontSize: 14,
                          letterSpacing: 0.6,
                          color: Colors.white.withOpacity(0.72),
                        ),
                      ),
                    ],
                  ),

                  // ==================== 2. CENTER ANIMATED HERO ====================
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 42),
                    child: AnimatedBuilder(
                      animation: _glowAnimation,
                      builder: (context, _) {
                        final glow = 0.15 + (_glowAnimation.value * 0.25);
                        return Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 22,
                            vertical: 34,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(
                              color: AppColors.primary.withOpacity(glow + 0.15),
                              width: 1.2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withOpacity(glow * 0.5),
                                blurRadius: 28,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                          child: Column(
                            children: [
                              Text(
                                'This is the',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w400,
                                  letterSpacing: 1.2,
                                  color: Colors.white.withOpacity(0.80),
                                ),
                              ),
                              const SizedBox(height: 10),
                              ShaderMask(
                                shaderCallback: (bounds) {
                                  return LinearGradient(
                                    colors: [
                                      Colors.white,
                                       Color.lerp(
                                        Colors.white,
                                        AppColors.primary,
                                        0.35 + (_glowAnimation.value * 0.45),
                                      )!,
                                      Colors.white,
                                    ],
                                  ).createShader(bounds);
                                },
                                child: const Text(
                                  'SCRIPTD.AI',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontSize: 36,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 3.0,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 18),
                              SizedBox(
                                height: 52,
                                child: Center(
                                  child: Text(
                                    '$_typedText${_charIndex < _fullAnimatedLine.length ? "▋" : ""}',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w600,
                                      height: 1.35,
                                      color: Colors.white.withOpacity(0.92),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),

                  // ==================== 3. BOTTOM LOGIN ACTIONS ====================
                  Column(
                    children: [
                      // Continue with Google (Pill Button)
                      SizedBox(
                        width: double.infinity,
                        height: 54,
                        child: OutlinedButton(
                          onPressed: _handleGoogleContinue,
                          style: OutlinedButton.styleFrom(
                            backgroundColor: Colors.white.withOpacity(0.08),
                            side: const BorderSide(
                              color: Colors.white38,
                              width: 1.2,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 26,
                                height: 26,
                                alignment: Alignment.center,
                                decoration: const BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                ),
                                child: const Text(
                                  'G',
                                  style: TextStyle(
                                    color: AppPalette.slate,
                                    fontWeight: FontWeight.w900,
                                    fontSize: 15,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              const Text(
                                'Continue with Google',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // ------ or ------
                      Row(
                        children: [
                          const Expanded(
                            child: Divider(color: Colors.white24, thickness: 1),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            child: Text(
                              'or',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.65),
                                fontSize: 14,
                              ),
                            ),
                          ),
                          const Expanded(
                            child: Divider(color: Colors.white24, thickness: 1),
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      // Enter your email (Rectangular Box matching sketch)
                      if (!_showEmailBox)
                        SizedBox(
                          width: double.infinity,
                          height: 52,
                          child: OutlinedButton(
                            onPressed: () =>
                                setState(() => _showEmailBox = true),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(
                                color: Colors.white38,
                                width: 1.2,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: const Text(
                              'Enter your email',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 15.5,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        )
                      else
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.07),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.white30),
                          ),
                          child: Column(
                            children: [
                              TextField(
                                controller: _nameCtrl,
                                style: const TextStyle(color: Colors.white),
                                decoration: const InputDecoration(
                                  hintText: 'Your Name (optional)',
                                  hintStyle: TextStyle(color: Colors.white54),
                                  prefixIcon: Icon(
                                    Icons.person_outline,
                                    color: Colors.white70,
                                  ),
                                  border: InputBorder.none,
                                ),
                              ),
                              const Divider(color: Colors.white24, height: 1),
                              TextField(
                                controller: _emailCtrl,
                                keyboardType: TextInputType.emailAddress,
                                style: const TextStyle(color: Colors.white),
                                onSubmitted: (_) => _handleEmailLogin(),
                                decoration: const InputDecoration(
                                  hintText: 'Enter your email',
                                  hintStyle: TextStyle(color: Colors.white54),
                                  prefixIcon: Icon(
                                    Icons.email_outlined,
                                    color: Colors.white70,
                                  ),
                                  border: InputBorder.none,
                                ),
                              ),
                              const SizedBox(height: 10),
                              SizedBox(
                                width: double.infinity,
                                height: 46,
                                child: ElevatedButton(
                                  onPressed: _handleEmailLogin,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primary,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                  child: const Text(
                                    'Start Creating',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                      const SizedBox(height: 22),

                      // Subtle dashed bottom line matching sketch
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: List.generate(
                          14,
                          (_) => Container(
                            width: 12,
                            height: 1.5,
                            color: Colors.white24,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
