import 'package:flutter/material.dart';
import '../theme.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool isPremium = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Profile & Plan", style: TextStyle(fontWeight: FontWeight.bold)),
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            // User Info
            Row(
              children: [
                const CircleAvatar(
                  radius: 30,
                  backgroundColor: AppColors.primary,
                  child: Icon(Icons.person, size: 40, color: Colors.white),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Akhlakh Ansari", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.navy)),
                    Text(isPremium ? "Premium Creator 👑" : "Free Plan", style: const TextStyle(color: Colors.grey)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 30),

            // Usage Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.black12)),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text("Usage this month", style: TextStyle(fontWeight: FontWeight.bold)),
                      Text(isPremium ? "Unlimited" : "3 / 5 scripts", style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  LinearProgressIndicator(
                    value: isPremium ? 1.0 : 0.6,
                    backgroundColor: Colors.grey.shade200,
                    color: AppColors.mint,
                    minHeight: 8,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Premium Card
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFFFFE082), Color(0xFFFFB300)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [BoxShadow(color: Colors.amber.withValues(alpha: 0.4), blurRadius: 15, offset: const Offset(0, 8))],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.5), borderRadius: BorderRadius.circular(20)),
                        child: const Text("✦ CREATOR PREMIUM", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                      const Icon(Icons.workspace_premium, color: Colors.white, size: 30),
                    ],
                  ),
                  const SizedBox(height: 20),
                  const Text("Premium lo. Create without limits.", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black87)),
                  const SizedBox(height: 8),
                  const Text("Scene-wise AI images + unlimited scripts + faster workflow.", style: TextStyle(color: Colors.black87)),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text("₹299 / month", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black87)),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.navy),
                        onPressed: () {
                          setState(() {
                            isPremium = !isPremium; // Toggle premium for demo
                          });
                        },
                        child: Text(isPremium ? "Active ✓" : "Upgrade →", style: const TextStyle(color: Colors.white)),
                      )
                    ],
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
