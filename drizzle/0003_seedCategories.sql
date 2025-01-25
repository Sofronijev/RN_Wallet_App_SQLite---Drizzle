-- Custom SQL migration file, put you code below! --
INSERT
    OR IGNORE INTO Categories (id, name, type, iconFamily, iconName, iconColor) 
VALUES
(1, 'income', 'system', 'FontAwesome', 'money', '#118C4F'),
(2, 'gifts', 'system', 'FontAwesome5', 'gift', '#AF7AB3'),
(3, 'housing', 'system', 'FontAwesome', 'home', '#EF5B0C'),
(4, 'utilities', 'system', 'MaterialCommunityIcons', 'lightbulb-on', '#3AB4F2'),
(5, 'food', 'system', 'MaterialCommunityIcons', 'food-apple', '#FD5D5D'),
(6, 'transportation', 'system', 'FontAwesome5', 'car', '#002B5B'),
(7, 'health', 'system', 'MaterialCommunityIcons', 'pill', '#FF9F29'),
(8, 'dailyLiving', 'system', 'MaterialCommunityIcons', 'human-greeting', '#A27B5C'),
(9, 'children', 'system', 'MaterialCommunityIcons', 'baby-carriage', '#FBA1A1'),
(10, 'obligation', 'system', 'FontAwesome', 'credit-card', '#E6B325'),
(11, 'entertainment', 'system', 'Ionicons', 'happy-outline', '#D75281');
(12, 'balanceCorrection', 'system', 'MaterialCommunityIcons', 'swap-horizontal-bold', '#86A789');