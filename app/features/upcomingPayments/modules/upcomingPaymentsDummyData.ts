import { CategoriesWithType } from "db";
import colors from "constants/colors";

export type UpcomingPaymentStatus = "pending" | "paid" | "canceled";

export type DummyUpcomingInstanceRow = {
  instanceId: number;
  upcomingPaymentId: number;
  name: string;
  dueDate: string;
  expectedAmount: number | null;
  status: UpcomingPaymentStatus;
  category: {
    iconFamily: CategoriesWithType["iconFamily"];
    name: string;
    color: string;
  };
  paidSoFar?: number;
};

export const upcomingPaymentsDummyData: DummyUpcomingInstanceRow[] = [
  {
    instanceId: 1,
    upcomingPaymentId: 101,
    name: "Rent",
    dueDate: "2026-04-15T00:00:00Z",
    expectedAmount: 850,
    status: "pending",
    category: {
      iconFamily: "MaterialCommunityIcons",
      name: "home",
      color: colors.housing,
    },
  },
  {
    instanceId: 2,
    upcomingPaymentId: 102,
    name: "Netflix",
    dueDate: "2026-04-22T00:00:00Z",
    expectedAmount: 12.99,
    status: "pending",
    category: {
      iconFamily: "MaterialCommunityIcons",
      name: "netflix",
      color: colors.entertainment,
    },
  },
  {
    instanceId: 3,
    upcomingPaymentId: 103,
    name: "Electricity",
    dueDate: "2026-04-25T00:00:00Z",
    expectedAmount: null,
    status: "pending",
    category: {
      iconFamily: "MaterialCommunityIcons",
      name: "flash",
      color: colors.utilities,
    },
  },
  {
    instanceId: 4,
    upcomingPaymentId: 104,
    name: "Gym",
    dueDate: "2026-04-28T00:00:00Z",
    expectedAmount: 29.9,
    status: "pending",
    category: {
      iconFamily: "FontAwesome5",
      name: "dumbbell",
      color: colors.health,
    },
  },
  {
    instanceId: 5,
    upcomingPaymentId: 105,
    name: "Internet",
    dueDate: "2026-05-02T00:00:00Z",
    expectedAmount: 34.5,
    status: "pending",
    category: {
      iconFamily: "MaterialCommunityIcons",
      name: "wifi",
      color: colors.utilities,
    },
  },
];
