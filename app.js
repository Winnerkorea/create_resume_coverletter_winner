const state = {
  responsibilities: [],
  requirements: [],
  keywords: [],
};

const commonSkillKeywords = [
  "React",
  "TypeScript",
  "JavaScript",
  "Node",
  "Python",
  "Java",
  "Spring",
  "AWS",
  "Docker",
  "Kubernetes",
  "SQL",
  "GraphQL",
  "REST",
  "CI/CD",
  "테스트",
  "성능",
  "보안",
  "데이터",
  "협업",
  "자동화",
  "모니터링",
  "접근성",
];

const $ = (id) => document.getElementById(id);

function splitLines(text) {
  return text
    .split(/\n|\.|•|-/)
    .map((line) => line.trim())
    .filter((line) => line.length > 5);
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function findMatchingKeywords(text) {
  const source = text.toLowerCase();
  return commonSkillKeywords.filter((keyword) => source.includes(keyword.toLowerCase()));
}

function pickLines(lines, hints, limit) {
  const loweredHints = hints.map((hint) => hint.toLowerCase());
  return lines
    .filter((line) => loweredHints.some((hint) => line.toLowerCase().includes(hint)))
    .slice(0, limit);
}

function analyzeJobPosting() {
  const posting = $("jobPosting").value.trim();
  const lines = splitLines(posting);
  const responsibilities = pickLines(
    lines,
    ["담당", "업무", "개발", "운영", "설계", "구현", "개선", "manage", "build", "develop"],
    5,
  );
  const requirements = pickLines(
    lines,
    ["자격", "요건", "경험", "필수", "우대", "skill", "required", "experience"],
    6,
  );
  const keywords = unique([
    ...findMatchingKeywords(posting),
    ...$("focusKeywords").value.split(",").map((item) => item.trim()),
  ]).slice(0, 10);

  state.responsibilities = responsibilities.length ? responsibilities : lines.slice(0, 4);
  state.requirements = requirements.length ? requirements : lines.slice(4, 9);
  state.keywords = keywords;

  $("responsibilities").textContent = formatList(state.responsibilities);
  $("requirements").textContent = formatList(state.requirements);
  $("keywords").textContent = state.keywords.length ? state.keywords.join(", ") : "-";
  updateMatchScore();
}

function formatList(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "-";
}

function updateMatchScore() {
  const skills = $("skills").value.toLowerCase();
  const profile = `${$("summary").value} ${$("experience").value} ${skills}`.toLowerCase();
  const matched = state.keywords.filter((keyword) => profile.includes(keyword.toLowerCase()));
  const denominator = Math.max(state.keywords.length, 1);
  const score = Math.round((matched.length / denominator) * 100);
  $("matchScore").textContent = `${score}%`;
}

function listFromText(text) {
  return splitLines(text).map((line) => line.replace(/^[-*]\s*/, ""));
}

function renderList(target, items, fallback) {
  target.innerHTML = "";
  const listItems = items.length ? items : [fallback];
  listItems.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    target.appendChild(li);
  });
}

function createSummary() {
  const title = $("jobTitle").value.trim() || "지원 직무";
  const keywords = state.keywords.slice(0, 4).join(", ");
  const userSummary = $("summary").value.trim();

  if (userSummary && keywords) {
    return `${userSummary} 특히 ${title}에서 요구하는 ${keywords} 역량과 연결해 빠르게 성과를 만들 수 있습니다.`;
  }

  if (userSummary) {
    return userSummary;
  }

  return `${title}에 필요한 문제 해결력과 실행력을 중심으로, 채용공고의 요구사항에 맞춘 경력 요약을 작성하세요.`;
}

function createOpenSourcePitch() {
  const title = $("jobTitle").value.trim() || "지원 직무";
  const keywords = state.keywords.slice(0, 3).join(", ") || "실무 문제 해결";
  return `${title}와 연결되는 작은 오픈소스 프로젝트를 공개하세요. 예를 들어 ${keywords}을 보여 줄 수 있는 샘플 앱, 자동화 도구, 문서화 개선 기여를 만들면 포트폴리오의 신뢰도를 높일 수 있습니다.`;
}

function createCoverLetter() {
  const name = $("candidateName").value.trim() || "지원자";
  const company = $("companyName").value.trim() || "귀사";
  const title = $("jobTitle").value.trim() || "해당 포지션";
  const tone = $("letterTone").value;
  const responsibilities = state.responsibilities.slice(0, 2).join(", ") || "핵심 업무";
  const experience = listFromText($("experience").value).slice(0, 2).join(", ") || "실무 경험";
  const keywords = state.keywords.slice(0, 4).join(", ") || "직무 역량";

  const toneSentence = {
    balanced: "문제를 정확히 정의하고, 작게 검증하며, 팀이 반복해서 쓸 수 있는 방식으로 개선하는 일을 중요하게 생각합니다.",
    confident: "빠르게 맥락을 파악하고 실행 가능한 개선안을 제시해 실제 지표로 연결하는 데 강점이 있습니다.",
    warm: "동료와의 신뢰를 바탕으로 문제를 나누어 해결하고, 지속 가능한 협업 방식을 만드는 데 관심이 많습니다.",
  }[tone];

  return [
    `안녕하세요. ${company}의 ${title} 포지션에 지원하는 ${name}입니다.`,
    `채용공고에서 특히 ${responsibilities} 흐름이 인상적이었습니다. 제 경험 중 ${experience}은 이 역할에서 바로 활용할 수 있는 기반이라고 생각합니다.`,
    `${toneSentence} 이번 지원에서는 ${keywords} 역량을 중심으로 팀의 목표에 기여하고 싶습니다.`,
    `${company}가 풀고 있는 문제를 더 깊이 이해하고, 제 경험을 어떻게 연결할 수 있을지 이야기 나눌 기회를 기대합니다.`,
  ];
}

function generateDocument() {
  analyzeJobPosting();

  $("previewName").textContent = $("candidateName").value.trim() || "이름을 입력하세요";
  $("previewContact").textContent = $("contactInfo").value.trim() || "연락처";
  $("previewSummary").textContent = createSummary();
  $("previewSkills").textContent = $("skills").value.trim() || "-";
  renderList($("previewExperience"), listFromText($("experience").value), "경력과 성과를 입력하면 문서에 반영됩니다.");

  const openSourceBlock = $("openSourceBlock");
  openSourceBlock.hidden = !$("includeOpenSource").checked;
  $("previewOpenSource").textContent = createOpenSourcePitch();

  const company = $("companyName").value.trim() || "지원 회사";
  $("previewLetterTitle").textContent = `${company} 지원 커버레터`;
  $("previewLetter").innerHTML = "";
  createCoverLetter().forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    $("previewLetter").appendChild(p);
  });
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
    tab.classList.add("active");
    $(`${tab.dataset.tab}Panel`).classList.add("active");
  });
});

$("analyzeButton").addEventListener("click", analyzeJobPosting);
$("generateButton").addEventListener("click", generateDocument);
$("printButton").addEventListener("click", () => {
  generateDocument();
  window.print();
});

["skills", "summary", "experience", "focusKeywords"].forEach((id) => {
  $(id).addEventListener("input", updateMatchScore);
});

generateDocument();
