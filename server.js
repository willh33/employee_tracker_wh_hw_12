const mysql = require("mysql");
const inquirer = require("inquirer");
const Employee = require("./model/Employee");
const Department = require("./model/Department");
const Role = require("./model/Role");

const connection = mysql.createConnection({
	host: "localhost",

	// Your port; if not 3306
	port: 3306,

	// Your username
	user: "root",

	// Your password
	password: "icecream",
	database: "employee_db"
});

let employees = [];
let roles = [];
let departments = [];

String.prototype.repeat = function(length) {
	return Array(length + 1).join(this);
};

/**
 * 3 parts:
 * 1. Create database with SQL file
 * 2. Create queries to do CRUD operations on tables
 * 3. Create inquire prompts that call the queries
 * 	1. Create server to begin prompts
 *  2. 
 */

connection.connect(function (err) {
	if (err) throw err;
	runPrompt();
});

const runPrompt = () => {
	inquirer
		.prompt({
			name: "action",
			type: "rawlist",
			message: "What would you like to do?",
			choices: [
				"View All Employees",
				//   "View All Employees by Department",
				//   "View All Employees by Manager",
				"Add Employee",
				// "Remove Employee",
				"Update Employee Role",
				//   "Update Employee Manager",
				"View All Roles",
				"Add Role",
				//   "Remove Role",
				"View all Departments",
				"Add Department",
				//   "Remove Department",
				"Exit"
			]
		})
		.then(function (answer) {
			switch (answer.action) {
				case "View All Employees":
					viewAllEmployees();
					break;

				case "Add Employee":
					addEmployee();
					break;

				case "Remove Employee":
					rangeSearch();
					break;

				case "Update Employee Role":
					updateEmployeeRole();
					break;

				case "View All Roles":
					viewAllRoles();
					break;

				case "Add Role":
					addRole();
					break;

				case "View all Departments":
					viewAllDepartments();
					break;

				case "Add Department":
					songAndAlbumSearch();
					break;

				case "Exit":
					connection.end();
					break;
			}
		});
}

const outputEmployees = (employees) => {
	console.log('\n');
	console.log(`id   first_name    last_name     title                 department    salary   manager`);
	console.log(`---  ------------  ------------  --------------------  -----------   -------  --------------------`);
	employees.forEach(emp => {
		let str = "";
		str += emp.id + ' '.repeat(3 - (emp.id + '').length + 1);
		str += ' ' + emp.first_name + ' '.repeat(12 - (emp.first_name + '').length + 1);
		str += ' ' + emp.last_name + ' '.repeat(12 - (emp.last_name + '').length + 1);
		str += ' ' + emp.title + ' '.repeat(20 - (emp.title + '').length + 1);
		str += ' ' + emp.name + ' '.repeat(11 - (emp.name + '').length + 2);
		str += ' ' + emp.salary + ' '.repeat(7 - (emp.salary + '').length + 1);
		str += ' ' + emp.manager + ' '.repeat(20 - (emp.manager + '').length + 1);
		console.log(str);
	})
	console.log('\n');
};

const outputRoles = (roles) => {
	console.log('\n');
	console.log(`id   title                 salary   department`);
	console.log(`---  --------------------  -------  -----------`);
	roles.forEach(role => {
		let str = "";
		str += role.id + ' '.repeat(3 - (role.id + '').length + 1);
		str += ' ' + role.title + ' '.repeat(20 - (role.title + '').length + 1);
		str += ' ' + role.salary + ' '.repeat(7 - (role.salary + '').length + 1);
		str += ' ' + role.dept_name + ' '.repeat(11 - (role.dept_name + '').length + 1);
		console.log(str);
	})
	console.log('\n');
};

const outputDepartments = (depts) => {
	console.log('\n');
	console.log(`id   department`);
	console.log(`---  -----------`);
	roles.forEach(role => {
		let str = "";
		str += role.id + ' '.repeat(3 - (role.id + '').length + 1);
		str += ' ' + role.dept_name + ' '.repeat(11 - (role.dept_name + '').length + 1);
		console.log(str);
	})
	console.log('\n');
};

const viewAllEmployees = () => {
	let emp = new Employee();
	emp.viewAllEmployees(connection, (rows) => {
		outputEmployees(rows);
		// rows.forEach(row => console.log(row));
		runPrompt();
	});
};

/**
 * Inquire of the user the information for the employee
 */
