const ERRORS: Record<string, string> = {
  state: "로그인 요청이 만료됐거나 올바르지 않아요. 다시 시도해 주세요.",
  config: "GitHub 로그인 설정(.env.local)이 비어 있어요.",
  token: "GitHub에서 로그인 확인을 받지 못했어요. Client secret을 확인해 주세요.",
  profile: "GitHub 사용자 정보를 가져오지 못했어요.",
  db: "저장 서버에 연결할 수 없어요.",
  server: "로그인 중 문제가 생겼어요. 다시 시도해 주세요.",
};

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const error = searchParams.error ? (ERRORS[searchParams.error] ?? ERRORS.server) : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">할일 + 계획</h1>
        <p className="mt-2 text-sm text-slate-500">GitHub 계정으로 로그인하면 내 할 일만 보여요.</p>
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}
        {/* OAuth는 페이지 이동이 필요해서 Link 대신 a 태그 사용 */}
        <a
          href="/auth/github"
          className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-5 w-5" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          GitHub로 로그인
        </a>
      </div>
    </main>
  );
}
