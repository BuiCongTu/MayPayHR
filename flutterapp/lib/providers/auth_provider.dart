import 'package:flutter/material.dart';
import 'package:flutterapp/services/auth_service.dart';


class AuthProvider extends ChangeNotifier {
  bool _isLoading = false;
  String? _token;

  bool get isLoading => _isLoading;
  String? get token => _token;
  Future<Map<String, dynamic>?> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    final responseMap = await AuthService.login(email, password);

    _isLoading = false;
    
    if (responseMap != null) {
      _token = responseMap["token"] as String?; 
    } else {
      _token = null;
    }
    
    notifyListeners();
    return responseMap;
  }

  Future<bool> register(Map<String, dynamic> userPayload) async {
    _isLoading = true;
    notifyListeners();

    final success = await AuthService.register(userPayload);

    _isLoading = false;
    notifyListeners();
    return success;
  }
  Future<void> logout() async {
    await AuthService.logout();
    _token = null;
    notifyListeners();
  }
}