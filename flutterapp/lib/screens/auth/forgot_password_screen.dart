<<<<<<< HEAD
import 'package:flutter/material.dart';
import '../../services/auth_service.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ForgotPasswordScreenState createState() => ForgotPasswordScreenState();
}

class ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final emailCtrl = TextEditingController();
  bool isLoading = false;

  void handleForgot() async {
    setState(() => isLoading = true);
    bool success = await AuthService.forgotPassword(emailCtrl.text.trim());
    setState(() => isLoading = false);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(success ? "Check email để reset" : "Thất bại")),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Forgot Password")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: emailCtrl,
              decoration: const InputDecoration(labelText: "Email"),
            ),
            const SizedBox(height: 20),
            ElevatedButton(onPressed: isLoading ? null : handleForgot, child: const Text("Gửi")),
          ],
        ),
      ),
    );
  }
}
=======
import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import 'reset_password_screen.dart';

class ForgotPasswordScreen extends StatefulWidget {
  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordState();
}

class _ForgotPasswordState extends State<ForgotPasswordScreen> {
  final phoneCtrl = TextEditingController();
  String? otp;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Forgot Password")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            TextField(
              controller: phoneCtrl,
              decoration: InputDecoration(labelText: "Phone"),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                otp = await AuthService.forgotPassword(phoneCtrl.text.trim());
                if (otp != null) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ResetPasswordScreen(
                        phone: phoneCtrl.text.trim(),
                        otp: otp!,
                      ),
                    ),
                  );
                }
              },
              child: Text("Get OTP"),
            ),
          ],
        ),
      ),
    );
  }
}
>>>>>>> f95b4f1a80b43d611a2cbcfda300d13d2d660221
