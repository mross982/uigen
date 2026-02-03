import { Loader2, FileEdit, FilePlus } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  args?: any;
  state: "call" | "result" | "partial-call";
  result?: any;
}

function getFileOperationMessage(toolName: string, args?: any): {
  action: string;
  fileName: string;
  location?: string;
  icon: "create" | "edit";
} | null {
  if (toolName === "str_replace_editor" && args) {
    const { command, path } = args;

    if (!path) return null;

    // Extract file name and directory
    const pathParts = path.split("/").filter(Boolean);
    const fileName = pathParts[pathParts.length - 1];
    const directory = pathParts.length > 1
      ? "/" + pathParts.slice(0, -1).join("/")
      : null;

    if (command === "create") {
      return {
        action: "Creating",
        fileName,
        location: directory,
        icon: "create"
      };
    } else if (command === "str_replace" || command === "insert") {
      return {
        action: "Updating",
        fileName,
        location: directory,
        icon: "edit"
      };
    }
  }

  if (toolName === "file_manager" && args) {
    const { command, path, new_path } = args;

    if (command === "rename" && new_path) {
      const pathParts = new_path.split("/").filter(Boolean);
      const fileName = pathParts[pathParts.length - 1];
      const directory = pathParts.length > 1
        ? "/" + pathParts.slice(0, -1).join("/")
        : null;

      return {
        action: "Renaming to",
        fileName,
        location: directory,
        icon: "edit"
      };
    } else if (command === "delete" && path) {
      const pathParts = path.split("/").filter(Boolean);
      const fileName = pathParts[pathParts.length - 1];

      return {
        action: "Deleting",
        fileName,
        icon: "edit"
      };
    }
  }

  return null;
}

export function ToolInvocationBadge({
  toolName,
  args,
  state,
  result
}: ToolInvocationBadgeProps) {
  const isComplete = state === "result" && result;
  const operation = getFileOperationMessage(toolName, args);

  if (!operation) {
    // Fallback to original display
    return (
      <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
        {isComplete ? (
          <>
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-neutral-700">{toolName}</span>
          </>
        ) : (
          <>
            <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
            <span className="text-neutral-700">{toolName}</span>
          </>
        )}
      </div>
    );
  }

  const Icon = operation.icon === "create" ? FilePlus : FileEdit;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
          <Icon className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
          <span className="text-neutral-700">
            {operation.action} <span className="font-medium">{operation.fileName}</span>
            {operation.location && (
              <span className="text-neutral-500"> in {operation.location}</span>
            )}
          </span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
          <Icon className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
          <span className="text-neutral-700">
            {operation.action} <span className="font-medium">{operation.fileName}</span>
            {operation.location && (
              <span className="text-neutral-500"> in {operation.location}</span>
            )}
          </span>
        </>
      )}
    </div>
  );
}
