// lib/screens/info_screen.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../auth_provider.dart';
import '../theme.dart';
import '../components/base_page.dart';

class InfoScreen extends ConsumerWidget {
  const InfoScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final userName = authState.user;
    final userData = authState.userData;
    final authContext = authState.context;

    return BasePage(
      icon: LucideIcons.info,
      title: 'Session Info',
      description: 'Detailed token information obtained from the BFF authorization engine and Keycloak.',
      child: _buildContent(context, ref, userName, userData, authContext),
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, String? userName, Map<String, dynamic>? userData, Map<String, dynamic>? authContext) {
    // If not logged in
    if (userName == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(LucideIcons.shieldAlert,
                size: 48, color: AppColors.slate400),
            const SizedBox(height: 16),
            Text('Unauthenticated', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            const Text('Please login to display information.',
                style: TextStyle(color: AppColors.slate500)),
          ],
        ),
      );
    }

    // Collect data for display
    final Map<String, dynamic> combinedInfo = {
      'user': userName,
      'context': authContext,
      'token_payload': userData,
    };

    const encoder = JsonEncoder.withIndent('  ');
    final String prettyJson = encoder.convert(combinedInfo);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 📝 Highlight information card
          Card(
            child: Column(
              children: [
                _buildInfoRow(LucideIcons.user, 'Username', userName),
                const Divider(height: 1, color: AppColors.slate100),
                _buildInfoRow(LucideIcons.shield, 'Roles count', 
                    (authContext?['roles'] as List?)?.length.toString() ?? '0'),
                const Divider(height: 1, color: AppColors.slate100),
                _buildInfoRow(LucideIcons.users, 'Groups count', 
                    (authContext?['groups'] as List?)?.length.toString() ?? '0'),
                if (userData != null) ...[
                  const Divider(height: 1, color: AppColors.slate100),
                  _buildInfoRow(LucideIcons.key, 'Subject (UUID)', 
                      userData['sub']?.toString().substring(0, 8) ?? 'N/A'),
                ],
              ],
            ),
          ),
          const SizedBox(height: 24),

          const Text('Raw Authorization Data',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.slate700)),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.slate900,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.slate700),
            ),
            child: Text(
              prettyJson,
              style: const TextStyle(
                fontFamily: 'Courier',
                fontSize: 12,
                color: Color(0xFF10B981),
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.slate400),
          const SizedBox(width: 12),
          Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.slate500)),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.slate700), overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}
