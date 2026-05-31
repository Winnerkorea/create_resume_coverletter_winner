# Resume Cover Letter Winner

Excel 또는 Google Sheets에 정리한 경력 데이터를 AI가 분석해 이력서와 커버레터 Markdown 문서로 만들고, Markdown을 HTML로 렌더링한 뒤 PDF로 출력하는 오픈소스 프로젝트입니다.

이 프로젝트의 핵심 목표는 누구나 자신의 경력을 구조화하고, 지원하는 채용공고에 맞춰 이력서와 커버레터를 더 쉽게 작성하도록 돕는 것입니다.

## 대상 사용자

이 프로젝트는 일반 사용자가 자신의 경력을 정리하고 지원 문서를 만드는 상황을 기준으로 설계합니다.

대표 사용자 페르소나:

- 이직을 준비하지만 경력을 어떻게 정리해야 할지 막막한 사람
- Excel 또는 Google Sheets에는 프로젝트 기록이 있지만 이력서 문장으로 바꾸기 어려운 사람
- 채용공고와 내 경력이 얼마나 맞는지 먼저 확인하고 싶은 사람
- AI가 만든 초안을 그대로 쓰기보다 질문과 답변을 거쳐 자신이 원하는 방향으로 다듬고 싶은 사람
- 개발자, 기획자, 디자이너, 프리랜서처럼 프로젝트 중심 경력을 정리해야 하는 사람

이 프로젝트는 AI가 일방적으로 최종 문서를 만들어 주는 방식이 아니라, 사용자가 경력 원본을 제공하고 AI가 분석, 매칭, 질문, 문서화를 도와주는 인터뷰형 작성 흐름을 지향합니다.

## 핵심 개념

```text
Excel / Google Sheets / 업로드 파일
        ↓
AI 경력 분석
        ↓
채용공고 분석
        ↓
매칭률 리포트
        ↓
AI 보완 질문
        ↓
사용자 답변 반영
        ↓
resume.md / coverletter.md 생성
        ↓
Markdown → HTML
        ↓
선택한 CSS 양식 적용
        ↓
PDF 출력
```

중요한 원칙은 단순합니다.

```text
Excel/Sheet = 경력 원천 데이터
AI = 분석, 질문, 작성
Markdown = 문서 원본
HTML = 화면 미리보기
CSS Template = 이력서/커버레터 양식
PDF = 최종 제출 파일
```

## 빠른 시작

처음 사용하는 사람은 아래 순서대로 진행하면 됩니다.

### 1. 저장소 받기

```bash
git clone https://github.com/Winnerkorea/create_resume_coverletter_winner.git
cd create_resume_coverletter_winner
```

### 2. 개인 경력 파일 보관 폴더 만들기

```bash
mkdir -p source
```

`source/` 폴더는 개인 경력 원본 파일을 넣는 로컬 폴더입니다. 이 폴더는 `.gitignore`에 포함되어 GitHub에 올라가지 않습니다.

### 3. 경력 파일 넣기

Excel 또는 CSV 파일을 `source/` 폴더에 넣습니다.

```text
source/my-career.xlsx
source/my-career.csv
```

Google Sheets를 사용하는 경우에는 다음 중 하나를 선택합니다.

- Google Sheets를 `.xlsx` 또는 `.csv`로 다운로드한 뒤 `source/`에 넣기
- AI 도구가 Google Sheets 연결 권한을 지원하면 해당 Sheet를 연결하기
- 표 내용을 복사해서 AI에게 직접 붙여넣기

경력 파일의 기본 컬럼은 아래와 같습니다.

```text
NO | 업체 | Project | ISSUE | 담당 업무 | 문제 해결 | 배운점
```

### 4. 개인정보는 .env에 넣기

이름, 이메일, 전화번호처럼 민감한 정보는 Markdown에 직접 쓰지 않고 `.env`에 넣을 수 있습니다.

```bash
cp .env.example .env
```

`.env` 예시:

