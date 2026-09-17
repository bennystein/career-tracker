import { loginAction } from "./actions";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const failed = searchParams.error === "1";

  return (
    <div className="mx-auto mt-24 max-w-sm">
      <h1 className="mb-4 text-lg font-semibold">Career Search Tracker</h1>
      <form action={loginAction} className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          required
          className="w-full rounded border border-neutral-300 p-2 text-sm"
        />
        {failed && <p className="text-sm text-rose-600">Wrong password.</p>}
        <button className="w-full rounded bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-700">
          Enter
        </button>
      </form>
    </div>
  );
}
