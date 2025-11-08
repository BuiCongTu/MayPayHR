import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import 'login_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final fullNameController = TextEditingController(); 
  final phoneController = TextEditingController();
  final roleController = TextEditingController(text: "USER"); 

  final departmentIdController = TextEditingController();
  final lineIdController = TextEditingController();
  final skillLevelIdController = TextEditingController();
  final baseSalaryController = TextEditingController();
  DateTime? hireDate;

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    fullNameController.dispose();
    phoneController.dispose();
    roleController.dispose();
    departmentIdController.dispose();
    lineIdController.dispose();
    skillLevelIdController.dispose();
    baseSalaryController.dispose();
    super.dispose();
  }

  Future<void> _selectHireDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: hireDate ?? DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2101),
    );
    if (picked != null && picked != hireDate) {
      setState(() {
        hireDate = picked;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      resizeToAvoidBottomInset: true, 
      appBar: AppBar(title: const Text('Register Employee')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const Text(
              'User Registration (Full Form)',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.blueAccent),
            ),
            const SizedBox(height: 30),

            TextField(controller: emailController, decoration: const InputDecoration(labelText: 'Email (*)', border: OutlineInputBorder()), keyboardType: TextInputType.emailAddress),
            const SizedBox(height: 15),
            TextField(controller: passwordController, decoration: const InputDecoration(labelText: 'Password (*)', border: OutlineInputBorder()), obscureText: true),
            const SizedBox(height: 15),
            TextField(controller: fullNameController, decoration: const InputDecoration(labelText: 'Full Name (*)', border: OutlineInputBorder())),
            const SizedBox(height: 15),
            TextField(controller: phoneController, decoration: const InputDecoration(labelText: 'Phone Number (*)', border: OutlineInputBorder()), keyboardType: TextInputType.phone),
            const SizedBox(height: 15),

            
            const SizedBox(height: 30),

            const Text(
              'Optional Employment Details:',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 15),

            TextField(controller: departmentIdController, decoration: const InputDecoration(labelText: 'Department ID', border: OutlineInputBorder()), keyboardType: TextInputType.number),
            const SizedBox(height: 15),

            TextField(controller: lineIdController, decoration: const InputDecoration(labelText: 'Line ID', border: OutlineInputBorder()), keyboardType: TextInputType.number),
            const SizedBox(height: 15),

            TextField(controller: skillLevelIdController, decoration: const InputDecoration(labelText: 'Skill Level ID', border: OutlineInputBorder()), keyboardType: TextInputType.number),
            const SizedBox(height: 15),

            TextField(controller: baseSalaryController, decoration: const InputDecoration(labelText: 'Base Salary', border: OutlineInputBorder()), keyboardType: TextInputType.number),
            const SizedBox(height: 15),

            InkWell(
              onTap: () => _selectHireDate(context),
              child: InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Hire Date',
                  border: OutlineInputBorder(),
                  suffixIcon: Icon(Icons.calendar_today),
                ),
                child: Text(
                  hireDate == null 
                      ? 'Select Date' 
                      : '${hireDate!.toLocal()}'.split(' ')[0],
                  style: const TextStyle(fontSize: 16),
                ),
              ),
            ),
            
            const SizedBox(height: 40),
            
            if (authProvider.isLoading)
              const CircularProgressIndicator()
            else
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    backgroundColor: Colors.blueAccent,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () async {
                    if (emailController.text.isEmpty || 
                        passwordController.text.isEmpty || 
                        fullNameController.text.isEmpty || 
                        phoneController.text.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("Vui lòng nhập đầy đủ Email, Password, Full Name và Phone.")),
                      );
                      return;
                    }
                    final Map<String, dynamic> payload = {
                      "email": emailController.text.trim(),
                      "passwordHash": passwordController.text, 
                      "fullName": fullNameController.text.trim(),
                      "phone": phoneController.text.trim(),
                      "role": {"name": roleController.text.toUpperCase()}, 
                    };

                    
                    if (departmentIdController.text.isNotEmpty) {
                      payload["department"] = {int.tryParse(departmentIdController.text)};
                    }
                    if (lineIdController.text.isNotEmpty) {
                      payload["line"] = {int.tryParse(lineIdController.text)};
                    }
                    if (skillLevelIdController.text.isNotEmpty) {
                      payload["skillLevel"] = {int.tryParse(skillLevelIdController.text)};
                    }
                    if (baseSalaryController.text.isNotEmpty) {
                      payload["baseSalary"] = baseSalaryController.text; 
                    }
                    if (hireDate != null) {
                      payload["hireDate"] = hireDate!.toIso8601String().split('T')[0];
                    }

                    final success = await authProvider.register(payload);

                    if (success) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("Đăng ký thành công! Vui lòng đăng nhập.")),
                      );
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                      );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("Đăng ký thất bại! ")));

                    }
                  },
                  child: const Text('REGISTER EMPLOYEE', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
              ),
          ],
        ),
      ),
    );
  }
}