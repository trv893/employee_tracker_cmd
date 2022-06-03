let questions = [];
const inquirer = require("inquirer");
const sequelize = require('../config/connection');
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      password: 'sqlPr0gress!',
      database: 'employee_tracker'
    //   user: process.env.DB_USER,
    //   // TODO: Add MySQL password
    //   password: process.env.DB_PASSWORD,
    //   database: process.env.DB_NAME
    },
    console.log(`Connected to the employee tracker database.`)
  );

// Global Variables
let departList = [];
let roleList = [];
let employeeList = [];

async function loadGlobalData() {
    pDepartList = loadDepartments();
    pRoleList = loadRoles();
    pEmployeeList = loadEmployees();
    await Promise.all([pDepartList, pRoleList, pEmployeeList])
    // console.log(typeof (Object.values(departList)));
    console.log(departList);
    // console.log(choiceConstructor(roleList));
    createQuestions()
    init();
};
loadGlobalData();

async function loadDepartments(){
    const sql = `SELECT id, name FROM department ORDER BY name`;
    var results = await doSql(sql)
    var currentList = [];

    results.forEach(element => {
            currentList.push({name: element.name, id: element.id})      
        });
    departList = currentList;
};

async function loadRoles(){
    const sql = `SELECT * FROM role_view`;
    var results = await doSql(sql)
    var currentList = [];

    results.forEach(element => {
            currentList.push({title: element.title, id: element.role_id, salary: element.salary, department: element.department_id, department_name: element.department_name})     
        });
    roleList = currentList;
};

async function loadEmployees(){
    const sql = `SELECT * FROM employee_view`;
    var results = await doSql(sql)
    var currentList = [];

    results.forEach(element => {
            currentList.push({id: element.id, first_name: element.first_name, last_name: element.last_name, role: element.title, manager: element.manager_name, salary: element.salary})      
        });
    employeeList = currentList;
};

async function doSql(sql)
{
    var results = await db.promise().query(sql);
    return results[0];
};

function roleChoiceConstructor (dbList) {
    return dbList.map(function(element)
    {
          return  {
                name: element.title,
                value: element
            }
        }
    );
};

function departmentChoiceConstructor (dbList) {
    return dbList.map(function(element)
    {
          return  {
                name: element.name,
                value: element
            }
        }
    );
};

function employeeChoiceConstructor (dbList) {
    return dbList.map(function(element)
    {
          return  {
                name:"ID: " + element.id + "  "+ element.first_name + " " + element.last_name,
                value: element
            }
        }
    );
};

function createQuestions()
{

    questions = [
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: ['view all departments', 'view all roles', 'view all employees', 'add a department', 'add a role', 'add an employee', "Update an employee's role"]
            },
        {
            type: "input",
            name: "add_department",
            message: "What is the name of the department you would like to add?",
            when: (answers) => {
                if (answers.action === "add a department") {
                    return true;
                }
            }
        },
        {
            type: "input",
            name: "add_role",
            message: "What is the name of the role you would like to add?",
            when: (answers) => {
                if (answers.action === "add a role") {
                    return true;
                }
            }
        },
        {
            type: "input",
            name: "add_role_salary",
            message: "What is the salary of this role",
            when: (answers) => {
                if (answers.action === "add a role") {
                    return true;
                }
            }
        },
        {
            type: "list",
            name: "add_role_department",
            message: "Which department does this role belong to?",
            choices: departmentChoiceConstructor(departList),
            when: (answers) => {
                if (answers.action === "add a role") {
                    return true;
                }
            }
        },
        {
            type: "input",
            name: "add_first_name_employee",
            message: "What is the first name of the employee you would like to add?",
            when: (answers) => {
                if (answers.action === "add an employee") {
                    return true;
                }
            }
        },
        {
            type: "input",
            name: "add_last_name_employee",
            message: "What is the last name of the employee you would like to add?",
            when: (answers) => {
                if (answers.action === "add an employee") {
                    return true;
                }
            }
        },
        {
            type: "list",
            name: "add_employee_role",
            message: "What role does this employee have?",
            choices: roleChoiceConstructor(roleList),
            when: (answers) => {
                if (answers.action === "add an employee") {
                    return true;
                }
            }
        },
        {
            type: "list",
            name: "add_employee_manager",
            message: "Whom is this person's manager?",
            choices: employeeChoiceConstructor(employeeList),
            when: (answers) => {
                if (answers.action === "add an employee") {
                    return true;
                }
            }
        },
        {
            type: "list",
            name: "update_employee",
            message: "Which employee's role would you like to update?",
            choices:  employeeChoiceConstructor (employeeList),
            when: (answers) => {
                if (answers.action === "Update an employee's role") {
                    return true;
                }
            }
        },
        {
            type: "list",
            name: "update_employee_role",
            message: "Which role would you like to assing to this employee?",
            choices:roleChoiceConstructor(roleList),
            when: (answers) => {
                if (answers.action === "Update an employee's role") {
                    return true;
                }
            }
        }
    ];

}
async function init() {
    var data = await inquirer.prompt(questions);
    handleAnswers(data);
};

function handleAnswers(data) {
    switch(data.action){
        case 'view all departments':
            console.log('list of departments: ')
            console.table(departList, ["id", "name"])
            init();
            break;
        case 'view all roles':
            console.log('list of roles: ')
            console.table(roleList)
            init();
            break;
        case 'view all employees':
            console.log('list of employees: ')
            console.table(employeeList);
            init();
            break;
        case 'add a department':
            add_department(data.add_department);
            init();
            break;
        case 'add a role':
            add_role(data.add_role, data.add_role_salary, data.add_role_department.id );
            init();
            break;
        case 'add an employee':
            add_employee(data.add_first_name_employee, data.add_last_name_employee, data.add_employee_role.id, data.add_employee_manager.id);
            init();
            break;
        case "Update an employee's role":
            update_employee(data.update_employee.id, data.update_employee_role.id);
            
            break;
    }

    // console.log(data.action)
};

function add_department(department_name){
    const sql = `INSERT INTO department (name) VALUES (?)`;
            db.query(sql, department_name);
            loadDepartments();
            console.log("Department successfully added!");
};

function add_role(role, salary, department){
    const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
            try {db.query(sql, [role, salary, department], (error, results,fields)=> {
                loadRoles();
                console.log(error)

            });
           
            }catch(e){
                console.log(e)
            }
            console.log("Role successfully added!");
};

function add_employee(first, last, role, manager_id){
    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
            try { db.query(sql, [first, last, role, manager_id], (error, results,fields)=> {
            loadEmployees();
            console.log(error)

        });
       
        }catch(e){
            console.log(e)
        }
            console.log("Employee successfully added!");
};

function update_employee(id, role_id){
    const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
            try { db.query(sql, [role_id, id], (error, results,fields)=> {
            loadEmployees();
            console.log(error)

        });
       
        }catch(e){
            console.log(e)
        }
            console.log("Employee successfully added!");
            init();


}