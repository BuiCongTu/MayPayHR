import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../configs/api_config.dart';
import '../utils/hash_utils.dart';

class AuthService {


  static Future<Map<String, dynamic>?> login(String email, String password) async {
    final url = Uri.parse("${ApiConfig.baseUrl}/login");

    try {
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"email": email, "password": password}),
      );

      if (response.statusCode == 200) {
        final responseJson = jsonDecode(response.body);

        final data = responseJson["data"];
        final token = data["token"];
        final userDto = data["user"];
        final role = userDto["role"] ?? "USER";

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString("token", token);
        await prefs.setString("email", email);
        await prefs.setString("role", role);

        return {
          "token": token,
          "user": userDto,
          "role": role,
        };
      } else {
        print("Login Failed: ${response.statusCode} - ${response.body}");
      }
    } catch (e) {
      print("Login Error: $e");
    }
    return null;
  }

  static Future<bool> register(Map<String, dynamic> userData) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/register');

      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(userData),
      );

      if (response.statusCode == 201) {
        // Registration thành công
        return true;
      } else {
        // Lấy message lỗi từ backend (nếu có)
        final Map<String, dynamic> resBody = jsonDecode(response.body);
        final message = resBody['message'] ?? 'Unknown error';
        print('Register failed: ${response.statusCode}, message: $message');
        return false;
      }
    } catch (e) {
      print('Register exception: $e');
      return false;
    }
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}
