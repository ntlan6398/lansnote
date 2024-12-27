import {
  ActionFunctionArgs,
  DataFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { getAuthFromRequest } from "../../auth/auth";
import { FaTrash } from "react-icons/fa";
import {
  createTerm,
  deleteTerm,
  getList,
  getTerms,
  updateTerm,
} from "./queries";
import { useState } from "react";
import { FaSave, FaTimes, FaEdit, FaSearch } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
export const meta = () => {
  return [{ title: "List" }];
};
export async function loader({ request, params }: DataFunctionArgs) {
  const userId = await getAuthFromRequest(request);
  if (!userId) {
    return redirect("/login");
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const itemsPerPage = 10;

  const listId = parseInt(params.id as string);
  const list = await getList(listId);
  // Update your database query to include pagination
  const { terms, totalItems } = await getTerms(listId, {
    page,
    itemsPerPage,
  });

  return {
    terms,
    list,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / itemsPerPage),
    },
    totalItems,
  };
}

const truncateText = (text: string, maxLength = 20) => {
  if (!text) return "Untitled";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};
export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await getAuthFromRequest(request);
  if (!userId) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "update-term":
      const term = JSON.parse(formData.get("term") as string);
      const updatedTerm = await updateTerm(term);
      return { updatedTerm };
    case "delete-term":
      const id = formData.get("id") as string;
      await deleteTerm(id);
      return null;
    case "create-term":
      const termData = formData.get("term") as string;
      const type = formData.get("type") as string;
      const definition = formData.get("definition") as string;
      const example = formData.get("example") as string;
      const listId = formData.get("listId") as string;
      await createTerm({
        term: termData,
        type,
        definition,
        example,
        status: "active",
        listId,
        accountId: userId,
      });
      return null;
  }

  return null;
}

function getLevel(repetition: number): number {
  if (repetition <= 1) return 1;
  if (repetition <= 3) return 2;
  if (repetition <= 6) return 3;
  if (repetition <= 10) return 4;
  return 5;
}

