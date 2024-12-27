import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  type ShouldRevalidateFunctionArgs,
  Link,
  useFetcher,
  useNavigation,
} from "@remix-run/react";
import {
  redirect,
  type DataFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import {
  FiHome,
  FiBook,
  FiList,
  FiMinus,
  FiCornerDownRight,
  FiPlus,
} from "react-icons/fi";
import { LoginIcon, LogoutIcon } from "./icons/icons";
import { getAuthFromRequest } from "./auth/auth";
import { getNavData, addSubject, addList } from "./routes/home/queries";
import "./styles.css";
import { useState } from "react";
import dayjs from "dayjs";

export function shouldRevalidate({ formAction }: ShouldRevalidateFunctionArgs) {
  return formAction && ["/login", "/signup", "logout"].includes(formAction);
}
export async function loader({ request }: DataFunctionArgs) {
  let userId = await getAuthFromRequest(request);
  if (userId && new URL(request.url).pathname === "/") {
    throw redirect("/home");
  }
  let subjects;
  let lists;
  if (userId) {
    ({ subjects, lists } = await getNavData(userId));
  }

  return { userId, subjects, lists };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");
  const name = formData.get("name");
  const userId = await getAuthFromRequest(request);

  if (action === "add-list") {
    await addList(userId as string, name as string);
    const { subjects, lists } = await getNavData(userId as string);
    return { subjects, lists };
  }

  if (action === "add-subject") {
    await addSubject(userId as string, name as string);
    const { subjects, lists } = await getNavData(userId as string);
    return { subjects, lists };
  }

  return null;
}

export default function App() {
  let {
    userId,
    subjects: loaderSubjects,
    lists: loaderLists,
  } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ subjects: any[]; lists: any[] }>();
  const fetcherData = fetcher.data;
  const subjects = fetcherData?.subjects || loaderSubjects || [];
  const lists = fetcherData?.lists || loaderLists || [];
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAddSubjectPopup, setShowAddSubjectPopup] = useState(false);
  const [showAddListPopup, setShowAddListPopup] = useState(false);
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";
  const handleAdd = async (
    e: React.MouseEvent<HTMLButtonElement>,
    action: string,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const parent = e.currentTarget.parentElement;
    const input = parent?.querySelector("input");
    const value = input?.value as string;
    await fetcher.submit(
      {
        name: value,
        action,
      },
      {
        method: "post",
      },
    );
  };
  function AddForm({
    placeHolder,
    action,
  }: {
    placeHolder: string;
    action: string;
  }) {
    return (
      <div className="flex text-lg items-center justify-between gap-2 pl-2 pr-2">
        <input
          type="text"
          placeholder={placeHolder}
          className="w-full p-2 rounded-lg bg-[#DBE2EF] text-[#112D4E]"
        />
        <button
          className="bg-[#3F72AF] text-[] p-2 rounded-lg"
          onClick={(e) => handleAdd(e, action)}
        >
          Add
        </button>
      </div>
    );
  }
  const now = dayjs().format("YYYY-MM-DD");
  const [today, setToday] = useState(now);
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <Meta />
        <Links />
      </head>
      <body>
        <div className="bg-[#112D4E] border-b border-slate-800 flex items-center justify-between py-2 sm:py-4 px-4 sm:px-8 box-border">
          <Link to="/home" className="block leading-3 w-1/4 sm:w-1/3">
            <div
              className="font-black text-xl sm:text-2xl md:text-3xl text-[#F9F7F7] w-fit"
              onMouseEnter={() => {
                if (userId) {
                  setMenuOpen(!menuOpen);
                }
              }}
              onClick={() => {
                if (userId) {
                  setMenuOpen(!menuOpen);
                }
              }}
            >
              LansNote
            </div>
          </Link>
          <div className="w-full sm:w-2/3 md:w-1/3 flex justify-end">
            {userId ? (
              <div className="flex items-center space-x-2 sm:space-x-6 rtl:space-x-reverse">
                <Link
                  to={`/lesson/new?today=${today}`}
                  className={`flex gap-1 sm:gap-2 text-[#F9F7F7] bg-[#3F72AF] hover:bg-[#DBE2EF] hover:text-[#112D4E] font-medium rounded-lg text-xs sm:text-sm p-2 sm:p-2.5 text-center inline-flex items-center ${
                    isNavigating ? "pointer-events-none opacity-50" : ""
                  }`}
                  onClick={() => {
                    const now = dayjs().format("YYYY-MM-DD");
                    setToday(now);
                  }}
                >
                  <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">New Lesson</span>
                </Link>

                <form method="post" action="/logout">
                  <button className="block text-center group relative">
                    <LogoutIcon />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-[] text-xs rounded py-1 px-2 whitespace-nowrap">
                      Logout
                    </span>
                  </button>
                </form>
              </div>
            ) : (
              <Link to="/login" className="block text-center">
                <LoginIcon />
                <br />
                <span className="text-slate-500 text-xs uppercase font-bold">
                  Log in
                </span>
              </Link>
            )}
          </div>
        </div>
        {menuOpen && (
          <div
            onMouseLeave={() => {
              setMenuOpen(false);
            }}
            id="sidebar"
            className="fixed top-0 left-0 text-2xl overflow-y-auto w-full sm:w-1/5 h-full bg-[#112D4E] z-[100] text-[#F9F7F7]"
          >
            <div
              className=" bg-[#112D4E] border-b border-slate-800 flex items-center justify-between py-2 sm:py-4 px-4 sm:px-8 box-border font-black text-xl sm:text-2xl md:text-3xl text-[#F9F7F7] w-fit"
              onClick={() => {
                if (userId) {
                  setMenuOpen(!menuOpen);
                }
              }}
            >
              LansNote
            </div>
            <div className="space-y-2 font-medium">
              <div className="flex items-center justify-between rounded-lg hover:bg-gray-100 hover:text-[#112D4E]">
                <Link
                  className="flex items-center p-2 gap-2  rounded-lg hover:bg-gray-100 hover:text-[#112D4E]"
                  to="/home"
                  onClick={() => {
                    setMenuOpen(false);
                  }}
                >
                  <FiHome />
                  <span className="ml-3">Home</span>
                </Link>
              </div>

              <button className="flex w-full items-center justify-between  rounded-lg hover:bg-gray-100 hover:text-[#112D4E]">
                <div className="flex items-center p-2 gap-2  rounded-lg hover:bg-gray-100 hover:text-[#112D4E]">
                  <FiList />
                  <span className="ml-3">List</span>
                </div>
                {showAddListPopup ? (
                  <FiMinus
                    className="w-5 h-5 mr-2 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAddListPopup(false);
                    }}
                  />
                ) : (
                  <FiPlus
                    className="w-5 h-5 mr-2 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAddListPopup(true);
                    }}
                  />
                )}
              </button>
              {showAddListPopup && (
                <AddForm placeHolder="Add new list" action="add-list" />
              )}

              <div className="space-y-2 font-medium">
                {lists?.map((term) => (
                  <div
                    key={term.id}
                    className="ml-5 flex items-center justify-between rounded-lg hover:bg-gray-100 hover:text-[#112D4E]"
                  >
                    <Link
                      className="flex items-center p-2 gap-2 rounded-lg hover:bg-gray-100 hover:text-[#112D4E]"
                      to={`/list/${term.id}?page=1`}
                      onClick={() => {
                        setMenuOpen(false);
                      }}
                    >
                      <FiCornerDownRight />
                      <span className="ml-3">{term.name}</span>
                    </Link>
                  </div>
                ))}
              </div>

              <button className="w-full flex items-center justify-between rounded-lg hover:bg-gray-100 hover:text-[#112D4E]">
                <div className="flex items-center p-2 gap-2 rounded-lg hover:bg-gray-100 hover:text-[#112D4E]">
                  <FiBook />
                  <span className="ml-3">Subjects</span>
                </div>
                {showAddSubjectPopup ? (
                  <FiMinus
                    className="w-5 h-5 mr-2 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAddSubjectPopup(false);
                    }}
                  />
                ) : (
                  <FiPlus
                    className="w-5 h-5 mr-2 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAddSubjectPopup(true);
                    }}
                  />
                )}
              </button>
              {showAddSubjectPopup && (
                <AddForm placeHolder="Add new subject" action="add-subject" />
              )}

              <div className="space-y-2 font-medium">
                {subjects?.map((subject) => (
                  <div
                    key={subject.id}
                    className="ml-5 flex items-center justify-between rounded-lg hover:bg-gray-100 hover:text-[#112D4E]"
                  >
                    <Link
                      className="flex items-center p-2 gap-2 rounded-lg hover:bg-gray-100 hover:text-[#112D4E]"
                      to={`/subject/${subject.id}`}
                      onClick={() => {
                        setMenuOpen(false);
                      }}
                    >
                      <FiCornerDownRight />
                      <span className="ml-3">{subject.name}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Outlet context={{ subjects, lists }} />

        <ScrollRestoration />
        <LiveReload />
        <Scripts />
      </body>
    </html>
  );
}
