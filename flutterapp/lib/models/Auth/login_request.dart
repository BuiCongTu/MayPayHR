class LoginRequest {
  String? email;
  String? password;

  LoginRequest({this.email, this.password});

  Map<String, dynamic> toMap() {
    return {
      'email': this.email,
      'password': this.password,
    };
  }

  factory LoginRequest.fromMap(Map<String, dynamic> map) {
    return LoginRequest(
      email: map['email'] as String ?? '',
      password: map['password'] as String ?? '',
    );
  }}
