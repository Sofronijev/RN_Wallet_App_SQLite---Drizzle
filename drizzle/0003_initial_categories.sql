-- Custom SQL migration file, put your code below! --
INSERT
    OR IGNORE INTO Categories (id, name, type, iconFamily, iconName, iconColor, transactionType, sortOrder) 
VALUES
(1, 'Earnings', 'system', 'FontAwesome', 'money', '#3EB489', 'income', 10),
(2, 'Giving', 'system', 'FontAwesome5', 'gift', '#AF7AB3', 'expense', 20),
(3, 'Housing', 'system', 'FontAwesome', 'home', '#EF5B0C', 'expense', 30),
(4, 'Utilities', 'system', 'MaterialCommunityIcons', 'lightbulb-on', '#3AB4F2', 'expense', 40),
(5, 'Food', 'system', 'MaterialCommunityIcons', 'food-apple', '#FF6347', 'expense', 50),
(6, 'Transportation', 'system', 'FontAwesome5', 'car', '#4169E1', 'expense', 60),
(7, 'Health', 'system', 'MaterialCommunityIcons', 'pill', '#FF9F29', 'expense', 70),
(8, 'Lifestyle', 'system', 'MaterialCommunityIcons', 'human-greeting', '#A27B5C', 'expense', 80),
(10, 'Debt & Obligations', 'system', 'FontAwesome', 'credit-card', '#E6B325', 'expense', 90),
(11, 'Entertainment', 'system', 'Ionicons', 'happy-outline', '#D75281', 'expense', 100),
(12, 'Balance correction', 'system', 'MaterialCommunityIcons', 'swap-horizontal-bold', '#86A789', 'custom', 110);