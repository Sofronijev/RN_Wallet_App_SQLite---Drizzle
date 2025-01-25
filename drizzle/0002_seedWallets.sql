-- Custom SQL migration file, put you code below! --
INSERT
    OR IGNORE INTO Wallet (walletId, user_id, walletName, type, color)
VALUES
    (1, 1, 'Personal', 'system', '#3EB489'),
    (2, 1, 'Savings', 'custom', '#ADFF2F');