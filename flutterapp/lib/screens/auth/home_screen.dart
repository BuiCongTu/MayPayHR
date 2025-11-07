
import 'package:flutter/material.dart';

class HomeScreen extends StatefulWidget {
  final Employee employee;

  const HomeScreen({super.key, required this.employee});

  @override
  State<StatefulWidget> createState() => HomeScreenState();
}

class HomeScreenState extends State<HomeScreen> {
  List<Employee> listEmp = [];
  List<Department> listDep = [];
  String queryEmp = '';
  String queryDep = '';
  final ApiService api = ApiService();
  String keyword = '';

  //thêm khai bao để lấy employee.name sau khi đã update
  late Employee currentEmp;

  @override
  void initState() {
    super.initState();
    currentEmp = widget.employee; // set employee ban dau final tuwf login qua
    WidgetsBinding.instance.addPostFrameCallback((_) {
      fetData();
    });
  }

  void fetData() async {
    if (keyword.isEmpty) {
      //fetch data tu API
      listEmp = await ApiService().getAllEmployees();
      listEmp.forEach(
        (emp) => print('Emp: ${emp.name}, Dep: ${emp.department?.name}'),
      );
      listDep = await api.getAllDepartments();

      // cap nhat laij current employee neeus co thay doi
      currentEmp = listEmp.firstWhere(
        (emp) => emp.code == currentEmp.code,
        orElse: () => currentEmp,
      );
      Future.delayed(Duration(seconds: 2)).then((value) => setState(() {}));
    } else {
      listEmp = await api.searchEmplopyeeByName(keyword);
      listDep = await api.getAllDepartments();
    }
    //sau khi thay ddoi data thi goi lam moi
    setState(() {});
  }

  void removeEmployee(String code) async {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Delete Employee'),
          content: Text('Are you sure you want to delete?'),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                api.deleteEmployee(code);
                Navigator.pop(context);
                setState(() {
                  fetData();
                });
              },
              child: Text('Delete'),
            ),
          ],
        );
      },
    );
  }

  void navigateToForm({Employee? employee}) async {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            AddEditScreen(employee: employee, onSave: fetData),
      ),
    );
  }

  void toggleAppThem() {}
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Hello, ${currentEmp.name}'),
        actions: [
          IconButton(onPressed: () => navigateToForm(), icon: Icon(Icons.add)),
          SizedBox(width: 8),
          IconButton(
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => LoginScreen()),
              );
            },
            icon: Icon(Icons.logout),
          ),
          SizedBox(width: 8),
          IconButton(
            onPressed: () {
              appTheme.toggleTheme();
            },
            icon: Icon(Icons.settings),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: EdgeInsets.all(14),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Enter keyword...',
                hintStyle: Theme.of(context).textTheme.bodyMedium,
                prefixIcon: Icon(Icons.search_off_outlined),
                prefixIconColor: Theme.of(context).textTheme.bodyMedium?.color,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(24)),
                ),
              ),
              onChanged: (value) {
                setState(() {
                  keyword = value;
                });
                fetData();
              },
            ),
          ),
          Expanded(
            child: Container(
              padding: EdgeInsets.all(14),
              child: listEmp.isEmpty
                  ? Center(
                      child: Text(
                        "No Data",
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    )
                  : ListView.builder(
                      itemCount: listEmp.length,
                      itemBuilder: (context, index) {
                        final emp = listEmp[index];
                        return ListTile(
                          title: Text(
                            emp.name.toString(),
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          subtitle: Text(
                            'Code: ${emp.code} | ${emp.department?.name.toString()}',
                            style: TextStyle(color: Colors.blue),
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                onPressed: () {
                                  navigateToForm(employee: emp);
                                },
                                icon: Icon(Icons.edit,
                                    color: Theme.of(context).textTheme.bodyMedium?.color),                              ),
                              IconButton(
                                onPressed: () {
                                  removeEmployee(emp.code.toString());
                                },
                                icon: Icon(
                                  Icons.delete_forever_outlined,
                                  color: Colors.red,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
