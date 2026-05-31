import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const projectRoot = process.cwd();
const resumePath = path.resolve(projectRoot, args.resume ?? "source/resume.md");
const coverletterPath = path.resolve(projectRoot, args.coverletter ?? "source/coverletter.md");
const outDir = path.resolve(projectRoot, args.out ?? "dist");
const envPath = path.resolve(projectRoot, args.env ?? ".env");

async function main() {
  const env = await loadEnv(envPath);
  const resumeMarkdown = applyEnvPlaceholders(await readMarkdown(resumePath, "resume"), env);
  const coverletterMarkdown = applyEnvPlaceholders(
    await readMarkdown(coverletterPath, "coverletter"),
    env,
  );

  await mkdir(outDir, { recursive: true });

  const resume = buildDocument({
    markdown: resumeMarkdown,
    title: "Resume",
    kind: "resume",
    sourcePath: resumePath,
  });
  const coverletter = buildDocument({
    markdown: coverletterMarkdown,
    title: "Cover Letter",
    kind: "coverletter",
    sourcePath: coverletterPath,
  });

  await writeFile(path.join(outDir, "resume.html"), resume.html, "utf-8");
  await writeFile(path.join(outDir, "coverletter.html"), coverletter.html, "utf-8");
  await writeFile(path.join(outDir, "index.html"), buildIndexHtml(resume, coverletter), "utf-8");

  console.log(`Generated HTML files in ${path.relative(projectRoot, outDir) || "."}`);
  console.log(`- ${path.relative(projectRoot, path.join(outDir, "index.html"))}`);
  console.log(`- ${path.relative(projectRoot, path.join(outDir, "resume.html"))}`);
  console.log(`- ${path.relative(projectRoot, path.join(outDir, "coverletter.html"))}`);
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const current = rawArgs[index];
    if (!current.startsWith("--")) continue;
    const key = current.slice(2);
    const value = rawArgs[index + 1];
    if (!value || value.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = value;
      index += 1;
    }
  }
  return parsed;
}

async function readMarkdown(filePath, label) {
  try {
    return await readFile(filePath, "utf-8");
  } catch (error) {
    if (error.code === "ENOENT") {
      const relativePath = path.relative(projectRoot, filePath);
      throw new Error(
        `Missing ${label} markdown file: ${relativePath}\n` +
          `Create it or pass a path, for example:\n` +
          `node scripts/build-html.mjs --resume examples/resume.md --coverletter examples/coverletter.md`,
      );
    }
    throw error;
  }
}

async function loadEnv(filePath) {
  try {
    const raw = await readFile(filePath, "utf-8");
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .reduce((env, line) => {
        const separator = line.indexOf("=");
        if (separator === -1) return env;
        const key = line.slice(0, separator).trim();
        const value = stripEnvQuotes(line.slice(separator + 1).trim());
        if (key) env[key] = value;
        return env;
      }, {});
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

function stripEnvQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function applyEnvPlaceholders(markdown, env) {
  return markdown.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(env, key) ? env[key] : match;
  });
}

function buildDocument({ markdown, title, kind, sourcePath }) {
  const metadata = parseMetadata(markdown);
  const template = getTemplate(metadata, kind);
  const htmlBody = markdownToHtml(stripMetadata(markdown));
  const sourceName = path.basename(sourcePath);
  const classes = [
    "document",
    `document-${kind}`,
    `template-${template}`,
    kind === "coverletter" ? `letter-${template}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    html: wrapHtml({
      title,
      body: htmlBody,
      classes,
      sourceName,
      metadata,
      kind,
      template,
    }),
    metadata,
    template,
    title,
    body: htmlBody,
  };
}

function getTemplate(metadata, kind) {
  if (kind === "coverletter") {
    return metadata.cover_letter_template || "job-fit";
  }
  return metadata.resume_template || "ats-basic";
}

function parseMetadata(markdown) {
  const match = markdown.match(/<!--([\s\S]*?)-->/);
  if (!match) return {};

  return match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((metadata, line) => {
      const separator = line.indexOf(":");
      if (separator === -1) return metadata;
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      if (key && value) metadata[key] = value;
      return metadata;
    }, {});
}

function stripMetadata(markdown) {
  return markdown.replace(/<!--[\s\S]*?-->/g, "").trim();
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      html.push("<hr>");
      index += 1;
      continue;
    }

    if (trimmed.startsWith("|")) {
      const tableLines = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      html.push(renderTable(tableLines));
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      html.push(`<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
      continue;
    }

    const paragraph = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,6})\s+/.test(lines[index].trim()) &&
      !/^---+$/.test(lines[index].trim()) &&
      !lines[index].trim().startsWith("|") &&
      !/^[-*]\s+/.test(lines[index].trim())
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
  }

  return html.join("\n");
}

