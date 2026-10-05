import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const sourcePath = path.resolve("client/src/pages/TeacherRegister.tsx");
const source = readFileSync(sourcePath, "utf8");
const file = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

function unwrap(expression: ts.Expression): ts.Expression {
  while (ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression) || ts.isNonNullExpression(expression)) {
    expression = expression.expression;
  }
  return expression;
}

function isHookCall(node: ts.CallExpression): boolean {
  const callee = unwrap(node.expression);
  if (ts.isIdentifier(callee)) return /^use[A-Z0-9]/.test(callee.text);
  if (ts.isPropertyAccessExpression(callee)) return /^use[A-Z0-9]/.test(callee.name.text);
  return false;
}

function containsJsx(node: ts.Node): boolean {
  let found = false;
  const visit = (child: ts.Node) => {
    if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child) || ts.isJsxFragment(child)) found = true;
    if (!found) ts.forEachChild(child, visit);
  };
  visit(node);
  return found;
}

function getTeacherRegisterBody(): ts.Block {
  for (const statement of file.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === "TeacherRegister" &&
      statement.body
    ) {
      return statement.body;
    }
  }
  throw new Error("Could not locate TeacherRegister component");
}

describe("TeacherRegister React hook order", () => {
  it("runs React and tRPC hooks before the loading return on every render", () => {
    const body = getTeacherRegisterBody();
    const hookCalls: ts.CallExpression[] = [];
    const returnPositions: number[] = [];
    let firstConditionalOrNestedHook: ts.CallExpression | undefined;

    const visit = (node: ts.Node, nesting: number, conditional: boolean) => {
      if (ts.isCallExpression(node) && isHookCall(node)) {
        hookCalls.push(node);
        if (nesting > 0 || conditional) firstConditionalOrNestedHook ??= node;
      }

      if (ts.isReturnStatement(node) && node.expression && containsJsx(node.expression)) {
        returnPositions.push(node.getStart(file));
      }

      const nextConditional = conditional ||
        ts.isIfStatement(node) ||
        ts.isConditionalExpression(node) ||
        ts.isSwitchStatement(node) ||
        ts.isForStatement(node) ||
        ts.isForOfStatement(node) ||
        ts.isForInStatement(node) ||
        ts.isWhileStatement(node) ||
        ts.isDoStatement(node);
      const nextNesting = nesting + (ts.isFunctionLike(node) && node !== body ? 1 : 0);
      ts.forEachChild(node, child => visit(child, nextNesting, nextConditional));
    };

    visit(body, 0, false);

    expect(hookCalls.map(call => source.slice(call.getStart(file), call.getEnd()))).toEqual([
      "trpc.teacher.application.get.useQuery()",
      "trpc.teacher.application.create.useMutation({ onSuccess: () => app.refetch() })",
      "trpc.teacher.application.update.useMutation({ onSuccess: () => app.refetch() })",
      "trpc.teacher.application.submit.useMutation({ onSuccess: () => app.refetch() })",
      "useState({ fullName: \"\", phone: \"\", country: \"\", city: \"\", profilePhotoUrl: \"\", qualification: \"\", specialization: \"\", bio: \"\", subjects: \"\", educationStages: \"\", grades: \"\", teachingFormat: \"\", availability: \"\", yearsOfExperience: \"0\", hourlyRate: \"\" })",
      "useEffect(() => { if (profile && !form.fullName) fill(); }, [profile])",
    ]);
    expect(firstConditionalOrNestedHook).toBeUndefined();
    expect(returnPositions.length).toBeGreaterThan(0);
    expect(Math.max(...hookCalls.map(call => call.getStart(file)))).toBeLessThan(Math.min(...returnPositions));
  });
});
