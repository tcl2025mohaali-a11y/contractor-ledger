import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, projectsTable, transactionsTable } from "@workspace/db";
import { GetDashboardSummaryResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const userId = req.userId as string;
  req.log.info("Computing dashboard summary");

  const [{ projectCount }] = await db
    .select({ projectCount: sql<number>`COUNT(*)::int` })
    .from(projectsTable)
    .where(eq(projectsTable.userId, userId));

  const [{ totalReceived, totalSpent }] = await db
    .select({
      totalReceived: sql<string>`COALESCE(SUM(CASE WHEN ${transactionsTable.type} = 'deposit' THEN ${transactionsTable.amount} ELSE 0 END), 0)`,
      totalSpent: sql<string>`COALESCE(SUM(CASE WHEN ${transactionsTable.type} = 'expense' THEN ${transactionsTable.amount} ELSE 0 END), 0)`,
    })
    .from(transactionsTable)
    .innerJoin(
      projectsTable,
      eq(transactionsTable.projectId, projectsTable.id),
    )
    .where(eq(projectsTable.userId, userId));

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
