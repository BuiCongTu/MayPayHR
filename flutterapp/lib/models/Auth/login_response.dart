import 'package:flutterapp/models/user_models.dart';

class LoginResponse {
  String? token;
  String? tokenType;
  UserModels? user;

  LoginResponse({this.token, this.tokenType, this.user});

  Map<String, dynamic> toMap() {
    return {
      'token': token,
      'tokenType': tokenType,
      'user': user,
    };
  }

  factory LoginResponse.fromMap(Map<String, dynamic> map) {
    return LoginResponse(
      token: map['token'] as String ?? '',
      tokenType: map['tokenType'] as String ?? '',
      user: map['user'] != null ? UserModels.fromJson(map['user']) : null,    
    );
  }
}
