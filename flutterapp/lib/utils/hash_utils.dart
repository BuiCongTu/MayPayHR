import 'dart:convert';
import 'package:crypto/crypto.dart';

class HashUtils {
  static String hashPass(String pass) {
    var bytes = utf8.encode(pass);
    var digest = sha256.convert(bytes);
    return digest.toString();
  }
}
