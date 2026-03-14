import { z } from "zod";
import { get } from "@/lib/http-client";
import { ProjectSchema, type ProjectSchemaType } from "@/lib/schemas/project.schema";
import type { ApiResponse } from "@/types/api";

const PROJECTS_BASE = "/projects";

/**
 * Fetch projects. Uses typed API response.
 * When connected to real API, response will be validated with Zod.
 */
export async function getProjects(): Promise<
  ApiResponse<ProjectSchemaType[]>
> {
  const response = await get<ProjectSchemaType[]>(PROJECTS_BASE);
  if (response.success && Array.isArray(response.data)) {
    const parsed = z.array(ProjectSchema).safeParse(response.data);
    if (parsed.success) {
      return { ...response, data: parsed.data };
    }
  }
  return response;
}
