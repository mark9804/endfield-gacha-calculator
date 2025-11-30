import { type SimulationConfig } from "@/utils/gachaUtils";
import type { PaymentRank } from "@/utils/investUtils";

export type PurchaseInfo = {
  price: PaymentRank;
  count: number;
};

export interface UserRecord extends SimulationConfig {
  firstBuyItems: PaymentRank[];
  purchases: PurchaseInfo[];
}
