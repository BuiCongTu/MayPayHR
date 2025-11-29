import 'package:flutter/material.dart';
import '../../models/overtime_model.dart';
import '../../services/overtime_service.dart';

class MyOvertimeScreen extends StatefulWidget {
  const MyOvertimeScreen({super.key});

  @override
  State<MyOvertimeScreen> createState() => _MyOvertimeScreenState();
}

class _MyOvertimeScreenState extends State<MyOvertimeScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final OvertimeService _overtimeService = OvertimeService();

  List<OvertimeInvite> _allInvites = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final data = await _overtimeService.getMyInvites();
      if (!mounted) return;
      setState(() {
        _allInvites = data;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _respond(int ticketId, String status) async {
    try {
      // Show loading indicator
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(child: CircularProgressIndicator()),
      );

      await _overtimeService.respondToInvite(ticketId, status);

      Navigator.pop(context); // Close loading dialog

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text("Successfully ${status == 'accepted' ? 'Accepted' : 'Rejected'}!"),
            backgroundColor: Colors.green
        ),
      );
      _loadData(); // Refresh list to remove the item
    } catch (e) {
      Navigator.pop(context); // Close loading dialog
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e"), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // Filter Lists locally based on status
    final pendingList = _allInvites.where((i) => i.status.toLowerCase() == 'pending').toList();
    final historyList = _allInvites.where((i) => i.status.toLowerCase() != 'pending').toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text("Overtime Management"),
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.blue,
          unselectedLabelColor: Colors.grey,
          indicatorColor: Colors.blue,
          tabs: [
            Tab(text: "Pending (${pendingList.length})"),
            Tab(text: "History"),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(_error!, style: const TextStyle(color: Colors.red), textAlign: TextAlign.center),
          const SizedBox(height: 10),
          ElevatedButton(onPressed: _loadData, child: const Text("Retry"))
        ],
      ))
          : TabBarView(
        controller: _tabController,
        children: [
          _buildPendingList(pendingList),
          _buildHistoryList(historyList),
        ],
      ),
    );
  }

  Widget _buildPendingList(List<OvertimeInvite> list) {
    if (list.isEmpty) return const Center(child: Text("No pending overtime invites."));

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      itemBuilder: (ctx, index) {
        final item = list[index];
        return Card(
          elevation: 3,
          margin: const EdgeInsets.only(bottom: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Chip(label: Text("Ticket #${item.ticketId}"), backgroundColor: Colors.orange[50]),
                    Text(item.overtimeDate, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                const SizedBox(height: 8),
                Text("Manager: ${item.managerName}", style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.access_time, size: 16, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text("${item.startTime} - ${item.endTime} (${item.hours}h)"),
                  ],
                ),
                const SizedBox(height: 4),
                Text("Line: ${item.lineName}", style: const TextStyle(color: Colors.blueGrey)),
                const Divider(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => _respond(item.ticketId, 'rejected'),
                        style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.red,
                            side: const BorderSide(color: Colors.red),
                            padding: const EdgeInsets.symmetric(vertical: 12)
                        ),
                        child: const Text("REJECT"),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => _respond(item.ticketId, 'accepted'),
                        style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            padding: const EdgeInsets.symmetric(vertical: 12)
                        ),
                        child: const Text("ACCEPT", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                )
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildHistoryList(List<OvertimeInvite> list) {
    if (list.isEmpty) return const Center(child: Text("No history found."));

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      itemBuilder: (ctx, index) {
        final item = list[index];
        final isAccepted = item.status.toLowerCase() == 'accepted';

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: Icon(
              isAccepted ? Icons.check_circle : Icons.cancel,
              color: isAccepted ? Colors.green : Colors.red,
              size: 32,
            ),
            title: Text(item.overtimeDate),
            subtitle: Text("${item.startTime} - ${item.endTime} (${item.hours}h)"),
            trailing: Text(
              isAccepted ? "ACCEPTED" : "REJECTED",
              style: TextStyle(
                  color: isAccepted ? Colors.green : Colors.red,
                  fontWeight: FontWeight.bold
              ),
            ),
          ),
        );
      },
    );
  }
}