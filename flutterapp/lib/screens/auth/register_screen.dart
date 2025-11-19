import 'package:flutter/material.dart';
import 'package:flutterapp/services/auth_service.dart';
import 'login_screen.dart';

class RegisterScreen extends StatefulWidget {
  @override
  RegisterScreenState createState() => RegisterScreenState();
}

class RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final fullNameCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final passwordCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  bool isLoading = false;

  String selectedSalaryType = 'TimeBased';

  void handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => isLoading = true);

    final payload = {
      "fullName": fullNameCtrl.text.trim(),
      "email": emailCtrl.text.trim(),
      "password": passwordCtrl.text.trim(),
      "phone": phoneCtrl.text.trim(),
      "salaryType": selectedSalaryType,
      "roleId": 199010006, // User
    };

    final error = await AuthService.register(payload);

    setState(() => isLoading = false);

    if (error == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Đăng ký thành công!")),
      );
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Đăng ký thất bại: $error")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Register")),
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Form(
              key: _formKey,
              child: ListView(
                children: [
                  TextFormField(
                    controller: fullNameCtrl,
                    decoration: const InputDecoration(labelText: 'Full Name'),
                    validator: (v) => v == null || v.isEmpty ? 'Full Name required' : null,
                  ),
                  TextFormField(
                    controller: emailCtrl,
                    decoration: const InputDecoration(labelText: 'Email'),
                    validator: (v) {
                      if (v == null || v.isEmpty) return 'Email required';
                      final regex = RegExp(r'^[^@]+@[^@]+\.[^@]+');
                      if (!regex.hasMatch(v)) return 'Invalid email';
                      return null;
                    },
                  ),
                  TextFormField(
                    controller: passwordCtrl,
                    decoration: const InputDecoration(labelText: 'Password'),
                    obscureText: true,
                    validator: (v) => v == null || v.isEmpty ? 'Password required' : null,
                  ),
                  TextFormField(
                    controller: phoneCtrl,
                    decoration: const InputDecoration(labelText: 'Phone'),
                    keyboardType: TextInputType.number,
                    validator: (v) {
                      if (v == null || v.isEmpty) return 'Phone required';
                      final regex = RegExp(r'^[0-9]{10,11}$');
                      if (!regex.hasMatch(v)) return 'Phone 10-11 digits';
                      return null;
                    },
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    value: selectedSalaryType,
                    decoration: const InputDecoration(labelText: 'Salary Type'),
                    items: const [
                      DropdownMenuItem(value: 'TimeBased', child: Text('Time Based')),
                      DropdownMenuItem(value: 'ProductBased', child: Text('Product Based')),
                    ],
                    onChanged: (v) => setState(() => selectedSalaryType = v!),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: isLoading ? null : handleRegister,
                    child: const Text('Register'),
                  ),
                ],
              ),
            ),
          ),
          if (isLoading)
            const Opacity(
              opacity: 0.6,
              child: ModalBarrier(dismissible: false, color: Colors.black),
            ),
          if (isLoading) const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
