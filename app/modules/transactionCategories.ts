export type Transaction = {
  name: string;
  id: number;
  label: string;
};
export type TransactionTypes = Record<number, Transaction>;

export type Category = Transaction & { types: TransactionTypes };
export type CategoriesType = Record<number, Category>;

export const income = {
  1: { name: "income_wage", id: 1, label: "Wage" },
  2: { name: "income_interests", id: 2, label: "Interests" },
  3: { name: "income_gifts", id: 3, label: "Gifts" },
  4: { name: "income_refunds", id: 4, label: "Refunds" },
  5: { name: "income_financial_aid", id: 5, label: "Financial aid" },
  6: { name: "income_other", id: 6, label: "Other" },
};

const gifts = {
  11: { name: "charity_donations", id: 11, label: "Donation" },
  12: { name: "gifts", id: 12, label: "Gifts" },
  13: { name: "charity_other", id: 13, label: "Other" },
};

const housing = {
  14: { name: "mortgage_rent", id: 14, label: "Mortgage/Rent" },
  15: { name: "housing_improvements", id: 15, label: "Improvements" },
  16: { name: "housing_supplies", id: 16, label: "Supplies" },
  17: { name: "housing_other", id: 17, label: "Other" },
};

const utilities = {
  18: { name: "utilities_electricity", id: 18, label: "Electricity" },
  19: { name: "utilities_gas_oil", id: 19, label: "Gas/Oil" },
  20: { name: "utilities_water_sewer_trash", id: 20, label: "Water/Sewer/Trash" },
  21: { name: "utilities_phone", id: 21, label: "Phone" },
  22: { name: "utilities_cable_satellite", id: 22, label: "Cable/Satellite" },
  23: { name: "utilities_internet", id: 23, label: "Internet" },
  24: { name: "utilities_other", id: 24, label: "Other" },
};

const food = {
  25: { name: "food_groceries", id: 25, label: "Groceries" },
  26: { name: "food_eating_out", id: 26, label: "Eating out" },
  27: { name: "food_other", id: 27, label: "Other" },
};

const transportation = {
  28: { name: "transportation_insurance", id: 28, label: "Insurance" },
  29: { name: "transportation_payments", id: 29, label: "Payments" },
  30: { name: "transportation_fuel", id: 30, label: "Fuel" },
  31: { name: "transportation_ticket", id: 31, label: "Ticket" },
  32: { name: "transportation_taxi", id: 32, label: "Taxi" },
  33: { name: "transportation_repairs", id: 33, label: "Repairs" },
  34: { name: "transportation_registration", id: 34, label: "Registration" },
  35: { name: "transportation_other", id: 35, label: "Other" },
};

const health = {
  36: { name: "health_insurance", id: 36, label: "Insurance" },
  37: { name: "health_doctor", id: 37, label: "Doctor" },
  38: { name: "health_medicine", id: 38, label: "Medicine" },
  39: { name: "health_other", id: 39, label: "Other" },
};

const dailyLiving = {
  40: { name: "dailyLiving_education", id: 40, label: "Education" },
  41: { name: "dailyLiving_clothing", id: 41, label: "Clothing" },
  42: { name: "dailyLiving_personal", id: 42, label: "Personal" },
  43: { name: "dailyLiving_cleaning", id: 43, label: "Cleaning" },
  44: { name: "dailyLiving_salon_barber", id: 44, label: "Salon/Barber" },
  45: { name: "dailyLiving_other", id: 45, label: "Other" },
};

const children = {
  46: { name: "children_clothing", id: 46, label: "Clothing" },
  47: { name: "children_medical", id: 47, label: "Medical" },
  48: { name: "children_school", id: 48, label: "School" },
  49: { name: "children_babysitting", id: 49, label: "Babysitting" },
  50: { name: "children_toys_games", id: 50, label: "Toys/Games" },
  51: { name: "children_other", id: 51, label: "Other" },
};

const obligation = {
  52: { name: "obligation_loan", id: 52, label: "Loan" },
  53: { name: "obligation_credit_card", id: 53, label: "Credit card" },
  54: { name: "obligation_child_support", id: 54, label: "Child support" },
  55: { name: "obligation_taxes", id: 55, label: "Taxes" },
  56: { name: "obligation_other", id: 56, label: "Other" },
};

const entertainment = {
  57: { name: "entertainment_vacation_travel", id: 57, label: "Vacation/Travel" },
  58: { name: "entertainment_movies", id: 58, label: "Movies" },
  59: { name: "entertainment_music", id: 59, label: "Music" },
  60: { name: "entertainment_games", id: 60, label: "Games" },
  61: { name: "entertainment_rental", id: 61, label: "Rental" },
  62: { name: "entertainment_books", id: 62, label: "Books" },
  63: { name: "entertainment_hobbies", id: 63, label: "Hobbies" },
  64: { name: "entertainment_sport", id: 64, label: "Sport" },
  65: { name: "entertainment_gadgets", id: 65, label: "Gadgets" },
  66: { name: "entertainment_other", id: 66, label: "Other" },
};

