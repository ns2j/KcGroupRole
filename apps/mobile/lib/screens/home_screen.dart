// lib/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../auth_provider.dart';
import '../theme.dart';
import '../components/base_page.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return BasePage(
      icon: LucideIcons.home,
      title: 'Home',
      description: 'Welcome to the secure BFF architecture. You can check your authentication state and profile here.',
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 400),
        child: _buildMainContent(context, ref, authState),
      ),
    );
  }

  Widget _buildMainContent(
      BuildContext context, WidgetRef ref, AuthState authState) {
    if (authState.isLoading) {
      return const Center(
          key: ValueKey('loading'),
          child: CircularProgressIndicator(
            color: AppColors.indigo600,
          ));
    }

    final userData = authState.userData;
    final userName = authState.user;

    if (userName != null) {
      final String displayName = (userData != null && userData['name'] != null) 
          ? userData['name'] 
          : userName;
      final String? preferredUsername = userData?['preferred_username'];
      final String? email = userData?['email'];
      final String avatarInitial = displayName.isNotEmpty ? displayName[0].toUpperCase() : 'U';

      return SingleChildScrollView(
        key: const ValueKey('profile'),
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    Center(
                      child: Container(
                        height: 100,
                        width: 100,
                        margin: const EdgeInsets.only(bottom: 24),
                        child: Stack(
                          children: [
                            CircleAvatar(
                              radius: 50,
                              backgroundColor: AppColors.indigo50,
                              child: Text(avatarInitial,
                                  style: const TextStyle(
                                      fontSize: 40,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.indigo600)),
                            ),
                            Positioned(
                              bottom: 0,
                              right: 0,
                              child: Container(
                                height: 32,
                                width: 32,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF10B981),
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white, width: 2),
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppColors.slate900.withOpacity(0.1),
                                      blurRadius: 2,
                                      offset: const Offset(0, 1),
                                    ),
                                  ],
                                ),
                                child: const Center(
                                    child: Icon(LucideIcons.shieldCheck,
                                        color: Colors.white, size: 18)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    Text(displayName, style: Theme.of(context).textTheme.headlineSmall),
                    if (preferredUsername != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 4, bottom: 24),
                        child: Text('@$preferredUsername',
                            style: Theme.of(context).textTheme.bodyMedium),
                      ),
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.slate50,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.slate100),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      child: Row(
                        children: [
                          const Icon(LucideIcons.mail, size: 20, color: AppColors.slate400),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Email Address',
                                    style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                        color: AppColors.slate500)),
                                Text(email ?? 'Not set',
                                    style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.slate700)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            if (authState.context != null)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(LucideIcons.fingerprint, size: 18, color: AppColors.indigo600),
                          SizedBox(width: 8),
                          Text('Authorization Context', style: TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      _buildTagList('Roles', (authState.context!['roles'] as List?)?.cast<String>() ?? []),
                      const SizedBox(height: 8),
                      _buildTagList('Groups', (authState.context!['groups'] as List?)?.cast<String>() ?? []),
                    ],
                  ),
                ),
              ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      key: const ValueKey('welcome'),
      padding: const EdgeInsets.all(24),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Container(
                height: 80,
                width: 80,
                decoration: const BoxDecoration(color: AppColors.indigo50, shape: BoxShape.circle),
                margin: const EdgeInsets.only(bottom: 24),
                child: const Center(
                    child: Icon(LucideIcons.user, size: 40, color: AppColors.indigo600)),
              ),
              Text('Welcome', style: Theme.of(context).textTheme.headlineSmall),
              const Padding(
                padding: EdgeInsets.only(top: 8, bottom: 32),
                child: Text(
                  'Please login to continue.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, color: AppColors.slate500, height: 1.5),
                ),
              ),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: () => ref.read(authProvider.notifier).login(),
                  icon: const Icon(LucideIcons.logIn, size: 18),
                  label: const Text('Login with Keycloak'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.indigo600,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTagList(String label, List<String> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.slate500)),
        const SizedBox(height: 4),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: items.isEmpty 
            ? [const Text('None', style: TextStyle(fontSize: 12, color: AppColors.slate400, fontStyle: FontStyle.italic))]
            : items.map((item) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.indigo50,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppColors.slate100),
                ),
                child: Text(item, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.indigo600)),
              )).toList(),
        ),
      ],
    );
  }
}
