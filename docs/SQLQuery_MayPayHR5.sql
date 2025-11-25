
CREATE DATABASE MayPayHR5
GO

USE MayPayHR5;
GO

-- =============================================
-- 1. tbRole - Vai trò
-- =============================================
CREATE TABLE tbRole (
    role_id INT PRIMARY KEY,
    [name] VARCHAR(100) UNIQUE NOT NULL,
    [description] TEXT,
    is_manager bit DEFAULT 0,
);
GO

INSERT INTO tbRole (role_id,[name], [description], is_manager) VALUES
(100,N'Admin', 'Administrator / Quản trị viên hệ thống',1),
(101,N'HR', 'Human Resources / Nhân sự, quản lý hồ sơ',1),
(102, N'Factory Director', 'Factory Director / Giám đốc nhà máy, duyệt cuối cùng',1),
(103, N'Factory Manager', 'Factory Manager / Quản lý nhà máy, duyệt đơn, tăng ca',1),
(104, N'Manager', 'Line/Department Manager / Quản lý chuyền, quản lý bộ phận',1),
(105, N'Leader', 'Tổ Trưởng',1),
(106, N'Assistant Leader', 'Tổ Phó',1),
(107, N'Worker', 'Worker / Công nhân trực tiếp sản xuất (may, KCS, hoàn thành)', 0)
GO

-- =============================================
-- 2. tbLeaveReason - Lý do nghỉ
-- =============================================
CREATE TABLE tbLeaveReason (
    leave_reason_id INT PRIMARY KEY,
    reason VARCHAR(255) NOT NULL,   -- Lý do nghỉ ngắn gọn
    [description] TEXT
);
GO

INSERT INTO tbLeaveReason (leave_reason_id,reason, description) VALUES
(100,'Common Illness/Bệnh thông thường', 'Common Illness / Nghỉ ốm thông thường, nghỉ ốm có giấy bệnh viện, điều trị ngoại trú.'),
(101,'Serious Illness/Bệnh nặng', 'Serious Illness / Nghỉ ốm có giấy khám bệnh viện, điều trị nội trú.'),
(102,'Maternity Leave/Thai sản', 'Maternity Leave / Chế độ thai sản'),
(103,'Personal Leave/Việc riêng', 'Personal Leave / Cưới hỏi, ma chay, việc cá nhân.'),
(104,'Unauthorized Leave/Nghỉ không phép', 'Unauthorized Leave / Nghỉ không xin phép'),
(105,'Annual Leave/Nghỉ phép năm', 'Annual Leave / Nghỉ theo quy định 12 ngày/năm');
GO

-- =============================================
-- 3. tbSkillLevel - Bậc tay nghề
-- =============================================
CREATE TABLE tbSkillLevel (
    skill_level_id INT PRIMARY KEY,
    [name] VARCHAR(100) NOT NULL,
    [description] TEXT
);
GO

INSERT INTO tbSkillLevel (skill_level_id, [name], [description]) VALUES
(100,'Level 1: Beginner', 'Mới vào nghề, cần được hướng dẫn và giám sát chặt chẽ.'),
(101,'Level 2: Basic Experience', 'Kinh nghiệm cơ bản, cần được hướng dẫn thêm'),
(102,'Level 3: Solid Experience', 'Kinh nghiệm vững vàng, đã được đào tạo bài bản'),
(103,'Level 4: Senior Worker', 'Kinh nghiệm lâu năm, hướng dẫn người khác - Leader, Ass. leader'),
(104,'Level 5: Expert Worker', 'Kinh nghiệm lâu năm, xử lý sản phẩm khó'),
(105,'Level 6: Sample Maker', 'Thợ may mẫu, có tay nghề cao và khả năng đọc, hiểu các bản vẽ kỹ thuật phức tạp'),
(106,'Level 7: Technical Master', 'Kỹ thuật may, tay nghề cao, chuyên sâu kỹ thuật may');
GO

-- =============================================
-- 4. tbDepartment - Phòng ban
-- =============================================
CREATE TABLE tbDepartment (
    department_id INT PRIMARY KEY,
    [name] VARCHAR(100) NOT NULL,
    [description] TEXT
);
GO

INSERT INTO tbDepartment (department_id, [name],[description]) VALUES
(100,'HR/Hành Chính', 'Thống kê lao động, Y tế, Bảo vệ, Tạp vụ, Tài xế.'),
(101,'Planning/Kế hoạch', 'Kế Hoạch sản xuất hàng, Kho nguyên liệu, Kho phụ liệu.'),
(102,'FQC', 'Quản lý chất lượng'),
(103,'Technical/Kỹ thuật', 'Kỹ thuật, Cơ điện, LEAN'),
(104,'Production/Sản xuất', 'Rập mẫu, Tổ cắt, Chuyền may, KCS TW'),
(105,'Finishing Center/Trung tâm hoàn thành', 'Tổ hoàn thành 1, tổ hoàn thành 2, tổ hoàn thành 3, Tổ hậu cần, KCS SW, Tổ Xuất hàng');
GO

-- =============================================
-- 5. tbSection / line - Bộ Phận thuộc phòng ban
-- =============================================
CREATE TABLE tbLine (
    line_id INT PRIMARY KEY,
    department_id INT NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] TEXT,

    CONSTRAINT FK_Line_Department FOREIGN KEY (department_id) REFERENCES tbDepartment(department_id),
);
GO

INSERT INTO tbLine (line_id, department_id, [name], [description]) VALUES
(100,105,'Operations/ Bộ phận Vận Hành','Bộ phận Vận Hành trực thuộc Finishing Center'),
(101,105,'Delivery/ Bộ phận Xuất Hàng','Bộ phận Xuất Hàng trực thuộc Finishing Center')
GO
-- =============================================
-- 6. tbSubSection - Bộ Phận thuộc phòng ban
-- =============================================
CREATE TABLE tbSubSection (
    sub_section_id INT PRIMARY KEY,
    line_id INT,
    [name] VARCHAR(100) NOT NULL,
    [description] TEXT,

    CONSTRAINT line_id FOREIGN KEY (line_id) REFERENCES tbLine(line_id),
);
GO

