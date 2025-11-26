<<<<<<< HEAD
import 'package:flutter/material.dart';
import 'package:flutterapp/services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  bool isLoading = false;
  String? token;

  bool get loading => isLoading;

  String? get tokens => token;

  Future<Map<String, dynamic>?> login(String phone, String password) async {
    isLoading = true;
    notifyListeners();

    final responseMap = await AuthService.login(phone, password);

    isLoading = false;
    if (responseMap != null) {
      token = responseMap["token"];
    } else {
      token = null;
    }
    notifyListeners();
    return responseMap;
  }

  Future<String?> register(Map<String, dynamic> userPayload) async {
    if (userPayload.isEmpty) return 'Payload empty';

    isLoading = true;
    notifyListeners();

    final String? errorMessage = await AuthService.register(userPayload);

    isLoading = false;
    notifyListeners();
    return errorMessage;
  }
=======
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  Map<String, dynamic>? currentUser;
  String? token;

  Future<bool> login(String phone, String password) async {
    final result = await AuthService.login(phone, password);
    if (result != null) {
      token = result["token"];
      currentUser = result["user"];
      notifyListeners();
      return true;
    }
    return false;
  }

  Future<void> logout() async {
    await AuthService.logout();
    token = null;
    currentUser = null;
    notifyListeners();
  }

  bool get isLoggedIn => token != null;
>>>>>>> f95b4f1a80b43d611a2cbcfda300d13d2d660221
}

