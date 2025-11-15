
import 'package:flutter/material.dart';
import 'package:flutterapp/screens/auth/AppTheme.dart';
import 'package:flutterapp/screens/auth/login_screen.dart';
import 'package:flutterapp/screens/home/admin_screen.dart';
import 'package:flutterapp/screens/home/home_screen.dart';
import 'package:flutterapp/screens/home/user_screen.dart';


final AppTheme appTheme = AppTheme();

void main() {
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final appTheme = AppTheme();

  @override
  void initState() {
    appTheme.addListener(() {
      setState(() {});
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Flutter App',
      theme:AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: appTheme.currentTheme,
      home: LoginScreen(),
      routes: {
        '/home': (context) => HomeScreen(),
        '/login': (context) => LoginScreen(),
        '/admin': (context) => AdminHomeScreen(),
        '/user': (context) => UserHomeScreen(),
      },

    );
  }
}

