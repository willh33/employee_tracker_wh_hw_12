class Employee {
	constructor(firstName, lastName, roleId, managerId) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.roleId = roleId;
		this.managerId = managerId;
	}
	
	viewAllEmployees(connection, callback) {
		const query = connection.query(
			`
			SELECT
				emp.id, emp.first_name, emp.last_name, role.title,
				dept.name, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) as manager
			FROM
				employee as emp
				LEFT JOIN role as role ON
					emp.role_id = role.id
				LEFT JOIN department as dept ON
					role.department_id = dept.id
				LEFT JOIN employee as manager ON
					manager.id = emp.manager_id
			`, 
		  function(err, res) {
			if (err) throw err;
			callback(res);
		});
	}
	
	viewManagersEmployees(connection, managerId, callback) {
		const query = connection.query(
			`
			SELECT
				emp.id, emp.first_name, emp.last_name, role.title,
				dept.name, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) as manager
			FROM
				employee as emp
				LEFT JOIN role as role ON
					emp.role_id = role.id
				LEFT JOIN department as dept ON
					role.department_id = dept.id
				LEFT JOIN employee as manager ON
					manager.id = emp.manager_id
			WHERE
				emp.manager_id = ?
			`, 
			[
				managerId
			],
		  function(err, res) {
			if (err) throw err;
			callback(res);
		});
	}

	addEmployee(connection, callback) {
		const query = 
			connection.query("INSERT INTO employee SET ?", {
				'first_name': this.firstName,
				'last_name': this.lastName,
				'role_id': this.roleId,
				'manager_id': this.managerId,
			}, 
		  function(err, res) {
			if (err) throw err;
			return callback(res);
		});
	}

	updateEmployee(connection, id) {
		const query = connection.query(
            "UPDATE employee SET ? WHERE ?",
            [
              employee,
              {
                id: id
              }
            ],
            function(error) {
              if (error) throw err;
              return res;
            }
		);
	}

	updateEmployeeRole(connection, id, roleId, callback) {
		const query = connection.query(
            "UPDATE employee SET ? WHERE ?",
            [
              { role_id: roleId },
              { id: id },
            ],
            function(err) {
              if (err) throw err;
              callback();
            }
		);
	}

	updateEmployeeManager(connection, id, managerId, callback) {
		const query = connection.query(
            "UPDATE employee SET ? WHERE ?",
            [
              { manager_id: managerId },
              { id: id },
            ],
            function(err) {
              if (err) throw err;
              callback();
            }
		);
	}
}

module.exports = Employee;