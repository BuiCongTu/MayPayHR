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
}
