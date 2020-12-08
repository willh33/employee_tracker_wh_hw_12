class Department {
	constructor(name) {
		this.name = name;
	}

	viewAllDepartments(connection, callback) {
		const query = connection.query("SELECT * FROM department", this,
			function (err, res) {
				if (err) throw err;
				callback(res);
			});
	}

	addDepartment(connection, callback) {
		const query = connection.query("INSERT INTO department SET ?", this,
			function (err, res) {
				if (err) throw err;
				callback();
			});
	}

	updateDepartment(connection, id) {
		const query = connection.query(
			"UPDATE department SET ? WHERE ?",
			[
				this,
				{
					id: id
				}
			],
			function (error) {
				if (error) throw err;
				return;
			}
		);
	}
}

module.exports = Department;