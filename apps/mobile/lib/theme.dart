import 'package:flutter/material.dart';

class AppColors {
  static const slate50 = Color(0xFFF8FAFC);
  static const slate100 = Color(0xFFF1F5F9);
  static const slate200 = Color(0xFFE2E8F0);
  static const slate400 = Color(0xFF94A3B8);
  static const slate500 = Color(0xFF64748B);
  static const slate700 = Color(0xFF334155);
  static const slate900 = Color(0xFF0F172A);
  static const indigo600 = Color(0xFF4F46E5);
  static const indigo700 = Color(0xFF4338CA);
  static const indigo50 = Color(0xFFEEF2FF);
  static const green500 = Color(0xFF22C55E);
}

ThemeData appTheme = ThemeData(
  useMaterial3: true,
  colorScheme: const ColorScheme(
    brightness: Brightness.light,
    primary: AppColors.indigo600,
    onPrimary: Colors.white,
    secondary: AppColors.slate900,
    onSecondary: Colors.white,
    error: Colors.redAccent,
    onError: Colors.white,
    surface: Colors.white,
    onSurface: AppColors.slate900,
    outline: AppColors.slate200,
  ),
  scaffoldBackgroundColor: AppColors.slate50,

  appBarTheme: const AppBarTheme(
    backgroundColor: Colors.white,
    foregroundColor: AppColors.slate900,
    elevation: 0,
    centerTitle: false,
    scrolledUnderElevation: 1,
  ),

  cardTheme: CardThemeData(
    color: Colors.white,
    elevation: 1,
    shadowColor: AppColors.slate900.withOpacity(0.05),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
      side: const BorderSide(color: AppColors.slate100),
    ),
    margin: EdgeInsets.zero,
  ),

  textTheme: const TextTheme(
    displayMedium: TextStyle(
        fontSize: 30,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.75,
        color: AppColors.slate900),
    headlineSmall: TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.5,
        color: AppColors.slate900),
    titleLarge: TextStyle(
        fontSize: 20, fontWeight: FontWeight.w600, color: AppColors.slate900),
    titleMedium: TextStyle(
        fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.slate900),
    bodyLarge: TextStyle(fontSize: 16, color: AppColors.slate700),
    bodyMedium: TextStyle(fontSize: 14, color: AppColors.slate500),
    labelSmall: TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        color: AppColors.slate500,
        letterSpacing: 0.5),
  ),

  navigationBarTheme: NavigationBarThemeData(
    backgroundColor: Colors.white,
    indicatorColor: AppColors.indigo50,
    iconTheme: WidgetStateProperty.resolveWith((states) {
      if (states.contains(WidgetState.selected)) {
        return const IconThemeData(color: AppColors.indigo600, size: 24);
      }
      return const IconThemeData(color: AppColors.slate500, size: 24);
    }),
    labelTextStyle: WidgetStateProperty.resolveWith((states) {
      if (states.contains(WidgetState.selected)) {
        return const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: AppColors.indigo600);
      }
      return const TextStyle(
          fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.slate500);
    }),
  ),
);
