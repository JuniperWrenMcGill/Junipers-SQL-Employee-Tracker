-- Seed data for departments
INSERT INTO departments (name) VALUES
    ('Sales'),
    ('Marketing'),
    ('Finance');

-- Seed data for roles
INSERT INTO roles (title, salary, department_id) VALUES
    ('Sales Representative', 50000.00, 1),
    ('Marketing Coordinator', 55000.00, 2),
    ('Financial Analyst', 60000.00, 3);

-- Seed data for employees
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES
    ('Rose', 'Tyler', 1, null),
    ('Donna', 'Noble', 2, 1),
    ('Matha', 'Jones', 3, 1);
