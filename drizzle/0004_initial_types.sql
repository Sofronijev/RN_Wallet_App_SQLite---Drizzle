-- Custom SQL migration file, put your code below! --
INSERT
    OR IGNORE INTO Types (id, name, type, categoryId, transactionType, sortOrder) 
VALUES
(1, 'Wage', 'system', 1, NULL, 10),
(2, 'Interests', 'system', 1, NULL, 20),
(3, 'Gifts', 'system', 1, NULL, 30),
(4, 'Refunds', 'system', 1, NULL, 40),
(5, 'Financial aid', 'system', 1, NULL, 50),

(6, 'Transfer out', 'system', 12, 'expense', 10),
(7, 'Transfer in', 'system', 12, 'income', 20),

(8, 'Donation', 'system', 2, NULL, 10),
(9, 'Gifts', 'system', 2, NULL, 20),

(10, 'Mortgage/Rent', 'system', 3, NULL, 10),
(11, 'Improvements', 'system', 3, NULL, 20),
(12, 'Supplies', 'system', 3, NULL, 30),
(13, 'Property tax', 'system', 3, NULL, 40),
(14, 'Home insurance', 'system', 3, NULL, 50),

(15, 'Electricity', 'system', 4, NULL, 10),
(16, 'Gas/Oil', 'system', 4, NULL, 20),
(17, 'Water/Sewer/Trash', 'system', 4, NULL, 30),
(18, 'Phone', 'system', 4, NULL, 40),
(19, 'Cable/Satellite', 'system', 4, NULL, 50),
(20, 'Internet', 'system', 4, NULL, 60),
(21, 'Heating', 'system', 4, NULL, 70),
(22, 'Waste Management', 'system', 4, NULL, 80),

(24, 'Groceries', 'system', 5, NULL, 10),
(25, 'Eating out', 'system', 5, NULL, 20),
(26, 'Food Subscriptions', 'system', 5, NULL, 30),
(27, 'Takeaway', 'system', 5, NULL, 40),
(23, 'Food delivery', 'system', 5, NULL, 50),

(28, 'Insurance', 'system', 6, NULL, 10),
(29, 'Vehicle supplies', 'system', 6, NULL, 20),
(30, 'Fuel', 'system', 6, NULL, 30),
(31, 'Ticket', 'system', 6, NULL, 40),
(32, 'Taxi', 'system', 6, NULL, 50),
(33, 'Repairs', 'system', 6, NULL, 60),
(34, 'Registration', 'system', 6, NULL, 70),
(35, 'Parking', 'system', 6, NULL, 80),
(36, 'Tolls', 'system', 6, NULL, 90),

(37, 'Insurance', 'system', 7, NULL, 10),
(38, 'Doctor', 'system', 7, NULL, 20),
(39, 'Medicine', 'system', 7, NULL, 30),
(40, 'Dental', 'system', 7, NULL, 40),
(41, 'Therapy', 'system', 7, NULL, 50),


(42, 'Education', 'system', 8, NULL, 10),
(43, 'Clothing', 'system', 8, NULL, 20),
(44, 'Personal', 'system', 8, NULL, 30),
(45, 'Cleaning', 'system', 8, NULL, 40),
(46, 'Salon/Barber', 'system', 8, NULL, 50),
(47, 'Hygiene', 'system', 8, NULL, 60),
(48, 'Technology', 'system', 8, NULL, 70),

(55, 'Loan', 'system', 10, NULL, 10),
(56, 'Credit card', 'system', 10, NULL, 20),
(57, 'Child support', 'system', 10, NULL, 30),
(58, 'Taxes', 'system', 10, NULL, 40),
(59, 'Mortgage', 'system', 10, NULL, 50),

(60, 'Vacation/Travel', 'system', 11, NULL, 10),
(61, 'Movies', 'system', 11, NULL, 20),
(62, 'Music', 'system', 11, NULL, 30),
(63, 'Games', 'system', 11, NULL, 40),
(64, 'Rental', 'system', 11, NULL, 50),
(65, 'Books', 'system', 11, NULL, 60),
(66, 'Hobbies', 'system', 11, NULL, 70),
(67, 'Sport', 'system', 11, NULL, 80),
(68, 'Gadgets', 'system', 11, NULL, 90),
(69, 'Subscriptions', 'system', 11, NULL, 100),
(70, 'Concerts', 'system', 11, NULL, 110);