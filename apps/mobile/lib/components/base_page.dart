// lib/components/base_page.dart
import 'package:flutter/material.dart';
import '../theme.dart';

class BasePage extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final Widget child;
  final Color? backgroundColor;
  final Color? accentColor;
  final bool isDark;
  final List<Widget>? actions;

  const BasePage({
    super.key,
    required this.icon,
    required this.title,
    required this.description,
    required this.child,
    this.backgroundColor,
    this.accentColor,
    this.isDark = false,
    this.actions,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveBgColor = backgroundColor ?? (isDark ? const Color(0xFF020617) : AppColors.slate50);
    final effectiveAccentColor = accentColor ?? AppColors.indigo600;
    final textColor = isDark ? Colors.white : AppColors.slate900;
    final subTextColor = isDark ? const Color(0xFF94A3B8) : AppColors.slate500;

    return Container(
      color: effectiveBgColor,
      child: SafeArea(
        bottom: false, // Because AppLayout has BottomNav
        child: Column(
          children: [
            // Header Section
            Container(
              padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(icon, color: effectiveAccentColor, size: 28),
                          const SizedBox(width: 12),
                          Text(
                            title,
                            style: TextStyle(
                              color: textColor,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      if (actions != null) Row(children: actions!),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    description,
                    style: TextStyle(
                      color: subTextColor,
                      fontSize: 13,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
            // Content Section
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
                child: Container(
                  width: double.infinity,
                  color: isDark ? Colors.black.withOpacity(0.2) : Colors.white,
                  child: child,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
