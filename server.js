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
					songAndAlbumSearch();
					break;

				case "View all Departments":
					songAndAlbumSearch();
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

function multiSearch() {
	const query = "SELECT artist FROM top5000 GROUP BY artist HAVING count(*) > 1";
	connection.query(query, function (err, res) {
		for (const i = 0; i < res.length; i++) {
			console.log(res[i].artist);
		}
		runSearch();
	});
}

function rangeSearch() {
	inquirer
		.prompt([
			{
				name: "start",
				type: "input",
				message: "Enter starting position: ",
				validate: function (value) {
					if (isNaN(value) === false) {
						return true;
					}
					return false;
				}
			},
			{
				name: "end",
				type: "input",
				message: "Enter ending position: ",
				validate: function (value) {
					if (isNaN(value) === false) {
						return true;
					}
					return false;
				}
			}
		])
		.then(function (answer) {
			const query = "SELECT position,song,artist,year FROM top5000 WHERE position BETWEEN ? AND ?";
			connection.query(query, [answer.start, answer.end], function (err, res) {
				for (const i = 0; i < res.length; i++) {
					console.log(
						"Position: " +
						res[i].position +
						" || Song: " +
						res[i].song +
						" || Artist: " +
						res[i].artist +
						" || Year: " +
						res[i].year
					);
				}
				runSearch();
			});
		});
}

function songSearch() {
	inquirer
		.prompt({
			name: "song",
			type: "input",
			message: "What song would you like to look for?"
		})
		.then(function (answer) {
			console.log(answer.song);
			connection.query("SELECT * FROM top5000 WHERE ?", { song: answer.song }, function (err, res) {
				console.log(
					"Position: " +
					res[0].position +
					" || Song: " +
					res[0].song +
					" || Artist: " +
					res[0].artist +
					" || Year: " +
					res[0].year
				);
				runSearch();
			});
		});
}

function songAndAlbumSearch() {
	inquirer
		.prompt({
			name: "artist",
			type: "input",
			message: "What artist would you like to search for?"
		})
		.then(function (answer) {
			const query = "SELECT top_albums.year, top_albums.album, top_albums.position, top5000.song, top5000.artist ";
			query += "FROM top_albums INNER JOIN top5000 ON (top_albums.artist = top5000.artist AND top_albums.year ";
			query += "= top5000.year) WHERE (top_albums.artist = ? AND top5000.artist = ?) ORDER BY top_albums.year, top_albums.position";

			connection.query(query, [answer.artist, answer.artist], function (err, res) {
				console.log(res.length + " matches found!");
				for (const i = 0; i < res.length; i++) {
					console.log(
						i + 1 + ".) " +
						"Year: " +
						res[i].year +
						" Album Position: " +
						res[i].position +
						" || Artist: " +
						res[i].artist +
						" || Song: " +
						res[i].song +
						" || Album: " +
						res[i].album
					);
				}

				runSearch();
			});
		});
}

