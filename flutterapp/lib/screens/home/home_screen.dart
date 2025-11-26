import 'package:flutter/material.dart';
import 'package:flutterapp/screens/auth/login_screen.dart';


import '../payroll/payroll_list_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _userIdController = TextEditingController();
  final TextEditingController _tokenController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  final bool _showPayrollForm = false;

  @override
  void dispose() {
    _userIdController.dispose();
    _tokenController.dispose();
    super.dispose();
  }
  void _goToPayrollList() {
    if (_formKey.currentState!.validate()) {
      final userId = int.parse(_userIdController.text);
      final token = _tokenController.text;

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => PayrollListScreen(
            userId: userId,
            token: token,
          ),
        ),
      );
    }
  }

  void _clearForm() {
    _userIdController.clear();
    _tokenController.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Xem Bảng Lương'),
        centerTitle: true,
        elevation: 2,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    controller: _userIdController,
                    decoration: InputDecoration(
                      labelText: 'userId',
                      hintText: 'vd: 199050004',
                      prefixIcon: const Icon(Icons.person),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      filled: true,
                      fillColor: Colors.grey[50],
                    ),
                    keyboardType: TextInputType.number,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Vui lòng nhập Mã Nhân Viên';
                      }
                      if (int.tryParse(value) == null) {
                        return 'Mã Nhân Viên phải là số';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  TextFormField(
                    controller: _tokenController,
                    decoration: InputDecoration(
                      labelText: 'token',
                      hintText: 'token từ đăng nhập',
                      prefixIcon: const Icon(Icons.security),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      filled: true,
                      fillColor: Colors.grey[50],
                    ),
                    maxLines: 4,
                    minLines: 2,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'nhập Token';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 24),

                  Row(
                    children: [
                      // Clear Button
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _clearForm,
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                          child: const Text(
                            'Xóa',
                            style: TextStyle(fontSize: 16),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Submit Button
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _goToPayrollList,
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            backgroundColor: Colors.blue,
                          ),
                          child: const Text(
                            'Xem Bảng Lương',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}