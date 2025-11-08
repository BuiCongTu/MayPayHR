import 'package:flutter/material.dart';
import 'package:flutterapp/providers/auth_provider.dart';
import 'package:flutterapp/screens/auth/login_screen.dart';
import 'package:flutterapp/screens/auth/register_screen.dart';
import 'package:flutterapp/screens/home/admin_screen.dart';
import 'package:flutterapp/screens/home/home_screen.dart';
import 'package:flutterapp/services/auth_service.dart';
import 'package:provider/provider.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      // Bắt đầu ứng dụng tại màn hình đăng nhập
      home: const LoginScreen(), 
    );
  }
}