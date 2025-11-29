import 'dart:convert';
import 'package:http/http.dart' as http;
import '../configs/api_config.dart';
import '../services/storage_service.dart';
import '../models/overtime_model.dart';

class OvertimeService {
  final StorageService _storageService = StorageService();

  // Helper: headers with Token
  Future<Map<String, String>> _getHeaders() async {
    String? token = await _storageService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  /// 1. Fetch My Invites
  /// GET /api/app/overtime/my-invites
  Future<List<OvertimeInvite>> getMyInvites() async {
    final headers = await _getHeaders();
    final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.myOvertimeEndpoint}');

    try {
      final response = await http.get(url, headers: headers);

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => OvertimeInvite.fromJson(json)).toList();
      } else if (response.statusCode == 401) {
        throw Exception('Unauthorized. Please login again.');
      } else {
        throw Exception('Failed to load invites: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  /// 2. Respond to Invite
  /// POST /api/app/overtime/respond
  Future<bool> respondToInvite(int ticketId, String status) async {
    final headers = await _getHeaders();
    final url = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.respondOvertimeEndpoint}');

    final body = json.encode({
      'ticketId': ticketId,
      'status': status, // "accepted" or "rejected"
    });

    try {
      final response = await http.post(url, headers: headers, body: body);

      if (response.statusCode == 200) {
        return true;
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['message'] ?? 'Failed to respond');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
}