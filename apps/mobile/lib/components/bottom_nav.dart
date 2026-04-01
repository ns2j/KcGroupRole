// lib/components/bottom_nav.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../layout/app_layout.dart';
import '../theme.dart';

class BottomNav extends ConsumerWidget {
  const BottomNav({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedIndex = ref.watch(bottomNavIndexProvider);

    return Container(
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.slate200)),
      ),
      child: SafeArea(
        child: SizedBox(
          height: 64,
          child: NavigationBar(
            selectedIndex: selectedIndex,
            onDestinationSelected: (index) =>
                ref.read(bottomNavIndexProvider.notifier).state = index,
            animationDuration: const Duration(milliseconds: 300),
            destinations: const [
              NavigationDestination(
                icon: Icon(LucideIcons.home),
                selectedIcon: Icon(LucideIcons.home),
                label: 'Home',
              ),
              NavigationDestination(
                icon: Icon(LucideIcons.shieldCheck),
                selectedIcon: Icon(LucideIcons.shieldCheck),
                label: 'Secure',
              ),
              NavigationDestination(
                icon: Icon(LucideIcons.settings),
                selectedIcon: Icon(LucideIcons.settings),
                label: 'Admin',
              ),
              NavigationDestination(
                icon: Icon(LucideIcons.info),
                selectedIcon: Icon(LucideIcons.info),
                label: 'Info',
              ),
              NavigationDestination(
                icon: Icon(LucideIcons.server),
                selectedIcon: Icon(LucideIcons.server),
                label: 'API Call',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
