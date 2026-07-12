import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, projectsTable, transactionsTable } from "@workspace/db";
import {
  CreateProjectTransactionBody,
  CreateProjectTransactionParams,
  CreateProjectTransactionResponse,
  DeleteTransactionParams,
  ListProjectTransactionsParams,
  ListProjectTransactionsResponse,
  UpdateTransactionBody,
  UpdateTransactionParams,
  UpdateTransactionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get(
  "/projects/:id/transactions",
  async (req, res): Promise<void> => {
    const params = ListProjectTransactionsParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, params.data.id));

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const transactions = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.projectId, params.data.id))
      .orderBy(transactionsTable.date, transactionsTable.createdAt);

    res.json(
      ListProjectTransactionsResponse.parse(
        transactions.map((t) => ({ ...t, amount: Number(t.amount) })),
      ),
    );
  },
);

router.post(
  "/projects/:id/transactions",
  async (req, res): Promise<void> => {
    const params = CreateProjectTransactionParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = CreateProjectTransactionBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, params.data.id));

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const dateStr = parsed.data.date.toISOString().slice(0, 10);
    const [transaction] = await db
      .insert(transactionsTable)
      .values({
        ...parsed.data,
        date: dateStr,
        amount: String(parsed.data.amount),
        projectId: params.data.id,
      })
      .returning();

    if (!transaction) {
      res.status(400).json({ error: "Failed to create transaction" });
      return;
    }

    res.status(201).json(
      CreateProjectTransactionResponse.parse({
        ...transaction,
        amount: Number(transaction.amount),
      }),
    );
  },
);

router.patch("/transactions/:id", async (req, res): Promise<void> => {
  const params = UpdateTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { date, amount, ...rest } = parsed.data;
  const [transaction] = await db
    .update(transactionsTable)
    .set({
      ...rest,
      ...(date ? { date: date.toISOString().slice(0, 10) } : {}),
      ...(amount !== undefined ? { amount: String(amount) } : {}),
    })
    .where(eq(transactionsTable.id, params.data.id))
    .returning();

  if (!transaction) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  res.json(
    UpdateTransactionResponse.parse({
      ...transaction,
      amount: Number(transaction.amount),
    }),
  );
});

router.delete("/transactions/:id", async (req, res): Promise<void> => {
  const params = DeleteTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [transaction] = await db
    .delete(transactionsTable)
    .where(eq(transactionsTable.id, params.data.id))
    .returning();

  if (!transaction) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
