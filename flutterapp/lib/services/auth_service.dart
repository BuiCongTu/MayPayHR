import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../configs/api_config.dart';

class AuthService {

  // Login
  static Future<Map<String, dynamic>?> login(String email, String password) async {
    final url = Uri.parse("${ApiConfig.baseUrl}/api/auth/login");

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

        // Xác định role
        String role = "";
        if (userDto["roleName"] != null) {
          role = userDto["roleName"].toString().toUpperCase();
        } else if (userDto["roleId"] != null) {
          role = userDto["roleId"] == 1 ? "ADMIN" : "USER";
        } else {
          role = "USER";
        }

        // Lưu SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString("token", token);
        await prefs.setString("email", email);
        await prefs.setString("role", role);

        return {"token": token, "user": userDto, "role": role};
      } else {
        print("Login Failed: ${response.statusCode} - ${response.body}");
      }
    } catch (e) {
      print("Login Error: $e");
    }
    return null;
  }

  // Register
  static Future<String?> register(Map<String, dynamic> userData) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/api/auth/register');
      print('Register payload: ${jsonEncode(userData)}');

      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(userData),
      );

      print('Response: ${response.statusCode}, Body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        return null; // null nghĩa là đăng ký thành công
      } else {
        String message = 'Unknown error';
        if (response.body.isNotEmpty) {
          try {
            final Map<String, dynamic> resBody = jsonDecode(response.body);
            message = resBody['message'] ?? message;
          } catch (e) {
            message = 'Invalid response format';
          }
        }
        return message; // trả về message lỗi để hiển thị
      }
    } catch (e) {
      return 'Exception: $e';
    }
  }


  // Logout
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}
