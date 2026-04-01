// lib/screens/apicall_screen.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../components/base_page.dart';

class ApiCallScreen extends ConsumerStatefulWidget {
  const ApiCallScreen({super.key});

  @override
  ConsumerState<ApiCallScreen> createState() => _ApiCallScreenState();
}

class _ApiCallScreenState extends ConsumerState<ApiCallScreen> {
  bool _isLoading = false;
  String _responseBody = 'Please press a button to call the API';
  String _statusCode = '-';
  String _currentEndpoint = '';

  // Method to call API
  Future<void> _callApi(String endpoint) async {
    setState(() {
      _isLoading = true;
      _currentEndpoint = endpoint;
      _responseBody = 'Communicating...';
      _statusCode = '-';
    });

    try {
      final baseUrl = dotenv.env['BFF_BASE_URL'] ?? 'http://10.0.2.2:8020/bff';
      final url = Uri.parse('$baseUrl$endpoint');

      final prefs = await SharedPreferences.getInstance();
      final sessionCookie = prefs.getString('session_cookie');

      final Map<String, String> headers = {
        'Accept': 'application/json',
      };

      if (sessionCookie != null) {
        final encodedCookie = Uri.encodeComponent(sessionCookie);
        headers['Cookie'] = 'connect.sid=$encodedCookie';
      }

      final response = await http.get(url, headers: headers);

      String formattedBody = response.body;
      try {
        final decoded = jsonDecode(response.body);
        formattedBody = const JsonEncoder.withIndent('  ').convert(decoded);
      } catch (_) {}

      setState(() {
        _statusCode = response.statusCode.toString();
        _responseBody = formattedBody;
      });
    } catch (e) {
      setState(() {
        _statusCode = 'Error';
        _responseBody = 'Communication error occurred:\n$e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return BasePage(
      icon: LucideIcons.server,
      title: 'API Call Test',
      description: 'Call BFF endpoints to confirm RBAC and AST policy authorization in real-time.',
      child: _buildBody(),
    );
  }

  Widget _buildBody() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 🔘 API Call buttons
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildApiButton('Auth Check', '/api/authorization/authenticated', AppColors.indigo600),
              _buildApiButton('User Info', '/api/info', AppColors.indigo600),
              _buildApiButton('Public API', '/api/public/hello', AppColors.slate700),
              _buildApiButton('Role/Group', '/api/authorization/roleorgroup', const Color(0xFFF43F5E)),
              _buildApiButton('Admin Zone', '/api/authorization/admin', const Color(0xFFF43F5E)),
              _buildApiButton('Q4 Reports', '/api/authorization/a', const Color(0xFFF43F5E)),
              _buildApiButton('Protected (API)', '/api/protected-resource', AppColors.indigo600),
              _buildApiButton('Admin (API)', '/api/admin-only', const Color(0xFFF43F5E)),
              _buildApiButton('Group (API)', '/api/group-restricted', const Color(0xFF10B981)),
            ],
          ),
          const SizedBox(height: 24),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Response',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.slate700)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _statusCode.startsWith('2')
                      ? const Color(0xFF10B981)
                      : (_statusCode == '-' ? AppColors.slate200 : const Color(0xFFF43F5E)),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'Status: $_statusCode',
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: _statusCode == '-' ? AppColors.slate700 : Colors.white),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          Expanded(
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.slate900,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.slate700),
              ),
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)))
                  : SingleChildScrollView(
                      child: Text(
                        _currentEndpoint.isNotEmpty ? 'GET $_currentEndpoint\n\n$_responseBody' : _responseBody,
                        style: const TextStyle(
                          fontFamily: 'Courier',
                          fontSize: 13,
                          color: Color(0xFF10B981),
                          height: 1.5,
                        ),
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildApiButton(String label, String endpoint, Color color) {
    return ElevatedButton(
      onPressed: _isLoading ? null : () => _callApi(endpoint),
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        foregroundColor: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
    );
  }
}
