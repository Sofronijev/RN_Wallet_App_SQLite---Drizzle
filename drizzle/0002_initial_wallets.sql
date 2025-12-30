-- Custom SQL migration file, put your code below! --
INSERT
    OR IGNORE INTO Wallet (walletId, user_id, walletName, color)
VALUES
    (1, 1, 'Personal', '#3EB489'),
    (2, 1, 'Savings', '#1E90FF');
