
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/home_screen.dart';
import 'package:flutterapp/screens/auth/AppTheme.dart';
import 'package:flutterapp/screens/auth/login_screen.dart';
import 'package:flutterapp/screens/home/admin_screen.dart';
import 'package:flutterapp/screens/home/home_screen.dart';
import 'package:flutterapp/screens/home/user_screen.dart';


final AppTheme appTheme = AppTheme();

void main() {
  runApp(MyApp());
}
<<<<<<< HEAD

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
=======
class MyApp extends StatelessWidget {
  // Check token on startup if you saved phone earlier, you can pass it to loadToken
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: MaterialApp(
        title: 'My App',
        theme: ThemeData(primarySwatch: Colors.blue),
        home: Consumer<AuthProvider>(
          builder: (context, auth, _) {
            if (auth.isLoggedIn) {
              return HomeScreen();
            } else {
              return LoginScreen();
            }
          },
        ),
      ),
    );  }
>>>>>>> f95b4f1a80b43d611a2cbcfda300d13d2d660221
}

