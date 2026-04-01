import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:app_links/app_links.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AuthState {
  final bool isLoading;
  final String? user;
  final Map<String, dynamic>? userData;
  final Map<String, dynamic>? context;

  AuthState({this.isLoading = true, this.user, this.userData, this.context});

  AuthState copyWith({
    bool? isLoading, 
    String? user, 
    Map<String, dynamic>? userData, 
    Map<String, dynamic>? context
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      userData: userData ?? this.userData,
      context: context ?? this.context,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(AuthState()) {
    _init();
  }

  late AppLinks _appLinks;

  Future<void> _init() async {
    await _checkExistingSession();
    _initDeepLinkListener();
  }

  Future<void> _checkExistingSession() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.containsKey('session_cookie')) {
      await fetchUserInfo();
    } else {
      state = state.copyWith(isLoading: false);
    }
  }

  void _initDeepLinkListener() {
    _appLinks = AppLinks();
    _appLinks.uriLinkStream.listen((Uri? uri) async {
      if (uri != null) {
        final sessionCookie = uri.queryParameters['session'];
        if (sessionCookie != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('session_cookie', sessionCookie);
          await fetchUserInfo();
        }
      }
    });
  }

  Future<void> login() async {
    final bffBaseUrl = dotenv.env['BFF_BASE_URL'] ?? 'http://10.0.2.2:8020/bff';
    final callbackUrl = dotenv.env['FLUTTER_CALLBACK_URL'] ?? 'com.example.flutterauthapp://callback';

    final bffLoginUrl = '$bffBaseUrl/auth/login?redirect_to=$callbackUrl';
    final Uri url = Uri.parse(bffLoginUrl);

    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('session_cookie');

    final bffBaseUrl = dotenv.env['BFF_BASE_URL'] ?? 'http://10.0.2.2:8020/bff';
    final callbackUrl = dotenv.env['FLUTTER_CALLBACK_URL'] ?? 'com.example.flutterauthapp://callback';

    final bffLogoutUrl = '$bffBaseUrl/auth/logout?redirect_to=$callbackUrl';
    final Uri url = Uri.parse(bffLogoutUrl);

    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }

    state = AuthState(isLoading: false, user: null, userData: null, context: null);
  }

  Future<void> fetchUserInfo() async {
    state = state.copyWith(isLoading: true);
    final prefs = await SharedPreferences.getInstance();
    final sessionCookie = prefs.getString('session_cookie');

    if (sessionCookie == null) {
      state = state.copyWith(isLoading: false);
      return;
    }

    try {
      final bffBaseUrl = dotenv.env['BFF_BASE_URL'] ?? 'http://10.0.2.2:8020/bff';
      final encodedCookie = Uri.encodeComponent(sessionCookie);
      final headers = {'Cookie': 'connect.sid=$encodedCookie'};

      final results = await Future.wait([
        http.get(Uri.parse('$bffBaseUrl/api/authorization/authenticated'), headers: headers),
        http.get(Uri.parse('$bffBaseUrl/api/info'), headers: headers),
      ]);

      final authRes = results[0];
      final infoRes = results[1];

      if (authRes.statusCode == 200) {
        final authData = jsonDecode(authRes.body);
        Map<String, dynamic>? profileData;
        
        if (infoRes.statusCode == 200) {
          profileData = jsonDecode(infoRes.body)['decodedAccessToken'];
        }

        state = state.copyWith(
          isLoading: false, 
          user: authData['user'],
          context: authData['context'],
          userData: profileData,
        );
      } else {
        await prefs.remove('session_cookie');
        state = AuthState(isLoading: false, user: null, userData: null, context: null);
      }
    } catch (e) {
      print('Error: $e');
      state = state.copyWith(isLoading: false);
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