INSERT INTO tbSubSection (sub_section_id, line_id, [name], [description]) VALUES
(100,100,'Finishing/ Tổ Hoàn Thành','Tổ Hoàn Thành trực thuộc Bộ Phận Operations'),
(101,100,'Warehouse/ Tổ Hậu Cần','Tổ Hậu Cần trực thuộc Bộ Phận Operations'),
(102,100,'KCS SW/ Tổ Hậu Cần','Tổ Kiểm tra chất lượng sản phẩm tại chỗ, trực thuộc Bộ phận Operations.'),
(103,101,'Planning Local/ Tổ Xuất Hàng','Tổ Kế Hoạch Xuất Hàng, trực thuộc Bộ phận Delivery')
GO
-- =============================================
-- 7. tbWordUnit - công đoạn
-- =============================================
CREATE TABLE tbWordUnit (
    word_unit_id INT PRIMARY KEY,
    sub_section_id INT,
    [name] VARCHAR(100) NOT NULL,
    [description] TEXT,

    CONSTRAINT sub_section_id FOREIGN KEY (sub_section_id) REFERENCES tbSubSection(sub_section_id),
);
GO

INSERT INTO tbWordUnit (word_unit_id, sub_section_id, [name], [description]) VALUES
(100, 100, 'Sewing Programming', 'Công đoạn May lập trình, trực thuộc tổ Hoàn Thành Sản Phẩm.'),
(101, 100, 'Passant', 'Công đoạn Cắt chỉ, trực thuộc tổ Hoàn Thành Sản Phẩm.'),
(102,100,'Rivet', 'Công đoạn Đóng nút, trực thuộc tổ Hoàn Thành Sản Phẩm.'),
(103,100, 'Label Attaching', 'Công đoạn Đóng nhãn, trực thuộc tổ Hoàn Thành Sản Phẩm.'),
(104,100, 'Dust Cleaning', 'Công đoạn Hút bụi thành phẩm, trực thuộc tổ Hoàn Thành Sản Phẩm.'),
(105,100, 'Ironing', 'Công đoạn Ủi thành phẩm, trực thuộc tổ Hoàn Thành Sản Phẩm.'),
(106,100, 'Material Handler', 'Công đoạn Vận chuyển nội bộ, trực thuộc tổ Hoàn Thành Sản Phẩm.'),
(107, 101, 'Issuance & Storage', 'Công đoạn Bảo quản và Cấp phát Nhãn, trực thuộc tổ Hậu cần.'),
(108, 101, 'Folding & Packing', 'Công đoạn Gấp xếp và Đóng thùng thành phẩm, trực thuộc tổ Hậu cần.'),
(109, 101, 'Loading & Unloading', 'Công đoạn Bốc Xếp, trực thuộc tổ Hậu cần.'),
(110, 102, 'KCS SW', 'Công đoạn Quản lý chất lượng khâu Thành phẩm, trực thuộc tổ KCS SW.'),
(111, 103, 'Production Data Clerk', 'Công đoạn Thống kê Thành phẩm trước khi xuát hàng, trực thuộc Bộ phận Xuất hàng.')
GO

-- =============================================
-- 8. tbUser - Nhân viên
-- =============================================
CREATE TABLE tbUser (
    user_id INT IDENTITY(100,1) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male','Female','Other')),
    [address] NVARCHAR(255),
    role_id INT,
    department_id INT,
    line_id INT,
    sub_section_id INT,
    word_unit_id INT,
    salary_type VARCHAR(20) DEFAULT 'TimeBased' 
        CHECK (salary_type IN ('ProductBased', 'TimeBased')), -- Loại lương
    base_salary DECIMAL(10,2) DEFAULT 0,-- Lương cơ bản
    skill_level_id INT,-- Bậc tay nghề
    hire_date DATE,-- Ngày vào làm
    [status] VARCHAR(20) DEFAULT 'Active'   --IsActive
        CHECK (status IN ('Active', 'Inactive', 'Terminated')), -- Trạng thái
    face_data TEXT,-- Dữ liệu khuôn mặt
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_User_Role FOREIGN KEY (role_id) REFERENCES tbRole(role_id),
    CONSTRAINT FK_User_Department FOREIGN KEY (department_id) REFERENCES tbDepartment(department_id),
    CONSTRAINT FK_User_Line FOREIGN KEY (line_id) REFERENCES tbLine(line_id),
    CONSTRAINT FK_User_SubSection FOREIGN KEY (sub_section_id) REFERENCES tbSubSection(sub_section_id),
    CONSTRAINT FK_User_WordUnit FOREIGN KEY (word_unit_id) REFERENCES tbWordUnit(word_unit_id),
    CONSTRAINT FK_User_SkillLevel FOREIGN KEY (skill_level_id) REFERENCES tbSkillLevel(skill_level_id)
);
GO


---------------------------------------------------------
--Admin + HR
---------------------------------------------------------
INSERT INTO tbUser (full_name, email,password_hash, phone, gender, [address],
    role_id) VALUES
    ('Admin','admin@maypro.com','$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq','0900000001','Male', '01 NTMK, phường ABC, TPHCM', 100),
    ('HR','hr@maypro.com','$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq','0900000002','Female', '01 NTMK, phường ABC, TPHCM', 101)
GO

---------------------------------------------------------
-- FACTORY DIRECTOR (Female, 1 người, Level 106, Role 102)
---------------------------------------------------------
INSERT INTO tbUser (full_name, email, password_hash, phone, gender, [address],
    role_id, department_id, salary_type, base_salary, skill_level_id, hire_date, [status])
VALUES 
('Nguyễn Thị A', 'director@maypro.com', '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq', '0900001001', 'Female','01 NTMK, phường ABC, TPHCM',
102, 105, 'TimeBased', 30000000, 106, '2000-01-01', 'Active');

---------------------------------------------------------
-- FACTORY MANAGER (Female, 1 người, Level 106, Role 103)
---------------------------------------------------------
INSERT INTO tbUser (full_name, email, password_hash, phone, gender, [address],
    role_id, department_id, salary_type, base_salary, skill_level_id, hire_date, [status])
VALUES
('Đỗ Cẩm N', 'factory.manager@maypro.com', '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq', '0900001002', 'Female','02 NTMK, phường ABC, TPHCM',
103, 105, 'TimeBased', 22000000, 106, '2000-01-02', 'Active');

---------------------------------------------------------
-- MANAGER OPERATIONS (Female, 1 người, Level 104, Role 104)
---------------------------------------------------------
INSERT INTO tbUser (full_name, email, password_hash, phone, gender, [address],
    role_id, department_id,line_id, salary_type, base_salary, skill_level_id, hire_date, [status])
