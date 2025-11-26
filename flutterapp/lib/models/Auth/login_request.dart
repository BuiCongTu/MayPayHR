class LoginRequest {
  String? phone;
  String? password;

  LoginRequest({this.phone, this.password});

  Map<String, dynamic> toMap() {
    return {
      'phone': phone,
      'password': password,
    };
  }


  factory LoginRequest.fromMap(Map<String, dynamic> map) {
    return LoginRequest(
      phone: map['phone'] as String? ?? '',
      password: map['password'] as String? ?? '',
    );
  }
    }

