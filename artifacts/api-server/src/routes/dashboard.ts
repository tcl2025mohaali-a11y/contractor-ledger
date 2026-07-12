import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, projectsTable, transactionsTable } from "@workspace/db";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  req.log.info("Computing dashboard summary");

  const [{ projectCount }] = await db
    .select({ projectCount: sql<number>`COUNT(*)::int` })
    .from(projectsTable);

  const [{ totalReceived, totalSpent }] = await db
    .select({
      totalReceived: sql<string>`COALESCE(SUM(CASE WHEN ${transactionsTable.type} = 'deposit' THEN ${transactionsTable.amount} ELSE 0 END), 0)`,
      totalSpent: sql<string>`COALESCE(SUM(CASE WHEN ${transactionsTable.type} = 'expense' THEN ${transactionsTable.amount} ELSE 0 END), 0)`,
    })
    .from(transactionsTable);

  const received = Number(totalReceived ?? 0);
  const spent = Number(totalSpent ?? 0);

  res.json(
    GetDashboardSummaryResponse.parse({
      projectCount: projectCount ?? 0,
      totalReceived: received,
      totalSpent: spent,
      totalBalance: received - spent,
    }),
  );
});

export default router;
