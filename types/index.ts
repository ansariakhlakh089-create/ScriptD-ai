export type UserPlan = 'FREE' | 'PAID';

export interface User {
  id: string;
  email: string;
  plan: UserPlan;
  tokensRemaining: number;
}
