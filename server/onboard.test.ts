import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

const { notifyOwner } = vi.hoisted(() => ({ notifyOwner: vi.fn().mockResolvedValue(true) }));
vi.mock("./_core/notification", () => ({ notifyOwner }));
// db is imported transitively by feature routers wired into appRouter. Preserve the
// exported `db` symbol as a harmless test double while mocking helper functions.
vi.mock("./db", () => ({
  db: {},
  listProposals: vi.fn(), getProposal: vi.fn(), hasVoted: vi.fn(), castVote: vi.fn(),
  getStakingPower: vi.fn(), listUserStaking: vi.fn(), setStaking: vi.fn(), setProposalStatus: vi.fn(),
  listCampaigns: vi.fn(), addDonation: vi.fn(), markMilestoneNotified: vi.fn(), totalDonated: vi.fn(),
  recordGameSession: vi.fn(), getLeaderboard: vi.fn(), getUserGameStats: vi.fn(), getCampaign: vi.fn(),
  listProducts: vi.fn(), getProduct: vi.fn(), recordTransaction: vi.fn(), listUserTransactions: vi.fn(),
  listCourses: vi.fn(), getCourse: vi.fn(), getLesson: vi.fn(), completeLesson: vi.fn(), getUserProgress: vi.fn(),
  saveLearningPath: vi.fn(), analyticsSummary: vi.fn(), revenueTrend: vi.fn(), engagementTrend: vi.fn(),
  recentEvents: vi.fn(), logEvent: vi.fn(),
}));

import { appRouter } from "./routers";

function ctx(createdAt: Date): TrpcContext {
  return {
    user: {
      id: 1, openId: "newbie", email: null, name: "Newbie", loginMethod: "manus",
      role: "user", createdAt, updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

beforeEach(() => vi.clearAllMocks());

describe("auth.onboard", () => {
  it("fires a signup alert for a freshly created user", async () => {
    const caller = appRouter.createCaller(ctx(new Date()));
    const res = await caller.auth.onboard();
    expect(res.isNew).toBe(true);
    expect(notifyOwner).toHaveBeenCalledTimes(1);
  });

  it("does not alert for an existing user", async () => {
    const caller = appRouter.createCaller(ctx(new Date(Date.now() - 10 * 60_000)));
    const res = await caller.auth.onboard();
    expect(res.isNew).toBe(false);
    expect(notifyOwner).not.toHaveBeenCalled();
  });

  it("returns isNew=false when unauthenticated", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });
    const res = await caller.auth.onboard();
    expect(res.isNew).toBe(false);
  });
});