```text
CANDIDATE_NAME=홍길동
CANDIDATE_EMAIL=hong@example.com
CANDIDATE_PHONE=010-0000-0000
CANDIDATE_LOCATION=Seoul
CANDIDATE_PORTFOLIO=https://example.com
```

Markdown에서는 placeholder로 사용합니다.

```markdown
# {{CANDIDATE_NAME}}

{{CANDIDATE_EMAIL}} | {{CANDIDATE_PHONE}} | {{CANDIDATE_LOCATION}} | {{CANDIDATE_PORTFOLIO}}
```

`.env`는 `.gitignore`에 포함되어 원격 저장소에 올라가지 않습니다. 저장소에는 키 이름만 있는 `.env.example`만 포함합니다.

### 5. Codex 앱으로 작업하기

Codex에서 이 폴더를 열고 아래처럼 요청합니다.

```text
source/my-career.xlsx 파일을 읽어서 내 경력을 분석해 주세요.
아래 채용공고와 매칭률을 먼저 보여주세요.

[채용공고 붙여넣기]

진행 순서:
1. 경력 데이터 분석
2. 채용공고 분석
3. 매칭률 리포트 출력
4. 부족한 부분에 대해 질문
5. 내가 답변하면 resume.md와 coverletter.md 생성
6. 이력서 양식과 커버레터 양식 추천
```

AI가 질문하면 답변을 추가로 입력합니다. 최종적으로 `resume.md`와 `coverletter.md`를 생성하도록 요청합니다.

### 6. CLI로 작업하기

Codex CLI 또는 파일 접근이 가능한 AI CLI를 사용하는 경우 저장소 루트에서 실행합니다.

```bash
cd create_resume_coverletter_winner
codex
```

CLI 안에서 아래처럼 요청합니다.

```text
source/my-career.xlsx 파일을 기반으로 이력서와 커버레터를 만들고 싶습니다.
먼저 채용공고와 내 경력의 매칭률을 분석하고, 부족한 부분을 질문해 주세요.
내 답변을 받은 뒤 resume.md와 coverletter.md를 만들어 주세요.

채용공고:
[채용공고 붙여넣기]
```

사용하는 CLI가 로컬 파일 읽기를 지원하지 않으면 Excel을 CSV로 저장한 뒤 내용을 붙여넣거나, 필요한 행을 복사해서 프롬프트에 포함합니다.

### 7. HTML 미리보기와 PDF 출력

Node.js로 `resume.md`와 `coverletter.md`를 HTML로 변환합니다. 별도 패키지 설치 없이 Node.js만 있으면 됩니다. Node.js 18 이상 사용을 권장합니다.

예시 문서로 먼저 확인하려면 아래 명령을 실행합니다.

```bash
npm run build:html:example
```

실제 문서를 변환하려면 AI가 만든 Markdown 파일을 `source/`에 넣고 실행합니다.

```text
source/resume.md
source/coverletter.md
```

```bash
npm run build:html -- --resume source/resume.md --coverletter source/coverletter.md
```

다른 env 파일을 사용하려면 `--env` 옵션을 지정합니다.

```bash
npm run build:html -- --resume source/resume.md --coverletter source/coverletter.md --env .env
```

생성 결과는 `dist/` 폴더에 만들어집니다.

```text
dist/index.html
dist/resume.html
dist/coverletter.html
```

`dist/`는 로컬 출력 폴더이며 GitHub에 올라가지 않습니다.

브라우저에서 `dist/index.html`을 열고 `PDF 저장` 버튼 또는 브라우저 인쇄 기능으로 PDF를 저장합니다.

초기 입력형 프로토타입도 함께 확인할 수 있습니다.

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

브라우저에서 엽니다.

```text
http://127.0.0.1:4173/
```

최종 구조는 `resume.md`와 `coverletter.md`를 Node.js Markdown parser로 HTML에 렌더링하고, 선택한 CSS 양식을 적용한 뒤 브라우저 인쇄로 PDF를 출력하는 방식입니다.

## 최종 산출물

최종 출력은 두 개의 Markdown 문서입니다.

```text
resume.md
coverletter.md
```

