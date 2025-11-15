import 'package:flutter/material.dart';
import 'package:flutterapp/screens/home/admin_screen.dart';
import 'package:flutterapp/screens/home/user_screen.dart';
import 'package:flutterapp/services/auth_service.dart';
import 'package:shared_preferences/shared_preferences.dart';


class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _checkAutoLogin();
  }

  // Tự động chuyển sang trang đúng nếu đã login
  Future<void> _checkAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString("token");
    final role = prefs.getString("role")?.toUpperCase();

    if (token != null && role != null) {
      if (role == "ADMIN") {
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const AdminHomeScreen()));
      } else {
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const UserHomeScreen()));
      }
    }
  }

  Future<void> _handleLogin() async {
    setState(() => _isLoading = true);

    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    try {
      final result = await AuthService.login(email, password);

      if (result != null) {
        final role = (result["role"] ?? "USER").toString().toUpperCase();

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Đăng nhập thành công!")),
        );

        if (role == "ADMIN") {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const AdminHomeScreen()));
        } else {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const UserHomeScreen()));
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Email hoặc mật khẩu không đúng.")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Lỗi: $e")),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Login")),
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextField(controller: _emailController, decoration: const InputDecoration(labelText: "Email")),
                TextField(controller: _passwordController, decoration: const InputDecoration(labelText: "Password"), obscureText: true),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  child: const Text("Login"),
                ),
              ],
            ),
          ),
          if (_isLoading)
            const Opacity(
              opacity: 0.6,
              child: ModalBarrier(dismissible: false, color: Colors.black),
            ),
          if (_isLoading)
            const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
