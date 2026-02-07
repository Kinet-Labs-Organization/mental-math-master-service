import { SetMetadata } from "@nestjs/common";

export const SUBSCRIPTION_GUARD_KEY = "subscriptionGuard";
export const Subscriptions = (...plans: string[]) => SetMetadata(SUBSCRIPTION_GUARD_KEY, plans);