VALUES 
('Trần Thị C', 'manager.operations@maypro.com', '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq', '0900001003', 'Female','03 NTMK, phường ABC, TPHCM',
104, 105,100, 'TimeBased', 18000000, 104, '2002-01-01', 'Active');

---------------------------------------------------------
-- MANAGER DELIVERY (Female, 1 người, Level 104, Role 104)
---------------------------------------------------------
INSERT INTO tbUser (full_name, email, password_hash, phone, gender, [address],
    role_id, department_id, line_id, salary_type, base_salary, skill_level_id, hire_date, [status])
VALUES
('Trần Diễm M', 'manager.delivery@maypro.com', '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq', '0900001004', 'Female','04 NTMK, phường ABC, TPHCM',
104, 105, 100, 'TimeBased', 16000000, 104, '2008-01-01', 'Active');

---------------------------------------------------------
-- LEADER FINISHING (Female, 1 người, Level 103, Role 105)
---------------------------------------------------------
INSERT INTO tbUser (full_name, email, password_hash, phone, gender, [address],
    role_id, department_id, line_id, sub_section_id, salary_type, base_salary, skill_level_id, hire_date, [status])
VALUES
('Nguyễn Thị D', 'leader.finishing@maypro.com', '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq', '0900001005', 'Female','05 NTMK, phường ABC, TPHCM',
105, 105,100, 100, 'ProductBased', 16000000, 103, '2004-01-01', 'Active');

---------------------------------------------------------
-- ASSISTANT LEADER FINISHING (Female, 1 người, Level 103, Role 106)
---------------------------------------------------------
INSERT INTO tbUser (full_name, email, password_hash, phone, gender, [address],
    role_id, department_id,line_id, sub_section_id, salary_type, base_salary, skill_level_id, hire_date, [status])
VALUES
('Trần Cẩm T', 'assistant.finishing@maypro.com', '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq', '0900001006', 'Female','06 NTMK, phường ABC, TPHCM',
106, 105, 100, 100, 'ProductBased', 10000000, 103, '2012-03-01', 'Active');

---------------------------------------------------------
-- LEADER WAREHOUSE (Female, 1 người, Level 103, Role 105)
---------------------------------------------------------
INSERT INTO tbUser (full_name, email, password_hash, phone, gender, [address],
    role_id, department_id,line_id, sub_section_id, salary_type, base_salary, skill_level_id, hire_date, [status])
VALUES
('Chung Nguyên T', 'leader.warehouse@maypro.com', '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq', '0900001007', 'Female','07 NTMK, phường ABC, TPHCM',
105, 105,100,101, 'TimeBased', 12000000, 103, '2004-01-01', 'Active');

---------------------------------------------------------
-- ASSISTANT LEADER WAREHOUSE (Male, 1 người, Level 102, Role 106)
---------------------------------------------------------
INSERT INTO tbUser (full_name, email, password_hash, phone, gender, [address],
    role_id, department_id,line_id, sub_section_id, salary_type, base_salary, skill_level_id, hire_date, [status])
VALUES
('Trần Mạnh D', 'assistant.warehouse@maypro.com', '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq', '0900001008', 'Female','08 NTMK, phường ABC, TPHCM',
106, 105,100,101, 'TimeBased', 10000000, 102, '2014-01-01', 'Active');

---------------------------------------------------------
-- LEADER KCS SW (Female, 1 người, Level 103, Role 105)
---------------------------------------------------------
INSERT INTO tbUser (full_name, email, password_hash, phone, gender, [address],
    role_id, department_id,line_id, sub_section_id, salary_type, base_salary, skill_level_id, hire_date, [status])
VALUES
('Trần Quốc D', 'leader.kcssw@maypro.com', '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq', '0900001009', 'Female','09 NTMK, phường ABC, TPHCM',
105, 105,100,102, 'TimeBased', 15000000, 103, '2008-01-01', 'Active');

---------------------------------------------------------
-- LEADER PLANNING LOCAL (Female, 1 người, Level 103, Role 105)
---------------------------------------------------------
INSERT INTO tbUser (full_name, email, password_hash, phone, gender, [address],
    role_id, department_id,line_id, sub_section_id, salary_type, base_salary, skill_level_id, hire_date, [status])
VALUES
('Nguyễn Diệp M', 'leader.planning@maypro.com', '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq', '0900001010', 'Female','10 NTMK, phường ABC, TPHCM',
105, 105,101,103, 'TimeBased', 16000000, 103, '2007-01-01', 'Active');
GO

----phan 2 worker

DECLARE @phoneBase INT = 50001;

---------------------------------------------------------
-- WORD UNIT 100: Sewing Programming
-- Male 10 người (Level 102) + Female 20 người (Level 103)
---------------------------------------------------------
DECLARE @i INT = 1;
WHILE @i <= 10
BEGIN
    INSERT INTO tbUser(full_name, email, password_hash, phone, gender, [address],
        role_id, department_id,line_id, sub_section_id, word_unit_id, salary_type, base_salary, skill_level_id, hire_date, [status],face_data)
    VALUES (
        CONCAT('user', @i),
        CONCAT('user', @i, '@maypro.com'),
        '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq',
        CONCAT('09000', @phoneBase + @i),
        'Male',
        '111 NTMK, phường ABC, TPHCM',
        107, 105,100,100,100, 'ProductBased', 7000000, 102, '2020-01-10', 'Active',NULL
    );
    SET @i = @i + 1;
END;

SET @i = 1;
WHILE @i <= 20
BEGIN
    INSERT INTO tbUser(full_name, email, password_hash, phone, gender, [address],
        role_id, department_id,line_id, sub_section_id, word_unit_id, salary_type, base_salary, skill_level_id, hire_date, [status],face_data)
    VALUES (
        CONCAT('user1', @i),
        CONCAT('user1', @i, '@maypro.com'),
        '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq',
        CONCAT('09000', @phoneBase + 100 + @i),
        'Female',
        '111 NTMK, phường ABC, TPHCM',
        107, 105,100,100,100, 'ProductBased', 7000000, 103, '2024-01-10', 'Active',NULL
    );
    SET @i = @i + 1;
END;