이 두 문서는 시스템의 원본 문서입니다. HTML은 이 Markdown을 보여주는 결과물이고, PDF는 HTML을 출력한 제출용 파일입니다.

## 경력 데이터 입력 양식

사용자는 먼저 Excel 또는 Google Sheets로 자신의 경력을 정리합니다.

로컬 Excel, CSV, PDF, 기존 경력서처럼 개인 정보가 들어 있는 원본 파일은 `source/` 폴더에 보관합니다. `source/` 폴더는 로컬 작업용이며 `.gitignore`에 포함되어 원격 저장소에 올라가지 않습니다.

Git은 빈 폴더를 원격 저장소에 저장하지 않기 때문에 GitHub에는 `source/` 폴더가 보이지 않을 수 있습니다. 저장소를 clone한 뒤 아래 명령으로 로컬에 폴더를 만드세요.

```bash
mkdir -p source
```

`source/` 안의 파일은 개인 경력 원본 데이터이므로 어떤 파일도 원격 저장소에 올리지 않습니다. `.gitkeep` 같은 placeholder 파일도 넣지 않는 것을 원칙으로 합니다.

기본 컬럼:

| NO | 업체 | Project | ISSUE | 담당 업무 | 문제 해결 | 배운점 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 회사명 또는 고객사 | 프로젝트명 | 해결해야 했던 문제/상황 | 맡은 업무 범위 | 어떤 방식으로 해결했는지 | 구체적으로 배운 내용 |

AI는 이 표를 이력서 Markdown으로 변환할 때 다음처럼 사용합니다.

| 입력 컬럼 | 이력서 반영 위치 |
| --- | --- |
| 업체 | 회사명 또는 프로젝트 맥락 |
| Project | 프로젝트 제목 또는 담당업무 보조 정보 |
| ISSUE | 문제 상황 |
| 담당 업무 | 담당업무 |
| 문제 해결 | 역할의 상세 구현/해결 내용 |
| 배운점 | 배운점 |

## 채용공고 분석

지원자는 채용공고 URL, 텍스트, PDF, 문서 등을 입력할 수 있습니다.

AI는 채용공고에서 다음 항목을 분석합니다.

- 주요 업무
- 필수 자격
- 우대사항
- 기술 키워드
- 도메인 키워드
- 소프트스킬
- 숨은 요구사항

이후 사용자의 경력 데이터와 비교해 매칭률 리포트를 먼저 보여줍니다.

```text
전체 매칭률
기술 매칭률
경력/프로젝트 매칭률
도메인 매칭률
소프트스킬 매칭률
강하게 일치하는 항목
부족하거나 확인 필요한 항목
이력서에서 강조할 내용
AI가 사용자에게 질문할 내용
```

매칭률은 최종 이력서에 넣는 정보가 아니라, 최종 문서를 만들기 전 사용자가 방향을 정하기 위한 중간 리포트입니다.

## AI 질문 단계

AI는 초안을 만든 뒤 바로 최종 파일을 출력하지 않습니다. 매칭률 리포트를 보여준 다음 사용자에게 보완 질문을 해야 합니다.

예시 질문:

- 가장 강조하고 싶은 프로젝트는 무엇인가요?
- 채용공고에서 특히 맞추고 싶은 자격요건이나 우대사항이 있나요?
- 삭제하거나 약하게 표현하고 싶은 경력이 있나요?
- 추가하고 싶은 오픈소스, GitHub, 블로그, 포트폴리오 링크가 있나요?
- 커버레터는 직무 적합형, 성장 서사형, 임팩트 강조형 중 어떤 방향이 좋나요?

이 단계가 중요한 이유는 AI가 사용자의 경력을 완전히 알 수 없기 때문입니다. AI는 정리와 초안 작성은 도울 수 있지만, 사용자가 어떤 방향으로 보이고 싶은지는 반드시 확인해야 합니다.

## 이력서 양식

이력서 양식은 Markdown의 내용을 바꾸는 것이 아니라, Markdown을 HTML로 렌더링할 때 적용하는 CSS 양식입니다.

지원하는 기본 양식:

