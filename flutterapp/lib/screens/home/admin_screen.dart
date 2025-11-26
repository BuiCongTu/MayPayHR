<<<<<<< HEAD
import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../auth/login_screen.dart';

class AdminHomeScreen extends StatelessWidget {
  const AdminHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Admin Dashboard"),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await AuthService.logout();
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => LoginScreen()),
              );
            },
          ),
        ],
      ),
      body: const Center(child: Text("Welcome, Admin!")),
    );
  }
}
=======
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class AdminHome extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text("Admin Home"),
        actions: [
          IconButton(
            onPressed: () {
              auth.logout();
              Navigator.pop(context);
            },
            icon: Icon(Icons.logout),
          )
        ],
      ),
      body: Center(
        child: Text("Welcome Admin: ${auth.currentUser?["fullName"]}"),
      ),
    );
  }
}
>>>>>>> f95b4f1a80b43d611a2cbcfda300d13d2d660221
