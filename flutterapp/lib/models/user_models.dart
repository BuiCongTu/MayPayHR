import 'package:intl/intl.dart';

class UserModels {
  int? id;
  String? fullName;
  String? email;
  String? phone;
  int? roleId;
  String? roleName;
  int? departmentId;
  String? departmentName;
  int? lineId;
  String? lineName;
  int? skillLevelId;
  String? skillLevelName;
  String? salaryType;
  double? baseSalary;
  DateTime? hireDate;
  String? status;
  DateTime? createdAt;

  UserModels({
    this.id,
    this.fullName,
    this.email,
    this.phone,
    this.roleId,
    this.roleName,
    this.departmentId,
    this.departmentName,
    this.lineId,
    this.lineName,
    this.skillLevelId,
    this.skillLevelName,
    this.salaryType,
    this.baseSalary,
    this.hireDate,
    this.status,
    this.createdAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fullName': fullName,
      'email': email,
      'phone': phone,
      'roleId': roleId,
      'roleName': roleName,
      'departmentId': departmentId,
      'departmentName': departmentName,
      'lineId': lineId,
      'lineName': lineName,
      'skillLevelId': skillLevelId,
      'skillLevelName': skillLevelName,
      'salaryType': salaryType,
      'baseSalary': baseSalary,
      'hireDate': hireDate?.toIso8601String(),
      'status': status,
      'createdAt': createdAt?.toIso8601String(),
    };
  }


  factory UserModels.fromJson(Map<String, dynamic> json) {
    return UserModels(
      id: json['id'] ?? 0,
      fullName: json['fullName'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      roleId: json['roleId'],
      roleName: json['roleName'],
      departmentId: json['departmentId'],
      departmentName: json['departmentName'],
      lineId: json['lineId'],
      lineName: json['lineName'],
      skillLevelId: json['skillLevelId'],
      skillLevelName: json['skillLevelName'],
      salaryType: json['salaryType'],
      baseSalary: (json['baseSalary'] as num?)?.toDouble(),
      hireDate: json['hireDate'] != null ? DateTime.parse(json['hireDate']) : null,
      status: json['status'],
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
    );
  }
  bool get isWorker => roleName?.toLowerCase() == 'worker';

  bool get isManager => roleName?.toLowerCase() == 'manager';

  bool get isFactoryManager => roleName?.toLowerCase() == 'factory manager';

  bool get isFactoryDirector => roleName?.toLowerCase() == 'factory director';

  bool get isHR => roleName?.toLowerCase() == 'hr';

  bool get isAdmin => roleName?.toLowerCase() == 'admin';

  String formatBaseSalary() {
    if (baseSalary == null) return '0₫';
    final formatter = NumberFormat.currency(
      locale: 'vi_VN',
      symbol: '₫',
      decimalDigits: 0,
    );
    return formatter.format(baseSalary);
  }

  /// lấy ngày thuê theo định dạng
  String? getFormattedHireDate() {
    if (hireDate == null) return null;
    return DateFormat('dd/MM/yyyy').format(hireDate!);
  }


}
