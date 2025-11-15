import 'package:flutter/material.dart';
import '../../models/payroll_model.dart';

class PayrollDetailScreen extends StatelessWidget {
  final PayrollModel payroll;

  const PayrollDetailScreen({
    Key? key,
    required this.payroll,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Lương Tháng ${payroll.getMonthYear()}'),
        centerTitle: true,
        elevation: 2,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionCard(
              title: 'Các Khoản Cộng',
              items: [
                ('Lương Cơ Bản', payroll.baseSalary ?? 0.0),
                ('Thưởng Sản Phẩm', payroll.productBonus ?? 0.0),
                ('Lương Tăng Ca', payroll.overtimePay ?? 0.0),
                ('Phụ Cấp', payroll.allowance ?? 0.0),
              ],
              showTotal: true,
              totalLabel: 'Tổng Thu Nhập',
              totalAmount: payroll.totalIncome,
            ),
            const SizedBox(height: 16),

            _buildSectionCard(
              title: 'Các Khoản Trừ',
              items: [
                ('Khấu Trừ', payroll.deduction ?? 0.0),
              ],
              showTotal: false,
            ),
            const SizedBox(height: 24),

            _buildTotalPaySection(),
            const SizedBox(height: 24),

            if (payroll.note != null && payroll.note!.isNotEmpty)
              _buildNoteSection(),
            const SizedBox(height: 24),

            _buildInfoSection(),
            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  backgroundColor: Colors.blue,
                ),
                child: const Text(
                  'Quay Lại',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required List<(String, double)> items,
    required bool showTotal,
    String? totalLabel,
    double? totalAmount,
  }) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Divider(height: 16, thickness: 1),

            ...items.map((item) {
              final (label, amount) = item;
              return _buildDetailRow(label, amount);
            }).toList(),

            if (showTotal && totalLabel != null && totalAmount != null) ...[
              const Divider(height: 16, thickness: 1),
              _buildDetailRow(
                totalLabel,
                totalAmount,
                isBold: true,
                color: Colors.blue,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(
      String label,
      double amount, {
        bool isBold = false,
        Color? color,
      }) {
    final payrollModel = PayrollModel(totalPay: amount);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              fontWeight: isBold ? FontWeight.w600 : FontWeight.normal,
              color: color,
            ),
          ),
          Text(
            payrollModel.formatCurrency(amount),
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTotalPaySection() {
    final payrollModel = PayrollModel(totalPay: payroll.totalPay ?? 0.0);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.green[400]!, Colors.green[600]!],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.green.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Text(
            'Lương Thực Nhận',
            style: TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            payrollModel.formatCurrency(payroll.totalPay ?? 0.0),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoteSection() {
    return Card(
      color: Colors.amber[50],
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.info_outline,
                  color: Colors.orange,
                  size: 20,
                ),
                const SizedBox(width: 8),
                const Text(
                  'Ghi Chú',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              payroll.note!,
              style: const TextStyle(
                fontSize: 13,
                color: Colors.grey,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoSection() {
    return Card(
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Thông Tin Lương',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Divider(height: 16, thickness: 1),
            _buildInfoItem(
              'Mã Lương',
              payroll.id?.toString() ?? 'N/A',
            ),
            _buildInfoItem(
              'Ngày Tạo',
              payroll.createdAt != null
                  ? '${payroll.createdAt!.day}/${payroll.createdAt!.month}/${payroll.createdAt!.year}'
                  : 'N/A',
            ),
            _buildInfoItem(
              'Tổng Thu Nhập',
              PayrollModel(totalPay: payroll.totalIncome)
                  .formatCurrency(payroll.totalIncome),
            ),
            _buildInfoItem(
              'Khấu Trừ',
              PayrollModel(totalPay: payroll.deduction ?? 0.0)
                  .formatCurrency(payroll.deduction ?? 0.0),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              color: Colors.grey,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}