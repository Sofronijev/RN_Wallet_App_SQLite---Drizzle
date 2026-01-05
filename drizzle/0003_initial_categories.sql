-- Custom SQL migration file, put your code below! --
INSERT
    OR IGNORE INTO Categories (id, name, type, iconFamily, iconName, iconColor, transactionType, sortOrder) 
VALUES
(1, 'Earnings', 'custom', 'FontAwesome', 'money', '#3EB489', 'income', 10),
(2, 'Giving', 'custom', 'FontAwesome5', 'gift', '#AF7AB3', 'expense', 20),
(3, 'Housing', 'custom', 'FontAwesome', 'home', '#EF5B0C', 'expense', 30),
(4, 'Utilities', 'custom', 'MaterialCommunityIcons', 'lightbulb-on', '#3AB4F2', 'expense', 40),
(5, 'Food', 'custom', 'MaterialCommunityIcons', 'food-apple', '#D64045', 'expense', 50),
(6, 'Transportation', 'custom', 'FontAwesome5', 'car', '#4169E1', 'expense', 60),
(7, 'Health', 'custom', 'MaterialCommunityIcons', 'pill', '#FF9F29', 'expense', 70),
(8, 'Lifestyle', 'custom', 'MaterialCommunityIcons', 'human-greeting', '#A27B5C', 'expense', 80),
(10, 'Debt & Obligations', 'custom', 'FontAwesome', 'credit-card', '#E6B325', 'expense', 90),
(11, 'Entertainment', 'custom', 'Ionicons', 'happy-outline', '#D75281', 'expense', 100),
(12, 'Balance correction', 'system', 'MaterialCommunityIcons', 'swap-horizontal-bold', '#D3D3D3', 'custom', 110);