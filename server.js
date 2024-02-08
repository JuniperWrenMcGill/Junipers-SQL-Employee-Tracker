const inquirer = require("inquirer");
const mysql = require("mysql2");

// create a MySQL connection
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employee_tracker",
});

// connect to the database
connection.connect((err) => {
    if (err) throw err;
    console.log("Connected to the database!");
    // start the application
    start();
});

// Function to start the application
function start() {
    inquirer
        .prompt({
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Update an employee role",
                // Add more choices if needed/wanted 
                "Exit",
            ],
        })
        .then((answer) => {
            switch (answer.action) {
                case "View all departments":
                    viewAllDepartments();
                    break;
                case "View all roles":
                    viewAllRoles();
                    break;
                case "View all employees":
                    viewAllEmployees();
                    break;
                case "Add a department":
                    addDepartment();
                    break;
                case "Add a role":
                    addRole();
                    break;
                case "Add an employee":
                    addEmployee();
                    break;
                case "Update an employee role":
                    updateEmployeeRole();
                    break;
                // Add cases for bonus functionalities as needed
                case "Exit":
                    connection.end();
                    console.log("Goodbye!");
                    break;
            }
        });
}

// Function to view all departments
function viewAllDepartments() {
    const query = "SELECT * FROM department";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

// Function to view all roles
function viewAllRoles() {
    const query = "SELECT * FROM role";
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

// Function to view all employees and their roles
function viewAllEmployees() {
    const query = `
        SELECT *
        FROM employee
        
        LEFT JOIN role ON employee.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id; `;

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            connection.end();
            return;
        }

        console.table(results); // Display the results as a table
        start();
    });
}


// Function to add a department
function addDepartment() {
    inquirer
        .prompt({
            type: "input",
            name: "name",
            message: "Enter the name of the new department:",
        })
        .then((answer) => {
            const query = "INSERT INTO department (name) VALUES (?)";
            connection.query(query, [answer.name], (err, res) => {
                if (err) throw err;
                console.log(`Added department ${answer.name} to the database!`);
                start();
            });
        });
}

// Function to add a role
function addRole() {
    // Retrieve list of departments from the database
    connection.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;

        inquirer
            .prompt([
                {
                    type: "input",
                    name: "title",
                    message: "Enter the title of the new role:",
                },
                {
                    type: "input",
                    name: "salary",
                    message: "Enter the salary of the new role:",
                },
                {
                    type: "list",
                    name: "department",
                    message: "Select the department for the new role:",
                    choices: res.map((department) => department.name),
                },
            ])
            .then((answers) => {
                const department = res.find(
                    (department) => department.name === answers.department
                );

                const query = "INSERT INTO role SET ?";
                connection.query(
                    query,
                    {
                        title: answers.title,
                        salary: answers.salary,
                        department_id: department.id,
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log(
                            `Added role ${answers.title} with salary ${answers.salary} to the ${answers.department} department in the database!`
                        );
                        // restart the application
                        start();
                    }
                );
            });
    });
}


// Function to add an employee
function addEmployee() {
    // Retrieve roles from the database
    connection.query("SELECT id, title FROM role", (err, roles) => {
        if (err) throw err;

        // Prompt user for employee information
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "firstName",
                    message: "Enter the employee's first name:",
                },
                {
                    type: "input",
                    name: "lastName",
                    message: "Enter the employee's last name:",
                },
                {
                    type: "list",
                    name: "roleId",
                    message: "Select the employee's role:",
                    choices: roles.map(role => ({ name: role.title, value: role.id })),
                },
            ])
            .then((answers) => {
                // Insert the new employee into the database
                const sql = "INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)";
                const values = [answers.firstName, answers.lastName, answers.roleId];

                connection.query(sql, values, (err, res) => {
                    if (err) throw err;

                    console.log(`Added employee ${answers.firstName} ${answers.lastName} to the database!`);
                    start();
                });
            });
    });
}

// Function to update an employee role
function updateEmployeeRole() {
    // Retrieve employees and roles from the database
    connection.query("SELECT id, CONCAT(first_name, ' ', last_name) AS employee_name FROM employee", (err, employees) => {
        if (err) throw err;

        connection.query("SELECT id, title FROM role", (err, roles) => {
            if (err) throw err;

            // Prompt user to select an employee and a new role
            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "employeeId",
                        message: "Select the employee to update:",
                        choices: employees.map(employee => ({ name: employee.employee_name, value: employee.id })),
                    },
                    {
                        type: "list",
                        name: "roleId",
                        message: "Select the employee's new role:",
                        choices: roles.map(role => ({ name: role.title, value: role.id })),
                    },
                ])
                .then((answers) => {
                    // Update the employee's role in the database
                    const sql = "UPDATE employee SET role_id = ? WHERE id = ?";
                    const values = [answers.roleId, answers.employeeId];

                    connection.query(sql, values, (err, res) => {
                        if (err) throw err;

                        console.log(`Updated employee's role in the database!`);
                        start();
                    });
                });
        });
    });
}


// Additional functions for bonus functionalities can be added here