const addEmployee = () => {
	//Get the list of roles to use in our questions
	let role = new Role();
	role.viewAllRoles(connection, roles => {
		const questions = [
			{
				type: 'input',
				message: 'What is the Employee\'s First Name',
				name: 'firstName',
			},
			{
				type: 'input',
				message: 'What is the Employee\'s Last Name',
				name: 'lastName',
			},
		];
		//Add Roles to questions
		questions.push(
			{
				type: 'rawlist',
				message: 'What is the Employee\'s Role?',
				name: 'role',
				choices: roles.map(role => {return {name: role.title, value: role}; }),
			}
		);
		let emp = new Employee();
		emp.viewAllEmployees(connection, employees => {
			//Add employees to questions (to select manager)
			if(employees.length > 0)
				questions.push(
					{
						type: 'rawlist',
						message: 'Who is the Employee\'s Manager?',
						name: 'manager',
						choices: employees.map(employee => {return {name:  employee.first_name + ' ' + employee.last_name, value: employee} }),
					}
				);
			inquirer.prompt(questions).then( answer => {
				//insert employee, run prompt again
				emp.firstName = answer.firstName;
				emp.lastName = answer.lastName;
				emp.roleId = answer.role.id;
				if(answer.manager)
					emp.managerId = answer.manager.id;
				else
					emp.managerId = null;

				emp.addEmployee(connection, runPrompt);
			});
		})
	});
};

/**
 * Get list of employees, let the user select one to update the role,
 * Display the roles and let the user pick one
 */
const updateEmployeeRole = () => {
	//Get list of employees
	let emp = new Employee();
	emp.viewAllEmployees(connection, (rows) => {
		employees = rows;

		//Display employee data in nice format

		//Prompt user which employee they want to update
		inquirer.prompt([
			{
				type: 'list',
				message: `Which employee do you want to update the role for?`,
				name: 'employee',
				choices: employees.map(employee => { return {name: employee.first_name + ' ' + employee.last_name, value: employee} })
			}
		]).then(answer => {
			let role = new Role();
			let employee = new Employee(answer.employee.first_name, answer.employee.last_name, answer.employee.role_id, answer.employee.manager_id);
			//Get the roles and ask which role they want the selected employee to have.
			role.viewAllRoles(connection, roles => {
				//Prompt for the role
				inquirer.prompt(
					[
						{
							type: 'list',
							message: `Which role do you want to assign to ${employee.firstName + ' ' + employee.lastName}?`,
							name: 'newRole',
							choices: roles.map(role => { return {name: role.title, value: role} })
						}
				]).then(answer => {
					employee.updateEmployeeRole(connection, answer.newRole.id, () => { 
						console.log("Successfully updated employee's role!"); 
						runPrompt(); 
					});
				});
			});
		});
		
		
	});
};

/**
 * Retrieve and dispaly all the roles
 */
const viewAllRoles = () => {
	let role = new Role();
	role.viewAllRoles(connection, (rows) => {
		outputRoles(rows);
		runPrompt();
	});
};

/**
 * Inquire of the user the information for the role
 */
const addRole = () => {
	//Get the list of roles to use in our questions
	let role = new Role();
	role.viewAllRoles(connection, roles => {
		const questions = [
			{
				type: 'input',
				message: 'What is the Employee\'s First Name',
				name: 'firstName',
			},
			{
				type: 'input',
				message: 'What is the Employee\'s Last Name',
				name: 'lastName',
			},
		];
		//Add Roles to questions
		questions.push(
			{
				type: 'rawlist',
				message: 'What is the Employee\'s Role?',
				name: 'role',
				choices: roles.map(role => {return {name: role.title, value: role}; }),
			}
		);
		let emp = new Employee();
		emp.viewAllEmployees(connection, employees => {
			//Add employees to questions (to select manager)
			if(employees.length > 0)
				questions.push(
					{
						type: 'rawlist',
						message: 'Who is the Employee\'s Manager?',
						name: 'manager',
						choices: employees.map(employee => {return {name:  employee.first_name + ' ' + employee.last_name, value: employee} }),
					}
				);
			inquirer.prompt(questions).then( answer => {
				//insert employee, run prompt again
				emp.firstName = answer.firstName;
				emp.lastName = answer.lastName;
				emp.roleId = answer.role.id;
				if(answer.manager)
					emp.managerId = answer.manager.id;
				else
					emp.managerId = null;

				emp.addEmployee(connection, runPrompt);
			});
		})
	});
};

/**
 * Retrieve and dispaly all the departments
 */
const viewAllDepartments = () => {
	let dept = new Department();
	dept.viewAllDepartments(connection, (depts) => {
		outputDepartments(depts);
		runPrompt();
	});
};