const other = {
  67: { name: "expenses_other", id: 67, label: "Other" },
};

export const transfer = {
  69: { name: "transfer_send", id: 69, label: "Transfer out" },
  70: { name: "transfer_received", id: 70, label: "Transfer in" },
};

export enum CategoryNumber {
  "income" = 1,
  "gifts" = 3,
  "housing" = 4,
  "utilities" = 5,
  "food" = 6,
  "transportation" = 7,
  "health" = 8,
  "dailyLiving" = 9,
  "children" = 10,
  "obligation" = 11,
  "entertainment" = 12,
  "other" = 13,
  "transfer" = 15,
}

export const typeIds = {
  income_wage: 1,
  income_interests: 2,
  income_gifts: 3,
  income_refunds: 4,
  income_financial_aid: 5,
  income_other: 6,
  charity_donations: 11,
  gifts: 12,
  charity_other: 13,
  mortgage_rent: 14,
  housing_improvements: 15,
  housing_supplies: 16,
  housing_other: 17,
  utilities_electricity: 18,
  utilities_gas_oil: 19,
  utilities_water_sewer_trash: 20,
  utilities_phone: 21,
  utilities_cable_satellite: 22,
  utilities_internet: 23,
  utilities_other: 24,
  food_groceries: 25,
  food_eating_out: 26,
  food_other: 27,
  transportation_insurance: 28,
  transportation_payments: 29,
  transportation_fuel: 30,
  transportation_ticket: 31,
  transportation_taxi: 32,
  transportation_repairs: 33,
  transportation_registration: 34,
  transportation_other: 35,
  health_insurance: 36,
  health_doctor: 37,
  health_medicine: 38,
  health_other: 39,
  dailyLiving_education: 40,
  dailyLiving_clothing: 41,
  dailyLiving_personal: 42,
  dailyLiving_cleaning: 43,
  dailyLiving_salon_barber: 44,
  dailyLiving_other: 45,
  children_clothing: 46,
  children_medical: 47,
  children_school: 48,
  children_babysitting: 49,
  children_toys_games: 50,
  children_other: 51,
  obligation_loan: 52,
  obligation_credit_card: 53,
  obligation_child_support: 54,
  obligation_taxes: 55,
  obligation_other: 56,
  entertainment_vacation_travel: 57,
  entertainment_movies: 58,
  entertainment_music: 59,
  entertainment_games: 60,
  entertainment_rental: 61,
  entertainment_books: 62,
  entertainment_hobbies: 63,
  entertainment_sport: 64,
  entertainment_gadgets: 65,
  entertainment_other: 66,
  expenses_other: 67,
  transfer_send: 69,
  transfer_received: 70,
};

export const transactionCategories: CategoriesType = {
  [CategoryNumber.income]: {
    name: "income",
    id: CategoryNumber.income,
    label: "Income",
    types: income,
  },
  [CategoryNumber.gifts]: {
    name: "gifts",
    id: CategoryNumber.gifts,
    label: "Gifts/Charity",
    types: gifts,
  },
  [CategoryNumber.housing]: {
    name: "housing",
    id: CategoryNumber.housing,
    label: "Housing",
    types: housing,
  },
  [CategoryNumber.utilities]: {
    name: "utilities",
    id: CategoryNumber.utilities,
    label: "Utilities",
    types: utilities,
  },
  [CategoryNumber.food]: { name: "food", id: CategoryNumber.food, label: "Food", types: food },
  [CategoryNumber.transportation]: {
    name: "transportation",
    id: CategoryNumber.transportation,
    label: "Transportation",
    types: transportation,
  },
  [CategoryNumber.health]: {
    name: "health",
    id: CategoryNumber.health,
    label: "Health",
    types: health,
  },
  [CategoryNumber.dailyLiving]: {
    name: "dailyLiving",
    id: CategoryNumber.dailyLiving,
    label: "Daily living",
    types: dailyLiving,
  },
  [CategoryNumber.children]: {
    name: "children",
    id: CategoryNumber.children,
    label: "Children",
    types: children,
  },
  [CategoryNumber.obligation]: {
    name: "obligation",
    id: CategoryNumber.obligation,
    label: "Obligation",
    types: obligation,
  },
  [CategoryNumber.entertainment]: {
    name: "entertainment",
    id: CategoryNumber.entertainment,
    label: "Entertainment",
    types: entertainment,
  },
  [CategoryNumber.other]: { name: "other", id: CategoryNumber.other, label: "Other", types: other },
  [CategoryNumber.transfer]: {
    name: "transfer",
    id: CategoryNumber.transfer,
    label: "Balance correction",
    types: transfer,
  },
};
