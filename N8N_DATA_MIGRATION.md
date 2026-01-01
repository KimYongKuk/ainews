# n8n 데이터 이동 가이드

n8n_data 폴더에는 모든 워크플로우, 실행 기록, 크레덴셜, 설정이 저장되어 있습니다.
회사 컴퓨터로 프로젝트를 옮길 때 이 폴더를 안전하게 복사하는 방법을 안내합니다.

## n8n_data 폴더 구조

```
n8n_data/
├── database.sqlite      # 모든 워크플로우, 실행 기록, 크레덴셜 (중요!)
├── config               # n8n 설정
├── binaryData/          # 업로드된 파일, 첨부파일
├── nodes/               # 커스텀 노드 (있는 경우)
└── *.log                # 로그 파일
```

## 이동 방법

### 방법 1: USB 드라이브 사용 (권장)

1. **원본 컴퓨터에서:**
   ```bash
   # 프로젝트 루트에서
   # n8n_data 폴더를 USB에 복사
   ```
   - `n8n_data` 폴더 전체를 USB 드라이브에 복사
   - 폴더 크기: 약 30MB (현재 기준)

2. **회사 컴퓨터에서:**
   ```bash
   # 프로젝트를 클론한 후
   # USB의 n8n_data 폴더를 프로젝트 루트에 복사
   ```

### 방법 2: 압축 파일로 전송

1. **원본 컴퓨터에서 압축:**
   ```bash
   # Windows (PowerShell)
   Compress-Archive -Path n8n_data -DestinationPath n8n_data_backup.zip

   # 또는 7-Zip, WinRAR 등 사용
   ```

2. **전송:**
   - 이메일 (30MB 미만이므로 가능)
   - 클라우드 스토리지 (OneDrive, Google Drive 등)
   - 네트워크 공유 폴더

3. **회사 컴퓨터에서 압축 해제:**
   ```bash
   # Windows (PowerShell)
   Expand-Archive -Path n8n_data_backup.zip -DestinationPath .
   ```

### 방법 3: 클라우드 스토리지 사용

1. **암호화 압축 (보안 강화):**
   - 7-Zip 사용 시: 우클릭 → 7-Zip → Add to archive → Encryption 설정
   - 강력한 비밀번호 설정

2. **업로드:**
   - OneDrive, Google Drive 등에 업로드

3. **회사에서 다운로드:**
   - 다운로드 후 압축 해제
   - 프로젝트 루트에 배치

## 검증

회사 컴퓨터에서 n8n을 실행한 후:

```bash
docker-compose up -d
```

1. http://localhost:5678 접속
2. 기존 워크플로우가 보이는지 확인
3. 크레덴셜 설정이 유지되는지 확인

## 중요 보안 사항

⚠️ **주의**: `database.sqlite` 파일에는 다음이 포함됩니다:
- 모든 워크플로우
- API 키 및 크레덴셜 (암호화됨)
- 실행 기록 및 로그

### 보안 권장사항:
1. ✅ USB 직접 전송 (가장 안전)
2. ✅ 암호화 압축 후 클라우드 전송
3. ❌ 암호화 없이 이메일 전송 (비권장)
4. ❌ 공용 클라우드에 암호화 없이 업로드 (비권장)

## n8n_data 없이 시작하는 경우

n8n_data 폴더를 복사하지 않고 시작하면:
- n8n이 새로운 빈 데이터베이스 생성
- 모든 워크플로우를 처음부터 다시 만들어야 함
- 크레덴셜도 모두 재설정 필요

## 문제 해결

### 권한 오류 발생 시
```bash
# Windows에서 Docker 볼륨 권한 문제 시
docker-compose down
docker volume prune
docker-compose up -d
```

### 데이터베이스 손상 시
원본 컴퓨터에서 다시 복사하거나, n8n이 자동으로 복구 시도합니다.

### 로그 파일이 너무 큰 경우
이동 전에 로그 파일 삭제 가능:
```bash
# n8n_data 폴더에서
rm *.log
```
워크플로우와 크레덴셜에는 영향 없음.

## 참고

- n8n 데이터는 SQLite 데이터베이스에 저장됨
- 크레덴셜은 암호화되어 저장되므로 안전함
- 정기적인 백업 권장
