import { loginAction } from "./actions";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const failed = searchParams.error === "1";

  return (
    <div className="mx-auto mt-24 max-w-sm">
      <h1 className="mb-4 text-lg font-semibold">Career Search Tracker</h1>
      <form action={loginAction} className="space-y-3 rounded-lg border border-border bg-surface p-4">
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          required
          className="w-full rounded border border-border-strong bg-transparent p-2.5 text-sm text-foreground"
        />
        {failed && <p className="text-sm text-rose-600 dark:text-rose-400">Wrong password.</p>}
        <button className="w-full rounded bg-accent px-3 py-2.5 text-sm text-accent-foreground hover:opacity-90">
          Enter
        </button>
      </form>
    </div>
  );
}
