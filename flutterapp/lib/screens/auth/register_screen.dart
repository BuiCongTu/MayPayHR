import 'package:flutter/material.dart';
import 'package:flutterapp/services/auth_service.dart';

class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _fullNameController = TextEditingController();
  final _phoneController = TextEditingController();
  String _selectedSalaryType = 'TimeBased';

  bool _isLoading = false; // trạng thái loading

  Future<void> handleRegister() async {
    setState(() {
      _isLoading = true; // bắt đầu loading
    });

    final userPayload = {
      "fullName": _fullNameController.text.trim(),
      "email": _emailController.text.trim(),
      "password": _passwordController.text.trim(), // đổi thành "password"
      "phone": _phoneController.text.trim(),
      "salaryType": _selectedSalaryType,
      "roleId": 2, // thêm roleId để tránh lỗi NotNull
    };

    try {
      bool success = await AuthService.register(userPayload);

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Đăng ký thành công!")),
        );
        Navigator.pop(context); // quay về login
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Đăng ký thất bại.")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Lỗi: $e")),
      );
    } finally {
      setState(() {
        _isLoading = false; // kết thúc loading
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register')),
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ListView(
              children: [
                TextField(controller: _fullNameController, decoration: const InputDecoration(labelText: 'Full Name')),
                TextField(controller: _emailController, decoration: const InputDecoration(labelText: 'Email')),
                TextField(controller: _passwordController, decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
                TextField(controller: _phoneController, decoration: const InputDecoration(labelText: 'Phone')),
                const SizedBox(height: 10),
                DropdownButton<String>(
                  value: _selectedSalaryType,
                  onChanged: (newValue) => setState(() => _selectedSalaryType = newValue!),
                  items: const [
                    DropdownMenuItem(value: 'TimeBased', child: Text('Time Based')),
                    DropdownMenuItem(value: 'ProductBased', child: Text('Product Based')),
                  ],
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: _isLoading ? null : handleRegister, // disable khi loading
                  child: const Text('Register'),
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
