-- Custom SQL migration file, put you code below! --
 INSERT
    OR IGNORE INTO Categories (id, name, type, iconFamily, iconName, iconColor) 
VALUES
(1, 'Income', 'system', 'FontAwesome', 'money', '#118C4F'),
(2, 'Gifts/Charity', 'system', 'FontAwesome5', 'gift', '#AF7AB3'),
(3, 'Housing', 'system', 'FontAwesome', 'home', '#EF5B0C'),
(4, 'Utilities', 'system', 'MaterialCommunityIcons', 'lightbulb-on', '#3AB4F2'),
(5, 'Food', 'system', 'MaterialCommunityIcons', 'food-apple', '#FD5D5D'),
(6, 'Transportation', 'system', 'FontAwesome5', 'car', '#002B5B'),
(7, 'Health', 'system', 'MaterialCommunityIcons', 'pill', '#FF9F29'),
(8, 'Daily living', 'system', 'MaterialCommunityIcons', 'human-greeting', '#A27B5C'),
(9, 'Children', 'system', 'MaterialCommunityIcons', 'baby-carriage', '#FBA1A1'),
(10, 'Obligation', 'system', 'FontAwesome', 'credit-card', '#E6B325'),
(11, 'Entertainment', 'system', 'Ionicons', 'happy-outline', '#D75281'),
(12, 'Balance correction', 'system', 'MaterialCommunityIcons', 'swap-horizontal-bold', '#86A789');