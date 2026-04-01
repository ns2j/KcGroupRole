// lib/screens/manager_screen.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../auth_provider.dart';
import '../theme.dart';
import '../components/base_page.dart';

class ManagerScreen extends ConsumerStatefulWidget {
  const ManagerScreen({super.key});

  @override
  ConsumerState<ManagerScreen> createState() => _ManagerScreenState();
}

class _ManagerScreenState extends ConsumerState<ManagerScreen> {
  bool _isLoading = true;
  String _status = 'loading'; // loading, authorized, forbidden, unauthenticated
  Map<String, dynamic>? _contextData;
  String? _managerName;

  @override
  void initState() {
    super.initState();
    _checkManagerAccess();
  }

  Future<void> _checkManagerAccess() async {
    setState(() => _isLoading = true);

    try {
      final baseUrl = dotenv.env['BFF_BASE_URL'] ?? 'http://10.0.2.2:8020/bff';
      final url = Uri.parse('$baseUrl/api/authorization/admin');

      final prefs = await SharedPreferences.getInstance();
      final sessionCookie = prefs.getString('session_cookie');

      if (sessionCookie == null) {
        setState(() {
          _status = 'unauthenticated';
          _isLoading = false;
        });
        return;
      }

      final encodedCookie = Uri.encodeComponent(sessionCookie);
      final response = await http.get(
        url,
        headers: {
          'Accept': 'application/json',
          'Cookie': 'connect.sid=$encodedCookie',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _status = 'authorized';
          _contextData = data['context'];
          _managerName = data['user'];
          _isLoading = false;
        });
      } else if (response.statusCode == 403) {
        setState(() {
          _status = 'forbidden';
          _isLoading = false;
        });
      } else {
        setState(() {
          _status = 'unauthenticated';
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Manager access check error: $e');
      setState(() {
        _status = 'unauthenticated';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // Re-check permissions after login
    ref.listen(authProvider, (previous, next) {
      if ((previous == null || previous.user == null) && next.user != null) {
        _checkManagerAccess();
      }
    });

    return BasePage(
      icon: LucideIcons.settings,
      title: 'Admin',
      description: 'Server management console. Requires Manager role.',
      isDark: true,
      backgroundColor: const Color(0xFF4C0519), // rose-950
      accentColor: const Color(0xFFFB7185), // rose-400
      actions: [
        if (_managerName != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFE11D48).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE11D48).withOpacity(0.2)),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.user, size: 10, color: Color(0xFFFB7185)),
                const SizedBox(width: 4),
                Text(
                  _managerName!,
                  style: const TextStyle(color: Color(0xFFFB7185), fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
      ],
      child: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFFF43F5E)),
      );
    }

    if (_status == 'unauthenticated') {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(authProvider.notifier).login();
      });

      return const Center(
        child: Text('Redirecting...', style: TextStyle(color: Color(0xFF94A3B8))),
      );
    }

    if (_status == 'forbidden') {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(LucideIcons.shieldAlert, size: 64, color: Color(0xFFE11D48)),
              const SizedBox(height: 24),
              const Text('Access Denied', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              const Text(
                'Requires Manager role.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFF94A3B8)),
              ),
            ],
          ),
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Your Authorization Context',
            style: TextStyle(color: Color(0xFFF43F5E), fontWeight: FontWeight.bold, fontSize: 14),
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.5),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(0.05)),
            ),
            child: Text(
              const JsonEncoder.withIndent('  ').convert(_contextData),
              style: const TextStyle(
                color: Color(0xFFFDA4AF),
                fontFamily: 'Courier',
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