---------------------------------------------------------
-- WORD UNIT 101: Passant (Female 10 người, Level 100)
---------------------------------------------------------
SET @i = 1;
WHILE @i <= 10
BEGIN
    INSERT INTO tbUser(full_name, email, password_hash, phone, gender, [address],
        role_id, department_id,line_id, sub_section_id, word_unit_id, salary_type, base_salary, skill_level_id, hire_date, [status],face_data)
    VALUES (
        CONCAT('user2', @i),
        CONCAT('user2', @i, '@maypro.com'),
        '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq',
        CONCAT('09000', @phoneBase + 200 + @i),
        'Female',
        '111 NTMK, phường ABC, TPHCM',
        107, 105,100,100,101, 'ProductBased', 5000000, 100, '2024-01-10', 'Active', NULL
    );
    SET @i = @i + 1;
END;

---------------------------------------------------------
-- WORD UNIT 102: Rivet (Female 5 người, Level 101)
---------------------------------------------------------
SET @i = 1;
WHILE @i <= 5
BEGIN
    INSERT INTO tbUser(full_name, email, password_hash, phone, gender, [address],
        role_id, department_id,line_id, sub_section_id, word_unit_id, salary_type, base_salary, skill_level_id, hire_date, [status],face_data) 
    VALUES (
        CONCAT('user3', @i),
        CONCAT('user3', @i, '@maypro.com'),
        '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq',
        CONCAT('09000', @phoneBase + 300 + @i),
        'Female',
        '111 NTMK, phường ABC, TPHCM',
        107, 105,100,100,102, 'ProductBased', 6000000, 101, '2024-01-10', 'Active', NULL
    );
    SET @i = @i + 1;
END;

---------------------------------------------------------
-- WORD UNIT 103: Label Attaching (Female 7 người, Level 101)
---------------------------------------------------------
SET @i = 1;
WHILE @i <= 7
BEGIN
    INSERT INTO tbUser(full_name, email, password_hash, phone, gender, [address],
        role_id, department_id,line_id, sub_section_id, word_unit_id, salary_type, base_salary, skill_level_id, hire_date, [status],face_data) 
    VALUES (
        CONCAT('user4', @i),
        CONCAT('user4', @i, '@maypro.com'),
        '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq',
        CONCAT('09000', @phoneBase + 400 + @i),
        'Female',
        '111 NTMK, phường ABC, TPHCM',
        107, 105,100,100,103, 'ProductBased', 6000000, 101, '2024-01-10', 'Active', NULL
    );
    SET @i = @i + 1;
END;

---------------------------------------------------------
-- WORD UNIT 104: Dust Cleaning (Male 3 người, Level 100)
---------------------------------------------------------
SET @i = 1;
WHILE @i <= 3
BEGIN
    INSERT INTO tbUser(full_name, email, password_hash, phone, gender, [address],
        role_id, department_id,line_id, sub_section_id, word_unit_id, salary_type, base_salary, skill_level_id, hire_date, [status],face_data) 
    VALUES (
        CONCAT('user5', @i),
        CONCAT('user5', @i, '@maypro.com'),
        '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq',
        CONCAT('09000', @phoneBase + 500 + @i),
        'Male',
        '111 NTMK, phường ABC, TPHCM',
        107, 105,100,100,104, 'ProductBased', 5500000, 100, '2024-01-10', 'Active', NULL
    );
    SET @i = @i + 1;
END;

---------------------------------------------------------
-- WORD UNIT 105: Ironing (Male 3 người, Level 102)
---------------------------------------------------------
SET @i = 1;
WHILE @i <= 3
BEGIN
    INSERT INTO tbUser(full_name, email, password_hash, phone, gender, [address],
        role_id, department_id,line_id, sub_section_id, word_unit_id, salary_type, base_salary, skill_level_id, hire_date, [status],face_data) 
    VALUES (
        CONCAT('user6', @i),
        CONCAT('user6', @i, '@maypro.com'),
        '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq',
        CONCAT('09000', @phoneBase + 600 + @i),
        'Male',
        '111 NTMK, phường ABC, TPHCM',
        107, 105,100,100,105, 'ProductBased', 6500000, 102, '2024-01-10', 'Active', NULL
    );
    SET @i = @i + 1;
END;

---------------------------------------------------------
-- WORD UNIT 106: Material Handler (Male 4 người, Level 100)
---------------------------------------------------------
SET @i = 1;
WHILE @i <= 4
BEGIN
    INSERT INTO tbUser(full_name, email, password_hash, phone, gender, [address],
        role_id, department_id,line_id, sub_section_id, word_unit_id, salary_type, base_salary, skill_level_id, hire_date, [status],face_data) 
    VALUES (
        CONCAT('user7', @i),
        CONCAT('user7', @i, '@maypro.com'),
        '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq',
        CONCAT('09000', @phoneBase + 700 + @i),
        'Male',
        '111 NTMK, phường ABC, TPHCM',
        107, 105,100,100,106, 'ProductBased', 5500000, 100, '2024-01-10', 'Active', NULL
    );
    SET @i = @i + 1;
END;

---------------------------------------------------------
-- WORD UNIT 107: Issuance & Storage (Female 3 người, Level 102)
---------------------------------------------------------
SET @i = 1;
WHILE @i <= 3
BEGIN
    INSERT INTO tbUser(full_name, email, password_hash, phone, gender, [address],
        role_id, department_id,line_id, sub_section_id, word_unit_id, salary_type, base_salary, skill_level_id, hire_date, [status],face_data) 
    VALUES (
        CONCAT('user8', @i),
        CONCAT('user8', @i, '@maypro.com'),
        '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq',
        CONCAT('09000', @phoneBase + 800 + @i),
        'Female',
        '111 NTMK, phường ABC, TPHCM',
        107, 105,100,101,107, 'TimeBased', 7000000, 102, '2024-01-10', 'Active', NULL
    );
    SET @i = @i + 1;
END;

---------------------------------------------------------
-- WORD UNIT 108: Folding & Packing (Female 5 người + Male 5 người, Level 101)
---------------------------------------------------------
SET @i = 1;
WHILE @i <= 5
BEGIN
    INSERT INTO tbUser(full_name, email, password_hash, phone, gender, [address],
        role_id, department_id, line_id, sub_section_id, word_unit_id, salary_type, base_salary, skill_level_id, hire_date, [status],face_data) 
    VALUES (
        CONCAT('user9', @i),
        CONCAT('user9', @i, '@maypro.com'),
        '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq',
        CONCAT('09000', @phoneBase + 900 + @i),
        'Female',
        '111 NTMK, phường ABC, TPHCM',
        107, 105,100,101,108, 'TimeBased', 6500000, 101, '2024-01-10', 'Active', NULL
    );
    SET @i = @i + 1;
