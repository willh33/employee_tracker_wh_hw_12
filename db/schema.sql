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