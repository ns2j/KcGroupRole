// lib/layout/app_layout.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../components/header.dart';
import '../components/bottom_nav.dart';
import '../screens/home_screen.dart';
import '../screens/info_screen.dart';
import '../screens/apicall_screen.dart';
import '../screens/protected_screen.dart';
import '../screens/manager_screen.dart'; // Added this!
import '../theme.dart';

// Provider to manage the selected index of the bottom navigation
final bottomNavIndexProvider = StateProvider<int>((ref) => 0);

class AppLayout extends ConsumerWidget {
  const AppLayout({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedIndex = ref.watch(bottomNavIndexProvider);

    // Each screen
    final List<Widget> screens = [
      const HomeScreen(), // 0
      const ProtectedScreen(), // 1
      const ManagerScreen(), // 2
      const InfoScreen(), // 3
      const ApiCallScreen(), // 4
    ];

    return Scaffold(
      appBar: const PreferredSize(
        preferredSize: Size.fromHeight(kToolbarHeight + 1),
        child: Header(),
      ),

      body: Container(
        color: AppColors.slate50,
        child: screens[selectedIndex],
      ),

      bottomNavigationBar: const BottomNav(),
    );
  }
}
