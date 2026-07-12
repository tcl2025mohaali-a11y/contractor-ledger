import { Router, type IRouter } from "express";
import { and, eq, isNull } from "drizzle-orm";
import { db, projectsTable, transactionsTable } from "@workspace/db";
import {
  CreateProjectBody,
  CreateProjectResponse,
  DeleteProjectParams,
  GetProjectParams,
  GetProjectResponse,
  ListProjectsResponse,
  UpdateProjectBody,
  UpdateProjectParams,
  UpdateProjectResponse,
} from "@workspace/api-zod";
import { attachTotals, attachTotalsSingle } from "../lib/projectTotals";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.use(requireAuth);

// One-time claim: any project created before auth was added (userId is
// still null) is adopted by the first signed-in user who lists projects.
async function claimOrphanProjects(userId: string): Promise<void> {
  await db
    .update(projectsTable)
    .set({ userId })
    .where(isNull(projectsTable.userId));
}

router.get("/projects", async (req, res): Promise<void> => {
  const userId = req.userId as string;
  req.log.info("Listing projects");
  await claimOrphanProjects(userId);
  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.userId, userId))
    .orderBy(projectsTable.createdAt);
  const withTotals = await attachTotals(projects);
  res.json(ListProjectsResponse.parse(withTotals));
});

router.post("/projects", async (req, res): Promise<void> => {
  const userId = req.userId as string;
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [project] = await db
    .insert(projectsTable)
    .values({ ...parsed.data, userId })
    .returning();

  if (!project) {
    res.status(400).json({ error: "Failed to create project" });
    return;
  }

  const withTotals = await attachTotalsSingle(project);
  res.status(201).json(CreateProjectResponse.parse(withTotals));
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const userId = req.userId as string;
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(
      and(eq(projectsTable.id, params.data.id), eq(projectsTable.userId, userId)),
    );

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const withTotals = await attachTotalsSingle(project);
  res.json(GetProjectResponse.parse(withTotals));
});

router.patch("/projects/:id", async (req, res): Promise<void> => {
  const userId = req.userId as string;
  const params = UpdateProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [project] = await db
    .update(projectsTable)
    .set(parsed.data)
    .where(
      and(eq(projectsTable.id, params.data.id), eq(projectsTable.userId, userId)),
    )
    .returning();

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const withTotals = await attachTotalsSingle(project);
  res.json(UpdateProjectResponse.parse(withTotals));
});

router.delete("/projects/:id", async (req, res): Promise<void> => {
  const userId = req.userId as string;
  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(
      and(eq(projectsTable.id, params.data.id), eq(projectsTable.userId, userId)),
    );

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  await db
    .delete(transactionsTable)
    .where(eq(transactionsTable.projectId, params.data.id));

  await db.delete(projectsTable).where(eq(projectsTable.id, params.data.id));

  res.sendStatus(204);
});

export default router;
