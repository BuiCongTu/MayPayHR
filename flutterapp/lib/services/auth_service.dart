import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../configs/api_config.dart';

class AuthService {
  // Login
  static Future<Map<String, dynamic>?> login(String email, String password) async {
 
    final url = Uri.parse("${ApiConfig.baseUrl}/login");
    
   

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email, "password": password}), 
    );

    if (response.statusCode == 200) {
      // API của bạn trả về một String (token), không phải JSON
      final token = response.body; 
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString("token", token);
      await prefs.setString("email", email);

      
      final userRes = await http.get(
        Uri.parse("${ApiConfig.baseUrl}/getemp/$email"),
        headers: {"Authorization": "Bearer $token"}, 
      );

      if (userRes.statusCode == 200) {
        final user = jsonDecode(userRes.body);
        await prefs.setString("role", user["roleName"] ?? "USER");
        return user;
      }
    } else {
      // In ra lỗi để debug dễ hơn (401 Unauthorized, 400 Bad Request,...)
      print("Login Failed with Status ${response.statusCode}: ${response.body}");
    }
    return null;
  }

  static Future<bool> register(Map<String, dynamic> user) async {
    final url = Uri.parse("${ApiConfig.baseUrl}/register"); 
    
    


    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode(user),
    );
    
    if (response.statusCode != 200) {
        print("Register Failed with Status ${response.statusCode}: ${response.body}");
    }

    return response.statusCode == 200;
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  static Future<String?> getRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString("role");
  }
}