END;

SET @i = 1;
WHILE @i <= 5
BEGIN
    INSERT INTO tbUser(full_name, email, password_hash, phone, gender, [address],
        role_id, department_id, line_id, sub_section_id, word_unit_id, salary_type, base_salary, skill_level_id, hire_date, [status],face_data) 
    VALUES (
        CONCAT('user10', @i),
        CONCAT('user10', @i, '@maypro.com'),
        '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq',
        CONCAT('09000', @phoneBase + 950 + @i),
        'Male',
        '111 NTMK, phường ABC, TPHCM',
        107, 105,100,101,108, 'TimeBased', 6500000, 101, '2024-01-10', 'Active', NULL
    );
    SET @i = @i + 1;
END;

---------------------------------------------------------
-- WORD UNIT 109: Loading & Unloading (Male 8 người, Level 100)
---------------------------------------------------------
SET @i = 1;
WHILE @i <= 8
BEGIN
    INSERT INTO tbUser(full_name, email, password_hash, phone, gender, [address],
        role_id, department_id, line_id, sub_section_id, word_unit_id, salary_type, base_salary, skill_level_id, hire_date, [status],face_data) 
    VALUES (
        CONCAT('user11', @i),
        CONCAT('user11', @i, '@maypro.com'),
        '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq',
        CONCAT('09000', @phoneBase + 1000 + @i),
        'Male',
        '111 NTMK, phường ABC, TPHCM',
        107, 105,100,101,109, 'TimeBased', 6000000, 100, '2024-01-10', 'Active', NULL
    );
    SET @i = @i + 1;
END;

---------------------------------------------------------
-- WORD UNIT 110: KCS SW (Female 4 người, Level 103)
---------------------------------------------------------
SET @i = 1;
WHILE @i <= 4
BEGIN
    INSERT INTO tbUser(full_name, email, password_hash, phone, gender, [address],
        role_id, department_id, line_id, sub_section_id, word_unit_id, salary_type, base_salary, skill_level_id, hire_date, [status],face_data) 
    VALUES (
        CONCAT('user12', @i),
        CONCAT('user12', @i, '@maypro.com'),
        '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq',
        CONCAT('09000', @phoneBase + 1100 + @i),
        'Female',
        '111 NTMK, phường ABC, TPHCM',
        107, 105,100,102,110, 'TimeBased', 10000000, 103, '2024-01-10', 'Active', NULL
    );
    SET @i = @i + 1;
END;

---------------------------------------------------------
-- WORD UNIT 111: Production Data Clerk (Female 2 người, Level 102)
---------------------------------------------------------
SET @i = 1;
WHILE @i <= 2
BEGIN
    INSERT INTO tbUser(full_name, email, password_hash, phone, gender, [address],
        role_id, department_id, line_id, sub_section_id, word_unit_id, salary_type, base_salary, skill_level_id, hire_date, [status],face_data) 
    VALUES (
        CONCAT('user13', @i),
        CONCAT('user13', @i, '@maypro.com'),
        '$2a$10$jcw0c1yYkDzTO4XTg/kTmeD3UggCAaQwpw1v1R76VMupvQMwelxwq',
        CONCAT('09000', @phoneBase + 1200 + @i),
        'Female',
        '111 NTMK, phường ABC, TPHCM',
        107, 105,100,103,111, 'TimeBased', 9000000, 102, '2024-01-10', 'Active', NULL
    );
    SET @i = @i + 1;
END;

GO


-- =============================================
-- 9. tbWorkSchedule - Lịch làm việc
-- =============================================
CREATE TABLE tbWorkSchedule (
    schedule_id INT IDENTITY(199070000,1) PRIMARY KEY,
    user_id INT NOT NULL,
    [date] DATE NOT NULL,
    shift_start TIME,
    shift_end TIME,
    is_holiday BIT DEFAULT 0, -- nghi le
    CONSTRAINT FK_WorkSchedule_User FOREIGN KEY (user_id) REFERENCES tbUser(user_id)
);
GO

INSERT INTO tbWorkSchedule (user_id, date, shift_start, shift_end, is_holiday)
SELECT TOP 5 user_id, '2025-10-30', '08:00', '17:00', 0
FROM tbUser WHERE role_id = (SELECT role_id FROM tbRole WHERE name = 'Worker');
GO

-- =============================================
-- 8. tbAttendance - Chấm công
-- =============================================
CREATE TABLE tbAttendance (
    attendance_id INT IDENTITY(199080000,1) PRIMARY KEY,
    user_id INT NOT NULL,
    [date] DATE NOT NULL,
    time_in TIME,
    time_out TIME,
    [status] VARCHAR(20) NOT NULL 
        CHECK (status IN ('success', 'late', 'manual', 'error')),
    reason TEXT,
    manual_updated_by INT,    -- Người sửa
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Attendance_User FOREIGN KEY (user_id) REFERENCES tbUser(user_id),
    CONSTRAINT FK_Attendance_UpdatedBy FOREIGN KEY (manual_updated_by) REFERENCES tbUser(user_id),
    INDEX idx_user_date NONCLUSTERED (user_id, date)
);
GO

INSERT INTO tbAttendance (user_id, date, time_in, time_out, status, reason)
SELECT TOP 3 user_id, '2025-10-30', 
    CASE WHEN ROW_NUMBER() OVER (ORDER BY user_id) = 1 THEN '08:02' ELSE '07:58' END,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY user_id) = 1 THEN '17:03' ELSE '17:00' END,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY user_id) = 1 THEN 'success' ELSE 'late' END,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY user_id) = 1 THEN NULL ELSE 'Kẹt xe' END
FROM tbUser WHERE role_id = (SELECT role_id FROM tbRole WHERE name = 'Worker');
GO

