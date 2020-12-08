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
				"View All Employees by Manager",
				"Add Employee",
				// "Remove Employee",
				"Update Employee Role",
				"Update Employee Manager",
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

				case "Update Employee Manager":
					updateEmployeeManager();
					break;

				case "View All Employees by Manager":
					viewManagersEmployees();
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
					addDepartment();
					break;

				case "Exit":
					connection.end();
					break;
			}
		});
}

const outputEmployees = (employees) => {
	console.log('\n');
	console.log(`id   first_name    last_name     title                 department         salary   manager`);
	console.log(`---  ------------  ------------  --------------------  ----------------   -------  --------------------`);
	employees.forEach(emp => {
		let str = "";
		str += emp.id + ' '.repeat(3 - (emp.id + '').length + 1);
		str += ' ' + emp.first_name + ' '.repeat(12 - (emp.first_name + '').length + 1);
		str += ' ' + emp.last_name + ' '.repeat(12 - (emp.last_name + '').length + 1);
		str += ' ' + emp.title + ' '.repeat(20 - (emp.title + '').length + 1);
		str += ' ' + emp.name + ' '.repeat(16 - (emp.name + '').length + 2);
		str += ' ' + emp.salary + ' '.repeat(7 - (emp.salary + '').length + 1);
		str += ' ' + emp.manager + ' '.repeat(20 - (emp.manager + '').length + 1);
		console.log(str);
	})
	console.log('\n');
};

const outputRoles = (roles) => {
	console.log('\n');
	console.log(`id   title                 salary   department`);
	console.log(`---  --------------------  -------  ----------------`);
	roles.forEach(role => {
		let str = "";
		str += role.id + ' '.repeat(3 - (role.id + '').length + 1);
		str += ' ' + role.title + ' '.repeat(20 - (role.title + '').length + 1);
		str += ' ' + role.salary + ' '.repeat(7 - (role.salary + '').length + 1);
		str += ' ' + role.dept_name + ' '.repeat(16 - (role.dept_name + '').length + 1);
		console.log(str);
	})
	console.log('\n');
};

const outputDepartments = (depts) => {
	console.log('\n');
	console.log(`id   department`);
	console.log(`---  ----------------`);
	depts.forEach(dept => {
		let str = "";
		str += dept.id + ' '.repeat(3 - (dept.id + '').length + 1);
		str += ' ' + dept.name + ' '.repeat(16 - (dept.name + '').length + 1);
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
						choices: [...employees.map(employee => {return {name:  employee.first_name + ' ' + employee.last_name, value: employee} }), 'none' ],
					}
				);
			inquirer.prompt(questions).then( answer => {
				//insert employee, run prompt again
				emp.firstName = answer.firstName;
				emp.lastName = answer.lastName;
				emp.roleId = answer.role.id;
				if(answer.manager && answer.manager !== 'none')
					emp.managerId = answer.manager.id;
				else
					emp.managerId = null;

				emp.addEmployee(connection, () => {
					console.log("\nSuccessfully added Employee\n")
					runPrompt();
				});
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
						console.log("\nSuccessfully updated employee's role!\n"); 
						runPrompt(); 
					});
				});
			});
		});
	});
};

/**
 * Get list of employees, let the user select one to update the manager,
 * Display the managers and let the user pick one
 */
const updateEmployeeManager = () => {
	//Get list of employees
	let emp = new Employee();
	emp.viewAllEmployees(connection, (rows) => {
		employees = rows;

		//Display employee data in nice format

		//Prompt user which employee they want to update
		inquirer.prompt([
			{
				type: 'list',
				message: `Which employee do you want to update the manager for?`,
				name: 'employee',
				choices: employees.map(employee => { return {name: employee.first_name + ' ' + employee.last_name, value: employee} })
			},
			{
				type: 'list',
				message: `Which employee do you want to set the manager to?`,
				name: 'newManager',
				choices: employees.map(employee => { return {name: employee.first_name + ' ' + employee.last_name, value: employee} })
			}
		]).then(answer => {
			let employee = new Employee(answer.employee.first_name, answer.employee.last_name, answer.employee.role_id, answer.newManager.id);
			
			employee.updateEmployeeManager(connection, employee.managerId, () => { 
				console.log("\nSuccessfully updated employee's manager!\n"); 
				runPrompt(); 
			});
		});
		
		
	});
};

/**
 * Get list of employees, let the user select one to update the manager,
 * Display the managers and let the user pick one
 */
const viewManagersEmployees = () => {
	//Get list of employees
	let emp = new Employee();
	emp.viewAllEmployees(connection, (rows) => {
		employees = rows;

		//Display employee data in nice format

		//Prompt user which employee they want to update
		inquirer.prompt([
			{
				type: 'list',
				message: `Choose an employee to see the mployees that report to?`,
				name: 'manager',
				choices: employees.map(employee => { return {name: employee.first_name + ' ' + employee.last_name, value: employee} })
			},
		]).then(answer => {			
			emp.viewManagersEmployees(connection, answer.manager.id, (rows) => { 
				outputEmployees(rows);
				runPrompt(); 
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
	let dept = new Department();
	dept.viewAllDepartments(connection, depts => {
		const questions = [
			{
				type: 'input',
				message: 'What is the Title of the Role?',
				name: 'title',
			},
			{
				type: 'input',
				message: 'What is the Salary for the Role',
				name: 'salary',
			},
		];
		//Add Departments to questions
		questions.push(
			{
				type: 'rawlist',
				message: 'What is the Role\'s Department?',
				name: 'department',
				choices: depts.map(dept => {return {name: dept.name, value: dept}; }),
			}
		);
		//Inquire for the role data
		inquirer.prompt(questions).then( answer => {
			//insert role, run prompt again
			let role = new Role(answer.title, answer.salary, answer.department.id);
			role.addRole(connection, () => {
				console.log("\nSuccessfully added Role\n")
				runPrompt();
			});
		});
	});
};

/**
 * Inquire of the user the information for the department
 */
const addDepartment = () => {
	//Get the list of roles to use in our questions
	let dept = new Department();
	dept.viewAllDepartments(connection, depts => {
		const questions = [
			{
				type: 'input',
				message: 'What is the Name of the Department?',
				name: 'name',
			},
		];
		//Inquire for the role data
		inquirer.prompt(questions).then( answer => {
			//insert role, run prompt again
			let dept = new Department(answer.name);
			dept.addDepartment(connection, () => {
				console.log("\nSuccessfully add department\n");
				runPrompt();
			});
		});
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