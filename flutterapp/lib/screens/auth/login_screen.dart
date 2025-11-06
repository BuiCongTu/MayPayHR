import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:crypto/crypto.dart';
import 'home_screen.dart';

//ham ma hoa password bang sha256
String hashPassword(String password) {
  var bytes = utf8.encode(password);
  var digest = sha256.convert(bytes);
  return digest.toString();
}

class LoginScreen extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => LoginScreenState();
}

class LoginScreenState extends State<LoginScreen> {
  Stream<String> clock() async* {
    while (true) {
      await Future.delayed(Duration(seconds: 1));
      yield DateFormat('HH:mm:ss').format(DateTime.now());
    }
  }

  final TextEditingController txtCode = TextEditingController();
  final TextEditingController txtPassword = TextEditingController();
  final ApiService api = ApiService();
  String? error;

  void login() async {
    String code = txtCode.text;
    String rawPassword = txtPassword.text;
    String hashedPassword = hashPassword(rawPassword);
    Employee? employee = await api.checkLogin(code, hashedPassword);
    if (employee != null) {
      //pushRepla laf bo trang login ra va chuyen sang trang khac
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => HomeScreen(employee: employee)),
      );
    } else {
      setState(() {
        String? error = "Employee not found";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        foregroundColor: Colors.red,
        title: StreamBuilder(
          stream: clock(),
          builder: (context, snapshot) {
            return Text(
              snapshot.data ?? "loading...",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            );
          },
        ),
        centerTitle: true,
      ),
      body: Padding(
        padding: EdgeInsets.all(13),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            TextField(
              controller: txtCode,
              decoration: InputDecoration(hintText: "Enter Code"),
            ),
            SizedBox(height: 12),
            TextField(
              controller: txtPassword,
              decoration: InputDecoration(hintText: "Enter Password"),
              obscureText: true,
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: login,
              child: Text("Login"),
            ),
          ],
        ),
      ),
    );
  }
}
