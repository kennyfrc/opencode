import { useParams } from "@solidjs/router"

export function useWorkspaceId(): string {
  const params = useParams()
  const workspaceId = params.id
  
  if (workspaceId === undefined) {
    throw new Error("Workspace ID is required but not found in route parameters")
  }
  
  return workspaceId
}