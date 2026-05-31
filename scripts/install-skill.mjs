import { cp, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const skillName = "writing-career-resume";
const sourceDir = path.join(projectRoot, "skills", skillName);
const codexHome = process.env.CODEX_HOME || path.join(process.env.HOME || "", ".codex");
const targetDir = path.join(codexHome, "skills", skillName);

async function main() {
  await ensureSkillSource();
  await mkdir(path.dirname(targetDir), { recursive: true });
  await cp(sourceDir, targetDir, { recursive: true, force: true });
  console.log(`Installed ${skillName} skill`);
  console.log(`Source: ${path.relative(projectRoot, sourceDir)}`);
  console.log(`Target: ${targetDir}`);
  console.log("Restart Codex or start a new session if the skill does not appear immediately.");
}

async function ensureSkillSource() {
  try {
    const info = await stat(path.join(sourceDir, "SKILL.md"));
    if (!info.isFile()) throw new Error("SKILL.md is not a file");
  } catch {
    throw new Error(`Missing skill source: ${path.relative(projectRoot, sourceDir)}/SKILL.md`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
