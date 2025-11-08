import 'dart:convert';

import 'package:crypto/crypto.dart';

class HashUtils {
  static String hashPass(String pass) {
    var bytes = utf8.encode(pass); //convert string to bytes
    var digest = sha256.convert(bytes); //dùng sha256 để mã hóa
    return digest.toString(); //return string
  }
}
