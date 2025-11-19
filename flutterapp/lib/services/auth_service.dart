import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../configs/api_config.dart';

class AuthService {
  // Mapping roleId to string
  static String getRoleFromId(int roleId) {
    switch (roleId) {
      case 199010000: return "WORKER";
      case 199010001: return "MANAGER";
      case 199010002: return "FACTORY_MANAGER";
      case 199010003: return "FACTORY_DIRECTOR";
      case 199010004: return "HR";
      case 199010005: return "ADMIN";
      default: return "USER";
    }
  }

  // Login bằng phone
  static Future<Map<String, dynamic>?> login(String phone, String password) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.loginEndpoint}');
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"phone": phone, "password": password}),
      );

      if (response.statusCode == 200) {
        final res = jsonDecode(response.body);
        final data = res["data"];
        final token = data["token"];
        final user = data["user"];
        final role = user["roleName"] != null
            ? user["roleName"].toString().toUpperCase()
            : getRoleFromId(user["roleId"]);

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString("token", token);
        await prefs.setString("phone", phone);
        await prefs.setString("role", role);

        return {"token": token, "user": user, "role": role};
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Register
  static Future<String?> register(Map<String, dynamic> userData) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.registerEndpoint}');
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(userData),
      );
      if (response.statusCode == 200 || response.statusCode == 201) return null;
      if (response.body.isNotEmpty) {
        final Map<String, dynamic> resBody = jsonDecode(response.body);
        return resBody['message'] ?? 'Đăng ký thất bại';
      }
      return 'Đăng ký thất bại';
    } catch (e) {
      return 'Exception: $e';
    }
  }

  // Logout
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  // Forgot Password
  static Future<bool> forgotPassword(String email) async {
    final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.forgotPasswordEndpoint}');
    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email}),
    );
    return response.statusCode == 200;
  }

  // Reset Password
  static Future<bool> resetPassword(String token, String password) async {
    final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.resetPasswordEndpoint}');
    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"token": token, "newPassword": password}),
    );
    return response.statusCode == 200;
  }
}
