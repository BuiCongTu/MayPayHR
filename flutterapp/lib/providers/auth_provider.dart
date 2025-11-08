import 'package:flutter/material.dart';
import 'package:flutterapp/services/auth_service.dart';


class AuthProvider extends ChangeNotifier {
  bool _isLoading = false;
  String? _token;

  bool get isLoading => _isLoading;
  String? get token => _token;

  // Xử lý Login
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    final success = await AuthService.login(email, password);

    _isLoading = false;
    if (success != null) {
      _token = success["token"];
    } else {
      _token = null;
    }
    notifyListeners();
    return success != null;
  }

  // Xử lý Register
  Future<bool> register(Map<String, dynamic> userPayload) async {
    _isLoading = true;
    notifyListeners();

    final success = await AuthService.register(userPayload);

    _isLoading = false;
    notifyListeners();
    return success;
  }
}