function renderTable(tableLines) {
  const rows = tableLines
    .filter((line) => !isSeparatorRow(line))
    .map((line) => splitTableRow(line));

  if (!rows.length) return "";

  const isKeyValue = rows.every((row) => row.length === 2) && isResumeKey(rows[0][0]);
  if (isKeyValue) {
    return [
      '<table class="kv-table"><tbody>',
      ...rows.map(
        ([key, value]) =>
          `<tr><th scope="row">${renderInline(key)}</th><td>${renderInline(value)}</td></tr>`,
      ),
      "</tbody></table>",
    ].join("");
  }

  const [head, ...body] = rows;
  return [
    "<table>",
    `<thead><tr>${head.map((cell) => `<th>${renderInline(cell)}</th>`).join("")}</tr></thead>`,
    `<tbody>${body
      .map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`)
      .join("")}</tbody>`,
    "</table>",
  ].join("");
}

function splitTableRow(line) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isSeparatorRow(line) {
  return /^\|\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
}

function isResumeKey(value) {
  return ["항목", "기간", "ISSUE", "담당업무", "담당 업무", "역할", "배운점", "기술"].includes(
    value,
  );
}

function renderInline(value) {
  return escapeHtml(value)
    .replace(/&lt;br\s*\/?&gt;/gi, "<br>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)]\((https?:\/\/[^)\s]+)\)/g, (_, label, url) => {
      return `<a href="${escapeAttr(url)}">${label}</a>`;
    });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return String(value).replace(/"/g, "&quot;");
}

function wrapHtml({ title, body, classes, sourceName, metadata, kind, template }) {
  const target = [metadata.target_role, metadata.target_company].filter(Boolean).join(" · ");
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="../templates/document.css">
    <style>
      .template-selector {
        padding: 4px 8px;
        border: 1px solid var(--line);
        border-radius: 4px;
        background: #fff;
        font-family: inherit;
        font-size: 13px;
        color: var(--ink);
        cursor: pointer;
      }
      @media print { .template-selector { display: none; } }
    </style>
  </head>
  <body>
    <nav class="print-toolbar" aria-label="문서 도구">
      <a href="index.html">전체 보기</a>
      <span>${escapeHtml(sourceName)}</span>
      ${target ? `<span>${escapeHtml(target)}</span>` : ""}
      <div style="margin-left: auto; display: flex; gap: 8px; align-items: center;">
        ${renderTemplateSelector(kind, template)}
        <button type="button" onclick="window.print()">PDF 저장</button>
      </div>
    </nav>
    <main class="print-stage">
      <article class="${classes}">
${body}
      </article>
    </main>
    ${renderSharedScript()}
  </body>
</html>
`;
}

function buildIndexHtml(resume, coverletter) {
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Resume Preview</title>
    <link rel="stylesheet" href="../templates/document.css">
    <style>
      .template-selector {
        padding: 4px 8px;
        border: 1px solid var(--line);
        border-radius: 4px;
        background: #fff;
        font-family: inherit;
        font-size: 13px;
        color: var(--ink);
        cursor: pointer;
      }
      @media print { .template-selector { display: none; } }
    </style>
  </head>
  <body>
    <nav class="print-toolbar" aria-label="문서 도구">
      <div style="display: flex; gap: 14px; align-items: center;">
        <a href="resume.html">이력서</a>
        ${renderTemplateSelector("resume", resume.template)}
      </div>
      <div style="display: flex; gap: 14px; align-items: center; margin-left: 20px;">
        <a href="coverletter.html">커버레터</a>
        ${renderTemplateSelector("coverletter", coverletter.template)}
      </div>
      <button type="button" onclick="window.print()" style="margin-left: auto;">PDF 저장</button>
    </nav>
    <main class="print-stage combined">
      <article class="document document-resume template-${resume.template}">
${resume.body}
      </article>
      <article class="document document-coverletter template-${coverletter.template} letter-${coverletter.template}">
${coverletter.body}
      </article>
    </main>
    ${renderSharedScript()}
  </body>
</html>
`;
}

function renderTemplateSelector(kind, current) {
  const options =
    kind === "resume"
      ? [
          { value: "ats-basic", label: "이력서: 기본형 (ATS)" },
          { value: "career-detail", label: "이력서: 경력 강조형" },
          { value: "portfolio-open-source", label: "이력서: 포트폴리오형" },
        ]
      : [
          { value: "job-fit", label: "커버레터: 직무 적합형" },
          { value: "growth-story", label: "커버레터: 성장 서사형" },
          { value: "impact-first", label: "커버레터: 임팩트 강조형" },
        ];

  const htmlOptions = options
    .map(
      (opt) =>
        `<option value="${opt.value}" ${opt.value === current ? "selected" : ""}>${opt.label}</option>`,
    )
    .join("");

  return `
    <select class="template-selector" onchange="updateTemplate('${kind}', this.value)">
      ${htmlOptions}
    </select>
  `;
}

function renderSharedScript() {
  return `
<script>
  function updateTemplate(kind, template) {
    const article = document.querySelector('.document-' + kind);
    if (!article) return;
    
    // Remove old classes
    const classesToRemove = [];
    article.classList.forEach(cls => {
      if (cls.startsWith('template-') || cls.startsWith('letter-')) {
        classesToRemove.push(cls);
      }
    });
    classesToRemove.forEach(cls => article.classList.remove(cls));
    
    // Add new classes
    article.classList.add('template-' + template);
    if (kind === 'coverletter') {
      article.classList.add('letter-' + template);
    }
  }
</script>
`;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
