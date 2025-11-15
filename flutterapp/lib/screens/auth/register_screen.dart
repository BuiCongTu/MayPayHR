import 'package:flutter/material.dart';
import 'package:flutterapp/services/auth_service.dart';

class RegisterScreen extends StatefulWidget {
  @override
  RegisterScreenState createState() => RegisterScreenState();
}

class RegisterScreenState extends State<RegisterScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final fullNameController = TextEditingController();
  final phoneController = TextEditingController();
  String selectedSalaryType = 'TimeBased';
  bool isLoading = false;
  final formKey = GlobalKey<FormState>();

  // Validate phone 10-11 digits
  String? validatePhone(String? value) {
    if (value == null || value.isEmpty) return 'Phone is required';
    final regex = RegExp(r'^[0-9]{10,11}$');
    if (!regex.hasMatch(value)) return 'Phone must be 10-11 digits';
    return null;
  }

  Future<void> handleRegister() async {
    if (!formKey.currentState!.validate()) return;

    setState(() => isLoading = true);

    final userPayload = {
      "fullName": fullNameController.text.trim(),
      "email": emailController.text.trim(),
      "password": passwordController.text.trim(),
      "phone": phoneController.text.trim(),
      "salaryType": selectedSalaryType,
      "roleId":199010006,// USER
    };

    final errorMessage = await AuthService.register(userPayload);

    setState(() => isLoading = false);

    if (errorMessage == null) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text("Đăng ký thành công!")));
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text("Đăng ký thất bại: $errorMessage")));
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
            child: Form(
              key: formKey,
              child: ListView(
                children: [
                  TextFormField(
                    controller: fullNameController,
                    decoration: const InputDecoration(labelText: 'Full Name'),
                    validator: (v) => v == null || v.isEmpty ? 'Full Name is required' : null,
                  ),
                  TextFormField(
                    controller: emailController,
                    decoration: const InputDecoration(labelText: 'Email'),
                    keyboardType: TextInputType.emailAddress,
                    validator: (v) {
                      if (v == null || v.isEmpty) return 'Email is required';
                      final regex = RegExp(r'^[^@]+@[^@]+\.[^@]+');
                      if (!regex.hasMatch(v)) return 'Invalid email';
                      return null;
                    },
                  ),
                  TextFormField(
                    controller: passwordController,
                    decoration: const InputDecoration(labelText: 'Password'),
                    obscureText: true,
                    validator: (v) => v == null || v.isEmpty ? 'Password is required' : null,
                  ),
                  TextFormField(
                    controller: phoneController,
                    decoration: const InputDecoration(labelText: 'Phone'),
                    keyboardType: TextInputType.number,
                    maxLength: 11,
                    validator: validatePhone,
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    value: selectedSalaryType,
                    decoration: const InputDecoration(labelText: 'Salary Type'),
                    onChanged: (v) => setState(() => selectedSalaryType = v!),
                    items: const [
                      DropdownMenuItem(value: 'TimeBased', child: Text('Time Based')),
                      DropdownMenuItem(value: 'ProductBased', child: Text('Product Based')),
                    ],
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
          if (isLoading)
            const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