-- =============================================
-- 9. tbLeaveRequest - Đơn xin nghỉ
-- =============================================
CREATE TABLE tbLeaveRequest (
    request_id INT IDENTITY(199090000,1) PRIMARY KEY,
    user_id INT NOT NULL,     -- Người xin
    leave_reason_id INT NOT NULL,
    [type] VARCHAR(20) NOT NULL 
        CHECK (type IN ('ShortTerm', 'LongTerm', 'Maternity', 'Accident', 'Other')),
    [start_date] DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    [comment] TEXT,
    [status] VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'approved', 'rejected')),
    confirmed_by INT,
    approved_by INT,
    reject_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_LeaveRequest_User FOREIGN KEY (user_id) REFERENCES tbUser(user_id),
    CONSTRAINT FK_LeaveRequest_Reason FOREIGN KEY (leave_reason_id) REFERENCES tbLeaveReason(leave_reason_id),
    CONSTRAINT FK_LeaveRequest_ConfirmedBy FOREIGN KEY (confirmed_by) REFERENCES tbUser(user_id),
    CONSTRAINT FK_LeaveRequest_ApprovedBy FOREIGN KEY (approved_by) REFERENCES tbUser(user_id),
    INDEX idx_user_status NONCLUSTERED (user_id, status)
);
GO

INSERT INTO tbLeaveRequest (user_id, leave_reason_id, type, start_date, end_date, reason, comment, status, confirmed_by, approved_by)
SELECT TOP 1 
    u.user_id,
    (SELECT TOP 1 leave_reason_id FROM tbLeaveReason WHERE reason = 'Common Illness/Bệnh thông thường'),
    'ShortTerm', '2025-11-01', '2025-11-02', 'Ốm nhẹ', 'Đã xác nhận', 'approved',
    (SELECT user_id FROM tbUser WHERE full_name = 'Trần Thị B'),
    (SELECT user_id FROM tbUser WHERE full_name = 'Nguyễn Thị A')
FROM tbUser u WHERE u.role_id = (SELECT role_id FROM tbRole WHERE name = 'Worker');
GO

-- =============================================
-- 10. tbProposal - Đề xuất
-- =============================================
CREATE TABLE tbProposal (
    proposal_id INT IDENTITY(199100000,1) PRIMARY KEY,
    [type] VARCHAR(30) NOT NULL 
        CHECK (type IN ('SalaryIncrease', 'PositionChange', 'SkillLevelChange')),
    proposer_id INT NOT NULL,
    target_user_id INT NOT NULL,
    details NVARCHAR(MAX),
    reason TEXT,
    [status] VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'approved', 'rejected')),
    approved_by INT,
    reject_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Proposal_Proposer FOREIGN KEY (proposer_id) REFERENCES tbUser(user_id),
    CONSTRAINT FK_Proposal_Target FOREIGN KEY (target_user_id) REFERENCES tbUser(user_id),
    CONSTRAINT FK_Proposal_ApprovedBy FOREIGN KEY (approved_by) REFERENCES tbUser(user_id),
    INDEX idx_target_status NONCLUSTERED (target_user_id, status)
);
GO

INSERT INTO tbProposal (type, proposer_id, target_user_id, details, reason, status, approved_by)
SELECT 'SalaryIncrease', 
    (SELECT user_id FROM tbUser WHERE full_name = 'user1'),
    (SELECT TOP 1 user_id FROM tbUser WHERE role_id = (SELECT role_id FROM tbRole WHERE name = 'Worker')),
    N'Tăng lương 500,000', N'Hoàn thành xuất sắc', 'approved',
    (SELECT user_id FROM tbUser WHERE full_name = 'Nguyễn Thị A');
GO

-- =============================================
-- 11. tbOvertimeRequest - Yêu cầu tăng ca
-- =============================================
CREATE TABLE tbOvertimeRequest (
    request_id INT IDENTITY(199110000,1) PRIMARY KEY,
    factory_manager_id INT NOT NULL,
    department_id INT NOT NULL,
    overtime_time FLOAT NOT NULL,
    num_employees INT NOT NULL,
    [status] VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'processed')),
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_OvertimeRequest_Manager FOREIGN KEY (factory_manager_id) REFERENCES tbUser(user_id),
    CONSTRAINT FK_OvertimeRequest_Department FOREIGN KEY (department_id) REFERENCES tbDepartment(department_id)
);
GO

DECLARE @DeptHoanThanh INT = (SELECT department_id FROM tbDepartment WHERE name = 'Finishing Center/Trung tâm hoàn thành');
INSERT INTO tbOvertimeRequest (factory_manager_id, department_id, overtime_time, num_employees, status, details)
VALUES ((SELECT user_id FROM tbUser WHERE full_name = 'Nguyễn Thị A'), @DeptHoanThanh, 3.5, 50, 'processed', 'Tăng ca hoàn thành đơn hàng gấp');
GO

-- =============================================
-- 12. tbOvertimeTicket - Phiếu tăng ca
-- =============================================
CREATE TABLE tbOvertimeTicket (
    ticket_id INT IDENTITY(199120000,1) PRIMARY KEY, 
    manager_id INT NOT NULL,
    request_id INT, 
    employee_list NVARCHAR(MAX) NOT NULL,
    overtime_time DECIMAL(15,2) NOT NULL,
    reason TEXT,
    [status] VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'approved', 'rejected')),
    confirmed_by INT,
    approved_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_OvertimeTicket_Manager FOREIGN KEY (manager_id) REFERENCES tbUser(user_id),
    CONSTRAINT FK_OvertimeTicket_Request FOREIGN KEY (request_id) REFERENCES tbOvertimeRequest(request_id),
    CONSTRAINT FK_OvertimeTicket_ConfirmedBy FOREIGN KEY (confirmed_by) REFERENCES tbUser(user_id),
    CONSTRAINT FK_OvertimeTicket_ApprovedBy FOREIGN KEY (approved_by) REFERENCES tbUser(user_id)
);
GO

