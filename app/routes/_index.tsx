import type { DataFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "Lansnote" }];
};

export default function Index() {
  return (
    <div className=" flex flex-col items-center pt-20 bg-slate-900">
      <div className="flex w-full justify-evenly max-w-md mt-8 rounded-3xl p-10 bg-slate-800">
        <Link
          to="/signup"
          className="text-xl font-medium text-brand-aqua underline"
        >
          Sign up
        </Link>
        <div className="h-full border-r border-slate-500" />
        <Link
          to="/login"
          className="text-xl font-medium text-brand-aqua underline"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
