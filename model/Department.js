class Department {
	constructor(name) {
		this.name = name;
	}

	viewAllDepartments(connection) {
		const query = connection.query("SELECT * FROM department", this,
			function (err, res) {
				if (err) throw err;
				return res;
			});
	}

	addDepartment(connection) {
		const query = connection.query("INSERT INTO department SET ?", this,
			function (err, res) {
				if (err) throw err;
				return res;
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

module.exports = {
	Department
};