-- =============================================
-- 13. tbProduction - Sản lượng (theo bộ phận)
-- =============================================
CREATE TABLE tbProduction (
    production_id INT IDENTITY(199130000,1) PRIMARY KEY, 
    department_id INT NOT NULL,
    product_count INT NOT NULL,
    DOP DATE NOT NULL,
    unit_price DECIMAL(15,1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_Production_Department 
        FOREIGN KEY (department_id) REFERENCES tbDepartment(department_id),

    INDEX idx_dept_date NONCLUSTERED (department_id, DOP)
);
GO

DECLARE @DeptHoanThanh INT = (SELECT department_id FROM tbDepartment WHERE name = 'Finishing Center/Trung tâm hoàn thành');

INSERT INTO tbProduction (department_id, product_count, DOP, unit_price)
VALUES (@DeptHoanThanh, 1200, '2025-10-29', 150.5),
    (@DeptHoanThanh, 1350, '2025-10-30', 152.0);
GO

-- =============================================
-- 14. tbPayroll - Bảng lương
-- =============================================
CREATE TABLE tbPayroll (
    payroll_id INT IDENTITY(199140000,1) PRIMARY KEY,
    [month] DATE NOT NULL, 
    department_id INT NOT NULL,
    total_salary DECIMAL(12,2) NOT NULL,
    details NVARCHAR(MAX),
    [status] VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'balanced', 'approved', 'rejected')),
    created_by INT NOT NULL,
    approved_by INT, 
    balance_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Payroll_Department FOREIGN KEY (department_id) REFERENCES tbDepartment(department_id),
    CONSTRAINT FK_Payroll_CreatedBy FOREIGN KEY (created_by) REFERENCES tbUser(user_id),
    CONSTRAINT FK_Payroll_ApprovedBy FOREIGN KEY (approved_by) REFERENCES tbUser(user_id),
    INDEX idx_month_status NONCLUSTERED (month, status)
);
GO
DECLARE @DeptHoanThanh INT = (SELECT department_id FROM tbDepartment WHERE name = 'Finishing Center/Trung tâm hoàn thành');

INSERT INTO tbPayroll (month, department_id, total_salary, details, status, created_by, approved_by)
VALUES ('2025-10-01', @DeptHoanThanh, 850000000.00, N'Bảng lương tháng 10', 'approved',
        (SELECT user_id FROM tbUser WHERE full_name = 'Nguyễn Thị A'),
        (SELECT user_id FROM tbUser WHERE full_name = 'Dương Thị N'));
GO

-- =============================================
-- 15. tbReservedPayroll - Quỹ dự phòng
-- =============================================
CREATE TABLE tbReservedPayroll (
    reserved_id INT IDENTITY(199150000,1) PRIMARY KEY,
    payroll_id INT NOT NULL,
    reserved_amount DECIMAL(12,2) NOT NULL,
    details NVARCHAR(MAX), 
    created_by INT NOT NULL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_ReservedPayroll_Payroll FOREIGN KEY (payroll_id) REFERENCES tbPayroll(payroll_id),
    CONSTRAINT FK_ReservedPayroll_CreatedBy FOREIGN KEY (created_by) REFERENCES tbUser(user_id)
);
GO

INSERT INTO tbReservedPayroll (payroll_id, reserved_amount, details, created_by)
VALUES ((SELECT MAX(payroll_id) FROM tbPayroll), 50000000.00, 'Dự phòng thưởng cuối năm', 
        (SELECT user_id FROM tbUser WHERE full_name = 'Nguyễn Thị A'));
GO

-- =============================================
-- 16. tbUserHistory - Lịch sử thay đổi
-- =============================================
CREATE TABLE tbUserHistory (
    history_id INT IDENTITY(199160000,1) PRIMARY KEY, 
    user_id INT NOT NULL,
    field_changed VARCHAR(100) NOT NULL, 
    old_value TEXT, 
    new_value TEXT,
    updated_by INT NOT NULL,
    [timestamp] DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_UserHistory_User FOREIGN KEY (user_id) REFERENCES tbUser(user_id),
    CONSTRAINT FK_UserHistory_UpdatedBy FOREIGN KEY (updated_by) REFERENCES tbUser(user_id)
);
GO

INSERT INTO tbUserHistory (user_id, field_changed, old_value, new_value, updated_by)
SELECT TOP 1 user_id, 'base_salary', '6500000', '7000000', 
    (SELECT user_id FROM tbUser WHERE full_name = 'Nguyễn Thị A')
FROM tbUser WHERE role_id = (SELECT role_id FROM tbRole WHERE name = 'Worker');
GO

-- =============================================
-- 17. tbNotification - Thông báo
-- =============================================
CREATE TABLE tbNotification (
    notification_id INT IDENTITY(199170000,1) PRIMARY KEY, 
    recipient_id INT NOT NULL,
    [type] VARCHAR(20) NOT NULL 
        CHECK (type IN ('error', 'approval', 'rejection', 'other')),
    [message] TEXT NOT NULL,
    sent_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    [status] VARCHAR(10) DEFAULT 'sent' 
        CHECK (status IN ('sent', 'read')),
    CONSTRAINT FK_Notification_Recipient FOREIGN KEY (recipient_id) REFERENCES tbUser(user_id)
);
GO

-- =============================================
-- 18. Chi tiết lương từng nhân viên theo tháng
-- =============================================
CREATE TABLE tbEmployeePayroll (
    detail_id INT IDENTITY(199180000,1) PRIMARY KEY,-- ID chi tiết lương
    payroll_id INT NOT NULL,   -- Liên kết bảng lương tháng (tbPayroll)
    user_id INT NOT NULL,        -- Nhân viên
    base_salary DECIMAL(12,2) NOT NULL, -- Lương cơ bản
    product_bonus DECIMAL(12,2) DEFAULT 0,  -- Thưởng sản lượng
    overtime_pay DECIMAL(12,2) DEFAULT 0, -- Tiền tăng ca
    allowance DECIMAL(12,2) DEFAULT 0,-- Phụ cấp
    deduction DECIMAL(12,2) DEFAULT 0,-- Khấu trừ (phạt, nghỉ không phép)
    total_pay DECIMAL(12,2) NOT NULL,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_EmployeePayroll_Payroll 
        FOREIGN KEY (payroll_id) REFERENCES tbPayroll(payroll_id),
    CONSTRAINT FK_EmployeePayroll_User 
        FOREIGN KEY (user_id) REFERENCES tbUser(user_id),

    INDEX idx_user_payroll NONCLUSTERED (user_id, payroll_id)
);
GO

-- Lấy payroll_id của bảng lương tháng 10
DECLARE @PayrollID INT = (SELECT MAX(payroll_id) FROM tbPayroll);

-- Lấy 5 nhân viên Worker đầu tiên
INSERT INTO tbEmployeePayroll (payroll_id, user_id, base_salary, product_bonus, overtime_pay, allowance, deduction, total_pay, note)
SELECT TOP 5
    @PayrollID,
    user_id,
    base_salary,
    CASE 
        WHEN salary_type = 'ProductBased' THEN base_salary * 0.15  -- Thưởng 15% nếu theo sản lượng
        ELSE 0 
    END,
    CASE WHEN user_id % 3 = 0 THEN 500000 ELSE 300000 END, -- Tăng ca ngẫu nhiên
    200000,   -- Phụ cấp cố định
    CASE WHEN user_id % 10 = 0 THEN 100000 ELSE 0 END, -- Phạt (nghỉ không phép)
    base_salary 
        + (CASE WHEN salary_type = 'ProductBased' THEN base_salary * 0.15 ELSE 0 END)
        + (CASE WHEN user_id % 3 = 0 THEN 500000 ELSE 300000 END)
        + 200000
        - (CASE WHEN user_id % 10 = 0 THEN 100000 ELSE 0 END),
    N'Lương tháng 10 - ' + 
    CASE 
        WHEN user_id % 10 = 0 THEN 'Có khấu trừ nghỉ không phép'
        ELSE 'Đầy đủ'
    END