| 양식 | 설명 |
| --- | --- |
| `ats-basic` | 채용 시스템과 심사자가 읽기 쉬운 단일 컬럼 기본형 |
| `career-detail` | 프로젝트별 담당업무, 역할, 배운점을 자세히 보여주는 경력 강조형 |
| `portfolio-open-source` | 기술 스택, GitHub, 블로그, 오픈소스, 대표 프로젝트를 강조하는 포트폴리오형 |

현재 양식 이름과 방향은 아래 오픈소스 프로젝트들을 참고해 정리한 기획안입니다. 아직 외부 프로젝트의 CSS나 Markdown 파일을 그대로 복사해 포함하지 않았습니다. 실제 템플릿 코드를 가져오거나 수정해 사용할 경우, 해당 파일 상단 또는 별도 `NOTICE` 문서에 원본 저장소, 라이선스, 변경 내용을 반드시 남겨야 합니다.

## 커버레터 양식

커버레터도 별도 양식을 선택할 수 있습니다.

| 양식 | 설명 |
| --- | --- |
| `job-fit` | 채용공고 요구사항과 내 경험을 직접 연결하는 직무 적합형 |
| `growth-story` | 문제 해결 과정, 배운점, 커리어 방향성을 강조하는 성장 서사형 |
| `impact-first` | 핵심 기여 가능성과 결과를 먼저 전달하는 임팩트 강조형 |

Markdown 문서 상단에는 선택한 양식을 메타 정보로 남깁니다.

```markdown
<!--
resume_template: career-detail
cover_letter_template: growth-story
target_role: Backend Engineer
target_company: Example Labs
-->
```

## Markdown 예시

```markdown
# 홍길동

hong@example.com | Seoul | GitHub: github.com/example

# 요약

- Python/FastAPI 기반 백엔드 API와 실시간 응답 처리 경험 보유
- VectorDB 검색 구조와 Kubernetes 배포 흐름을 프로젝트에서 직접 설계

# 경력

### (주) 예시회사

*Seoul - (2025. 03 - 2025.10)*

| 기간 | 2025. 03 ~ 2025.10 (7개월) |
| --- | --- |
| ISSUE | 사내 솔루션에서 사용 가능한 실시간 챗봇 응답 구조와 검색 품질 개선 필요 |
| 담당업무 | 사내 솔루션에 연동되는 챗봇 서비스 백엔드 개발 |
| 역할 | - 실시간 응답 처리를 위한 SSE 스트림 처리 구조 설계 및 구현<br>- VectorDB 검색 품질 개선을 위한 Collection, Index, Metadata 구성 처리 |
| 배운점 | - SSE 스트림 예외 처리와 연결 유지 전략이 사용자 체감 응답성에 미치는 영향을 학습 |
| 기술 | - Language: Python<br>- Framework: FastAPI<br>- Database: MongoDB, Milvus VectorDB |
```

## 참고한 오픈소스

이 프로젝트의 Markdown 기반 이력서 구조와 양식 선택 개념은 아래 오픈소스 프로젝트들을 참고했습니다.