export default function Subject() {
  const { terms, pagination, totalItems, list } = useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTerm, setEditedTerm] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const currentPage = pagination.currentPage;
  const [isNewTermModalOpen, setIsNewTermModalOpen] = useState(false);

  const handleEdit = (term: any) => {
    setEditingId(term.id);
    setEditedTerm({ ...term });
  };
  const handleDelete = (id: string) => {
    if (deletingId === id) {
      fetcher.submit({ id, intent: "delete-term" }, { method: "post" });
      setDeletingId(null);
    } else {
      setDeletingId(id);
    }
  };
  const handleSave = () => {
    if (!editedTerm) return;
    fetcher.submit(
      { term: JSON.stringify(editedTerm), intent: "update-term" },
      { method: "post" },
    );
    setEditingId(null);
    setEditedTerm(null);
  };

  const handleNewTerm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    formData.set("intent", "create-term");
    formData.set("listId", list.id);
    fetcher.submit(formData, { method: "post" });
    setIsNewTermModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{list?.name}</h1>

      {/* Responsive filters and info section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <button
          onClick={() => setIsNewTermModalOpen(true)}
          className={`flex gap-1 sm:gap-2 text-white bg-[#112D4E] hover:bg-[#DBE2EF] hover:text-[#112D4E] font-medium rounded-lg text-xs sm:text-sm p-2 sm:p-2.5 text-center inline-flex items-center`}
        >
          <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">New Term</span>
        </button>
        <p className="text-sm text-gray-600">{totalItems} terms</p>
      </div>

      {/* New Term Modal */}
      {isNewTermModalOpen && (
        <div className="fixed inset-0 bg-black  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Term</h2>
              <button
                onClick={() => setIsNewTermModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleNewTerm}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Term
                  </label>
                  <input
                    name="term"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    name="type"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="noun">Noun</option>
                    <option value="verb">Verb</option>
                    <option value="adjective">Adjective</option>
                    <option value="adverb">Adverb</option>
                    <option value="idiom">Idiom</option>
                    <option value="phrase">Phrase</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Definition
                  </label>
                  <textarea
                    name="definition"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Example
                  </label>

                  <textarea
                    name="example"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewTermModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#112D4E] hover:bg-[#DBE2EF] hover:text-[#112D4E] rounded-md"
                >
                  Add Term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Responsive table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-[#112D4E] text-[#F9F7F7]">
            <tr>
              <th className="px-4 md:px-6 py-3 text-center text-xs md:text-sm">
                Actions
              </th>
              <th className="px-4 md:px-6 py-3 text-center text-xs md:text-sm">
                Level
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm">
                Term
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm">
                Type
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm">
                Definition
              </th>
              <th className="hidden md:table-cell px-4 md:px-6 py-3 text-left text-xs md:text-sm">
                Example
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {terms.map((term) => (
              <tr key={term.id} className="hover:bg-gray-50">
                <td className="px-4 md:px-6 py-4 text-center">
                  {editingId === term.id ? (
                    <div className="flex justify-center gap-2">
                      <div className="group relative">
                        <button
                          onClick={handleSave}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FaSave />
                        </button>
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          Save changes
                        </span>
                      </div>
                      <div className="group relative">
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTimes />
                        </button>
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          Cancel editing
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-2">
                      <div className="group relative">
                        <button
                          onClick={() => handleEdit(term)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <FaEdit />
                        </button>
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          Edit term
                        </span>
                      </div>
                      <div className="group relative">
                        <button
                          onClick={() => handleDelete(term.id)}
                          className={`${
                            deletingId === term.id
                              ? "text-red-800 animate-pulse"
                              : "text-red-600 hover:text-red-900"
                          }`}
                        >
                          <FaTrash />
                        </button>
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {deletingId === term.id
                            ? "Click again to confirm"
                            : "Delete term"}
                        </span>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-4 md:px-6 py-4 text-center text-sm">
                  <span
                    className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs md:text-sm
                    ${
                      getLevel(term.repetition) === 1
                        ? "bg-red-100 text-red-800"
                        : getLevel(term.repetition) === 2
                        ? "bg-orange-100 text-orange-800"
                        : getLevel(term.repetition) === 3
                        ? "bg-yellow-100 text-yellow-800"
                        : getLevel(term.repetition) === 4
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    Level&nbsp;{getLevel(term.repetition)}
                  </span>
                </td>
                <td className="px-4 md:px-6 py-4 text-sm">
                  {editingId === term.id ? (
                    <input
                      className="w-full p-1 border rounded text-sm"
                      value={editedTerm.term}
                      onChange={(e) =>
                        setEditedTerm({ ...editedTerm, term: e.target.value })
                      }
                    />
                  ) : (
                    <span className="block truncate max-w-[150px] md:max-w-none">
                      {term.term}
                    </span>
                  )}
                </td>
                <td className="px-4 md:px-6 py-4 text-sm">
                  {editingId === term.id ? (
                    <select
                      className="w-full p-1 border rounded text-sm"
                      value={editedTerm.type}
                      onChange={(e) =>
                        setEditedTerm({ ...editedTerm, type: e.target.value })
                      }
                    >
                      <option value="noun">Noun</option>
                      <option value="verb">Verb</option>
                      <option value="adjective">Adjective</option>
                      <option value="adverb">Adverb</option>
                      <option value="idiom">Idiom</option>
                      <option value="phrase">Phrase</option>
                    </select>
                  ) : (
                    term.type
                  )}
                </td>
                <td className="px-4 md:px-6 py-4 text-sm">
                  {editingId === term.id ? (
                    <textarea
                      className="w-full p-1 border rounded resize-y min-h-[60px] text-sm"
                      value={editedTerm.definition}
                      onChange={(e) =>
                        setEditedTerm({
                          ...editedTerm,
                          definition: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span className="block truncate max-w-[200px] md:max-w-none">
                      {term.definition}
                    </span>
                  )}
                </td>
                <td className="hidden md:table-cell px-4 md:px-6 py-4 text-sm">
                  {editingId === term.id ? (
                    <input
                      className="w-full p-1 border rounded text-sm"
                      value={editedTerm.example}
                      onChange={(e) =>
                        setEditedTerm({
                          ...editedTerm,
                          example: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span className="block truncate max-w-[200px] md:max-w-none">
                      {term.example}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Responsive pagination */}
      <div className="flex flex-col items-center gap-4 mt-4">
        <div className="flex flex-wrap justify-center items-center gap-2">
          <button
            onClick={() =>
              setSearchParams({ page: (currentPage - 1).toString() })
            }
            disabled={currentPage === 1}
            className="px-2 md:px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ‹
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => {
            const pageNumber = i + 1;
            // Show first page, last page, current page, and pages around current
            const shouldShow =
              pageNumber === 1 ||
              pageNumber === pagination.totalPages ||
              Math.abs(pageNumber - currentPage) <= 1;

            if (!shouldShow && Math.abs(pageNumber - currentPage) === 2) {
              return <span key={pageNumber}>...</span>;
            }

            return shouldShow ? (
              <button
                key={pageNumber}
                onClick={() => setSearchParams({ page: pageNumber.toString() })}
                className={`px-2 md:px-3 py-1 rounded ${
                  currentPage === pageNumber
                    ? "bg-[#112D4E] text-white"
                    : "border hover:bg-gray-100"
                }`}
              >
                {pageNumber}
              </button>
            ) : null;
          })}

          <button
            onClick={() =>
              setSearchParams({ page: (currentPage + 1).toString() })
            }
            disabled={currentPage === pagination.totalPages}
            className="px-2 md:px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>

        <div className="text-xs md:text-sm text-gray-600 text-center">
          Results: {(currentPage - 1) * 10 + 1} -{" "}
          {Math.min(currentPage * 10, totalItems)} of {totalItems}
        </div>
      </div>
    </div>
  );
}

type LoaderData = {
  terms: Array<{
    id: string;
    term: string;
    type: string;
    definition: string;
    example: string;
    repetition: number;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
  };
  totalItems: number;
};
