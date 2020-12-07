DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;
USE employee_db;

CREATE TABLE department(
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(30)
);

CREATE TABLE role(
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	title VARCHAR(30),
	salary DECIMAL,
	department_id INT REFERENCES department(id)
);

CREATE TABLE employee (
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	fist_name varchar(30),
	last_name VARCHAR(30),
	role_id INT REFERENCES role(id),
	manager_id INT REFERENCES employee(id)
);

INSERT INTO department 
(name)
VALUES 
("Sales"),
("Engineering"),
("Finance"),
("Legal");


INSERT INTO role 
(title, salary, department_id)
VALUES 
("Sale Lead", 12, 1),
("Salesperson", 9, 1),
("Lead Engineer", 12, 2),
("Software Engineer", 9, 2),
("Account Manager", 12, 3),
("Accountant", 9, 3),
("Legal Team Lead", 12, 4);