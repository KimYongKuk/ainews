# n8n + Frontend 프로젝트

n8n 워크플로우 자동화와 Next.js 프론트엔드로 구성된 프로젝트입니다.

## 프로젝트 구조

```
.
├── docker-compose.yml    # n8n Docker 설정
├── n8n_data/            # n8n 워크플로우 및 데이터 (Git 제외, 별도 복사 필요)
└── frontend/            # Next.js 프론트엔드 애플리케이션
```

## 사전 요구사항

- Docker Desktop 설치
- Node.js 18 이상
- npm 또는 pnpm

## 회사 컴퓨터에서 설치하기

### 1단계: 프로젝트 클론

```bash
git clone [repository-url]
cd "n8n 연습"
```

### 2단계: n8n 데이터 복사

**중요**: `n8n_data` 폴더는 Git에 포함되지 않으므로 별도로 복사해야 합니다.

#### 방법 A: USB 또는 네트워크 드라이브로 복사
1. 원본 컴퓨터에서 `n8n_data` 폴더 전체를 USB에 복사
2. 회사 컴퓨터에서 프로젝트 루트 디렉토리에 붙여넣기

#### 방법 B: 압축 파일로 전송
```bash
# 원본 컴퓨터에서
tar -czf n8n_data_backup.tar.gz n8n_data/

# 회사 컴퓨터에서
tar -xzf n8n_data_backup.tar.gz
```

#### 방법 C: 클라우드 스토리지 (OneDrive, Google Drive 등)
1. `n8n_data` 폴더를 압축
2. 클라우드에 업로드
3. 회사 컴퓨터에서 다운로드 및 압축 해제

### 3단계: n8n 실행 (Docker)

```bash
# Docker Desktop이 실행 중인지 확인
docker-compose up -d
```

n8n이 실행되면 브라우저에서 접속:
- URL: http://localhost:5678

### 4단계: Frontend 환경 변수 설정

```bash
cd frontend
cp .env.example .env.local
```

`.env.local` 파일을 열어 실제 값으로 수정:
```env
NEXT_PUBLIC_SUPABASE_URL=실제_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=실제_supabase_key
OPENAI_API_KEY=실제_openai_api_key
```

### 5단계: Frontend 실행

```bash
cd frontend
npm install
npm run dev
```

Frontend가 실행되면 브라우저에서 접속:
- URL: http://localhost:3000

## 주요 명령어

### n8n 관리

```bash
# n8n 시작
docker-compose up -d

# n8n 중지
docker-compose down

# n8n 로그 확인
docker-compose logs -f n8n

# n8n 재시작
docker-compose restart
```

### Frontend 관리

```bash
cd frontend

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start
```

## 트러블슈팅

### 포트 충돌 시
`docker-compose.yml`에서 포트 번호 변경:
```yaml
ports:
  - "5678:5678"  # 좌측 숫자를 다른 포트로 변경 (예: 5679:5678)
```

### n8n 데이터가 없는 경우
n8n은 빈 상태로 시작되며, 새로운 워크플로우를 만들 수 있습니다.
기존 워크플로우가 필요한 경우 n8n_data 폴더를 복사해야 합니다.

### Docker Desktop 권한 오류
회사 보안 정책에 따라 Docker Desktop 사용에 관리자 권한이 필요할 수 있습니다.
IT 부서에 문의하세요.

## 보안 주의사항

- `.env.local` 파일은 절대 Git에 커밋하지 마세요
- API 키는 안전하게 관리하세요
- n8n_data 폴더에는 민감한 크레덴셜이 포함되어 있습니다

## 참고 링크

- [n8n 공식 문서](https://docs.n8n.io/)
- [Next.js 공식 문서](https://nextjs.org/docs)