| 프로젝트 | 라이선스 | 참고한 부분 |
| --- | --- | --- |
| [yscho03/writing-career-resume-skill](https://github.com/yscho03/writing-career-resume-skill) | MIT | 한국어 기술 경력서 작성 Skill의 기본 방향, 최신순 경력 정렬, 기간 표기, 개조식 문체, 경력기술서 Markdown 작성 규칙 |
| [elipapa/markdown-cv](https://github.com/elipapa/markdown-cv) | MIT | Markdown CV를 HTML/PDF로 렌더링하고 CSS로 스타일을 바꾸는 구조 |
| [markdownresume/markdown-resume-templates](https://github.com/markdownresume/markdown-resume-templates) | MIT | 직무별 Markdown 이력서 템플릿 구성과 ATS 친화적인 Markdown 이력서 방향 |
| [BingyanStudio/LapisCV](https://github.com/BingyanStudio/LapisCV) | MIT | Markdown을 VSCode, Typora, Obsidian에서 이력서로 작성하는 방식과 템플릿/스타일 분리 |
| [showlotus/ShowCV](https://github.com/showlotus/ShowCV) | MIT | Markdown 편집, 실시간 미리보기, 다중 템플릿, 브라우저 PDF 출력 흐름 |
| [rozita-hasani/markdown-resume](https://github.com/rozita-hasani/markdown-resume) | 저장소 라이선스 확인 필요 | Markdown 작성, live preview, theme 선택, PDF export 제품 흐름 |

특히 `skills/writing-career-resume/SKILL.md`는 [yscho03/writing-career-resume-skill](https://github.com/yscho03/writing-career-resume-skill)의 한국어 기술 경력서 작성 Skill을 바탕으로, 이 프로젝트의 Excel/Google Sheets 입력, 채용공고 매칭률 분석, AI 보완 질문, 이력서/커버레터 MD 생성 흐름에 맞게 확장했습니다. 자세한 출처와 변경 내용은 [NOTICE](NOTICE)를 확인하세요.

출처 표기 원칙:

- 외부 저장소의 파일을 그대로 가져오면 원본 경로와 라이선스를 함께 남긴다.
- 외부 저장소의 코드를 수정하면 어떤 부분을 수정했는지 기록한다.
- 단순히 구조나 아이디어만 참고한 경우에도 README에 참고 출처를 남긴다.
- 라이선스가 명확하지 않은 파일은 복사하지 않는다.

## 현재 저장소 구성

```text
index.html
styles.css
app.js
package.json
scripts/
  build-html.mjs
templates/
  document.css
examples/
  resume.md
  coverletter.md
skills/
  writing-career-resume/
    SKILL.md
    agents/openai.yaml
```

현재 웹앱은 초기 프로토타입입니다. 채용공고 텍스트와 경력 정보를 입력하면 HTML 미리보기와 PDF 출력을 실험할 수 있습니다.

## 실행

정적 파일 기반이므로 브라우저에서 바로 열 수 있습니다.

```text
index.html
```

로컬 서버로 확인하려면 다음처럼 실행할 수 있습니다.

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

그 다음 브라우저에서 엽니다.

```text
http://127.0.0.1:4173/
```

## AI Skill

이 저장소에는 경력 데이터를 Markdown 이력서와 커버레터로 정리하기 위한 Codex Skill 초안이 포함되어 있습니다.

```text
skills/writing-career-resume/SKILL.md
```

이 스킬은 다음을 정의합니다.

- Excel/Google Sheets 경력 입력 컬럼
- 채용공고 분석 흐름
- 이력서 양식 선택
- 커버레터 양식 선택
- `resume.md`와 `coverletter.md` 작성 규칙
- HTML/PDF 렌더링을 고려한 Markdown 구조

## 로드맵

- Excel 파일 업로드 지원
- Google Sheets 권한 연결
- CSV 업로드 지원
- 채용공고 텍스트/URL/PDF 입력 지원
- AI 기반 채용공고 분석
- 경력 매칭률 리포트
- AI 보완 질문 인터뷰 플로우
- `resume.md` 생성
- `coverletter.md` 생성
- Markdown → HTML 렌더링
- 이력서 CSS 양식 3개
- 커버레터 CSS 양식 3개
- PDF 출력
- 로컬 저장소 또는 Git 기반 버전 관리

## 기여 아이디어

이 프로젝트는 여러 방식으로 기여할 수 있습니다.

- 새로운 이력서 CSS 양식 만들기
- 새로운 커버레터 CSS 양식 만들기
- 직무별 Markdown 예시 추가
- Excel/Google Sheets 컬럼 매핑 개선
- 채용공고 분석 프롬프트 개선
- 매칭률 계산 기준 개선
- PDF 출력 품질 개선
- ATS 친화적인 Markdown 구조 개선

## 라이선스

이 프로젝트는 MIT License로 공개됩니다. 자세한 내용은 [LICENSE](LICENSE)를 확인하세요.

외부 오픈소스를 바탕으로 작성하거나 참고한 내용은 [NOTICE](NOTICE)에 출처를 남깁니다.
