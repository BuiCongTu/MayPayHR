class UserModel {
  final String? email;
  final String? role;
  final String? token;

  UserModel({this.email, this.role, this.token});

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      email: json['email'],
      role: json['role'],
      token: json['token'],
    );
  }
}
