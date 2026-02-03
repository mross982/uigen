import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// str_replace_editor tool tests
test("displays 'Creating' message for create command in root", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result={{ success: true }}
    />
  );

  expect(screen.getByText(/Creating/)).toBeDefined();
  expect(screen.getByText(/App\.jsx/)).toBeDefined();
  expect(screen.queryByText(/in \//)).toBeNull();
});

test("displays 'Creating' message with directory location", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/components/Button.tsx" }}
      state="result"
      result={{ success: true }}
    />
  );

  expect(screen.getByText(/Creating/)).toBeDefined();
  expect(screen.getByText(/Button\.tsx/)).toBeDefined();
  expect(screen.getByText(/in \/components/)).toBeDefined();
});

test("displays 'Creating' message with nested directory location", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/src/components/ui/Card.tsx" }}
      state="result"
      result={{ success: true }}
    />
  );

  expect(screen.getByText(/Creating/)).toBeDefined();
  expect(screen.getByText(/Card\.tsx/)).toBeDefined();
  expect(screen.getByText(/in \/src\/components\/ui/)).toBeDefined();
});

test("displays 'Updating' message for str_replace command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{
        command: "str_replace",
        path: "/App.jsx",
        old_str: "old",
        new_str: "new"
      }}
      state="result"
      result={{ success: true }}
    />
  );

  expect(screen.getByText(/Updating/)).toBeDefined();
  expect(screen.getByText(/App\.jsx/)).toBeDefined();
});

test("displays 'Updating' message for insert command", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{
        command: "insert",
        path: "/components/Form.tsx",
        insert_line: 10,
        new_str: "new line"
      }}
      state="result"
      result={{ success: true }}
    />
  );

  expect(screen.getByText(/Updating/)).toBeDefined();
  expect(screen.getByText(/Form\.tsx/)).toBeDefined();
  expect(screen.getByText(/in \/components/)).toBeDefined();
});

test("shows loading state for incomplete operation", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );

  expect(screen.getByText(/Creating/)).toBeDefined();
  // Should show spinning loader icon
  const loader = container.querySelector(".animate-spin");
  expect(loader).toBeDefined();
});

test("shows completed state with success indicator", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
      result={{ success: true }}
    />
  );

  // Should show green success dot
  const successDot = container.querySelector(".bg-emerald-500");
  expect(successDot).toBeDefined();
});

// file_manager tool tests
test("displays 'Renaming to' message for rename command", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{
        command: "rename",
        path: "/OldName.jsx",
        new_path: "/NewName.jsx"
      }}
      state="result"
      result={{ success: true }}
    />
  );

  expect(screen.getByText(/Renaming to/)).toBeDefined();
  expect(screen.getByText(/NewName\.jsx/)).toBeDefined();
});

test("displays 'Renaming to' message with directory", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{
        command: "rename",
        path: "/components/Old.tsx",
        new_path: "/components/New.tsx"
      }}
      state="result"
      result={{ success: true }}
    />
  );

  expect(screen.getByText(/Renaming to/)).toBeDefined();
  expect(screen.getByText(/New\.tsx/)).toBeDefined();
  expect(screen.getByText(/in \/components/)).toBeDefined();
});

test("displays 'Deleting' message for delete command", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{
        command: "delete",
        path: "/OldFile.jsx"
      }}
      state="result"
      result={{ success: true }}
    />
  );

  expect(screen.getByText(/Deleting/)).toBeDefined();
  expect(screen.getByText(/OldFile\.jsx/)).toBeDefined();
});

// fallback tests
test("displays tool name for unrecognized tool", () => {
  render(
    <ToolInvocationBadge
      toolName="unknown_tool"
      state="result"
      result={{ success: true }}
    />
  );

  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("displays tool name when args are missing", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      state="result"
      result={{ success: true }}
    />
  );

  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("displays tool name when path is missing", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create" }}
      state="result"
      result={{ success: true }}
    />
  );

  expect(screen.getByText("str_replace_editor")).toBeDefined();
});
