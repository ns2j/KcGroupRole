// lib/screens/protected_screen.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../auth_provider.dart';
import '../theme.dart';
import '../components/base_page.dart';

class ProtectedScreen extends ConsumerWidget {
  const ProtectedScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final userName = authState.user;
    final authContext = authState.context;

    return BasePage(
      icon: LucideIcons.shieldCheck,
      title: 'Protected Page',
      description: 'Confidential area accessible only by authenticated users.',
      isDark: true,
      accentColor: const Color(0xFF10B981),
      child: _buildContent(context, ref, authState, userName, authContext),
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, AuthState authState, String? userName, Map<String, dynamic>? authContext) {
    // If unauthenticated, automatically start the login process (matching Next.js behavior)
    if (!authState.isLoading && userName == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(authProvider.notifier).login();
      });

      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: AppColors.indigo600),
            SizedBox(height: 16),
            Text('Unauthenticated, redirecting to login...', style: TextStyle(color: Color(0xFF94A3B8))),
          ],
        ),
      );
    }

    // Display during loading
    if (authState.isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.indigo600),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // User Profile Badge (Compact)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.indigo600,
                  child: Text(userName![0].toUpperCase(), 
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(userName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      const Text('Authenticated', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          _buildInfoCard(
            'Proof of successful authentication',
            'Indicates that the session evaluated by the BFF policy engine is valid.',
            const Color(0xFF10B981),
          ),
          const SizedBox(height: 16),
          _buildInfoCard(
            'Next steps and tests',
            'Go back to the "API Call Test" tab and run authorization tests against the backend.',
            const Color(0xFFA855F7),
          ),
          const SizedBox(height: 24),

          // Security Context
          Align(
            alignment: Alignment.centerLeft,
            child: Row(
              children: [
                const Icon(LucideIcons.fingerprint, color: Color(0xFF818CF8), size: 18),
                const SizedBox(width: 8),
                const Text('Security Context', 
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.4),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withOpacity(0.05)),
            ),
            child: Text(
              const JsonEncoder.withIndent('  ').convert(authContext),
              style: const TextStyle(
                color: Color(0xFF818CF8),
                fontFamily: 'Courier',
                fontSize: 11,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(String title, String description, Color accentColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(color: accentColor, shape: BoxShape.circle),
              ),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
            ],
          ),
          const SizedBox(height: 8),
          Text(description, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, height: 1.4)),
        ],
      ),
    );
  }
}