FROM tbUser 
WHERE role_id = (SELECT role_id FROM tbRole WHERE name = 'Worker')
  AND department_id = (SELECT department_id FROM tbDepartment WHERE name = 'Trung tâm hoàn thành');
GO

CREATE TABLE tbPasswordResetToken (
    token_id INT IDENTITY(1,1) PRIMARY KEY,
    token VARCHAR(500) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    expiry_date DATETIME NOT NULL,
    used BIT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT FK_PasswordResetToken_User 
        FOREIGN KEY (user_id) REFERENCES tbUser(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_token ON tbPasswordResetToken(token);
CREATE INDEX idx_user_used ON tbPasswordResetToken(user_id, used);
GO

-- Sample insert: add one example employee payroll using the latest payroll
INSERT INTO tbEmployeePayroll (payroll_id, user_id, base_salary, product_bonus, overtime_pay, allowance, deduction, total_pay, note)
VALUES (
    (SELECT MAX(payroll_id) FROM tbPayroll),
    (SELECT TOP 1 user_id FROM tbUser WHERE role_id = (SELECT role_id FROM tbRole WHERE name = 'Worker')),
    6500000.00,
    6500000.00 * 0.15,   -- 15% product bonus for ProductBased example
    300000.00,
    200000.00,
    0.00,
    6500000.00 + (6500000.00 * 0.15) + 300000.00 + 200000.00,
    N'Example: auto-inserted payroll detail'
);
GO

-----------------------------
SELECT * FROM tbRole
SELECT * FROM tbLeaveReason
SELECT * FROM tbSkillLevel
SELECT * FROM tbDepartment
SELECT * FROM tbUser
SELECT * FROM tbLine
SELECT * FROM tbWorkSchedule
SELECT * FROM tbAttendance
SELECT * FROM tbLeaveRequest
SELECT * FROM tbProposal
SELECT * FROM tbOvertimeRequest
SELECT * FROM tbOvertimeTicket
SELECT * FROM tbProduction
SELECT * FROM tbPayroll
SELECT * FROM tbReservedPayroll
SELECT * FROM tbUserHistory
SELECT * FROM tbNotification
SELECT * FROM tbEmployeePayroll
SELECT * FROM tbPasswordResetToken

------------------face------------------
-- =====================================================
-- TẠO BẢNG: tb_face_training
-- Lưu trữ thông tin training gương mặt của nhân viên
-- =====================================================
CREATE TABLE tb_face_training (
    face_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    face_embedding VARBINARY(MAX),-- Vector embedding từ Opencv
    face_image_path VARCHAR(500), -- Đường dẫn ảnh lưu local
    training_date DATETIME2, -- Ngày/giờ train gương mặt
    is_trained BIT DEFAULT 0,  -- Flag: đã train hay chưa
    model_version VARCHAR(50),-- Version của model (vd: v1.0, v2.0)
    confidence DECIMAL(5,4), -- Độ tin cậy (0.0 - 1.0)
    trained_by_user_id INT, -- User ID của HR/Admin train
    notes NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    -- Foreign Key
    CONSTRAINT FK_tb_face_training_user 
        FOREIGN KEY (user_id) REFERENCES tbUser(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_tb_face_training_trained_by 
        FOREIGN KEY (trained_by_user_id) REFERENCES tbUser(user_id)
);
GO

-- =====================================================
-- TẠO BẢNG: tb_face_scan_log
-- Lưu lịch sử quét gương mặt (chấm công)
-- =====================================================
CREATE TABLE tb_face_scan_log (
    scan_id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    scan_image_path VARCHAR(500),
    matched_face_id INT,
    matched_confidence DECIMAL(5,4),
    scan_date DATETIME2 DEFAULT GETDATE(),
    is_matched BIT DEFAULT 0,
    is_recognized BIT DEFAULT 0,
    scan_type VARCHAR(20) DEFAULT 'CHECK_IN',
    attendance_id INT,
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_tb_face_scan_log_user
        FOREIGN KEY (user_id) REFERENCES tbUser(user_id),
    CONSTRAINT FK_tb_face_scan_log_face_training
        FOREIGN KEY (matched_face_id) REFERENCES tb_face_training(face_id)
);

CREATE INDEX idx_user_date ON tb_face_scan_log(user_id, scan_date);
CREATE INDEX idx_scan_type ON tb_face_scan_log(scan_type);
GO

CREATE INDEX IDX_face_training_userid ON tb_face_training(user_id);
CREATE INDEX IDX_face_training_is_train ON tb_face_training(is_trained);
CREATE UNIQUE INDEX UX_face_training_userid ON tb_face_training(user_id) 
    WHERE is_trained = 1;  -- Chỉ 1 training active per user
GO

CREATE INDEX IDX_face_scan_log_userid ON tb_face_scan_log(user_id);
CREATE INDEX IDX_face_scan_log_scandate ON tb_face_scan_log(scan_date);
CREATE INDEX IDX_face_scan_log_ismatched ON tb_face_scan_log(is_matched);
CREATE INDEX IDX_face_scan_log_matched_faceid ON tb_face_scan_log(matched_face_id);
GO

CREATE TRIGGER TR_tb_face_training_update
ON tb_face_training
AFTER UPDATE
AS
BEGIN
    UPDATE tb_face_training
    SET updated_at = GETDATE()
    WHERE face_id IN (SELECT face_id FROM inserted);
END;
GO

CREATE INDEX idx_attendance_user_date ON tbAttendance(user_id, date);
CREATE INDEX idx_attendance_date ON tbAttendance(date);
CREATE INDEX idx_attendance_status ON tbAttendance(status);
CREATE INDEX idx_attendance_user_id ON tbAttendance(user_id);
CREATE INDEX idx_attendance_department ON tbAttendance(user_id);
GO

