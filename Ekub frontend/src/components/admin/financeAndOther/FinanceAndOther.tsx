import { useEffect, useState } from "react";
import { fetchFinanceAndOther } from "../../../store/features/admin/equb/equbSlice";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import withMainComponent from "../../layout/withMainComponent";
import Loader from "../../../utils/Loader";
import { Link } from "react-router-dom";

const FinanceAndOther: React.FC = () => {
  const dispatch = useAppDispatch();
  const { financeAndCar, financeAndHouse, financeAndTravel, specialFinance } =
    useAppSelector((state) => state.equbs);
  const [selectedCategory, setSelectedCategory] = useState("financeAndCar");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [popupData, setPopupData] = useState<any[]>([]);
  const [popupTitle, setPopupTitle] = useState("");
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryPopup, setCategoryPopup] = useState<{
    title: string;
    data: any[];
  } | null>(null);
  const [detailPopup, setDetailPopup] = useState<any>(null);
  console.log("specialFinance", specialFinance);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchFinanceAndOther()).finally(() => setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      if (selectedCategory === "financeAndCar") {
        setSelectedData(financeAndCar);
      } else if (selectedCategory === "financeAndHouse") {
        setSelectedData(financeAndHouse);
      } else if (selectedCategory === "financeAndTravel") {
        setSelectedData(financeAndTravel);
      } else if (selectedCategory === "specialFinance") {
        setSelectedData(specialFinance);
      }
      setLoading(false);
    }, 500);
  }, [
    selectedCategory,
    financeAndCar,
    financeAndHouse,
    financeAndTravel,
    specialFinance,
  ]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleViewClick = (user: any, category: string) => {
    if (["Car", "House", "Travel"].includes(category)) {
      const filteredEqubs = user.joinedEqubs.filter(
        (equb: any) => equb.equbCategory.name === category
      );
      setCategoryPopup({ title: `${category} Equbs`, data: filteredEqubs });
    } else if (category === "Other") {
      const otherCategories = ["Car", "House", "Travel"];
      const otherEqubs = user.joinedEqubs.filter((equb: any) =>
        otherCategories.includes(equb.equbCategory.name)
      );
      setCategoryPopup({ title: "Other Categories", data: otherEqubs });
    } else {
      setSelectedUser(user);
      const filteredEqubs = user.joinedEqubs.filter(
        (equb: any) => equb.equbCategory.name === category
      );
      setPopupData(filteredEqubs);
      setPopupTitle(category);
    }
  };

  const handleDetailClick = (user: any) => {
    setDetailPopup(user);
  };

  const handleClosePopup = () => {
    setSelectedUser(null);
    setPopupData([]);
    setPopupTitle("");
  };

  const handleCloseCategoryPopup = () => {
    setCategoryPopup(null);
  };

  const handleCloseDetailPopup = () => {
    setDetailPopup(null);
  };

  const renderTableRows = (data: any[]) => {
    return data.map((user) => (
      <tr key={user.id} className="bg-white border-b border-gray-200">
        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
          {user.fullName}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-xs">{user.username}</td>
        <td className="px-6 py-4 whitespace-nowrap text-xs">
          <button
            className="text-green-500 hover:underline"
            onClick={() => handleViewClick(user, "Finance")}
          >
            View
          </button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-xs">
          <button
            className="text-green-500 hover:underline"
            onClick={() => handleViewClick(user, "Other")}
          >
            View
          </button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-xs">
          <button
            className="text-green-500 hover:underline"
            onClick={() => handleViewClick(user, "Special Finance")}
          >
            View
          </button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-xs">
          <button
            className="text-green-500 hover:underline"
            onClick={() => handleDetailClick(user)}
          >
            Detail
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div>
      <div className="font-poppins text-[22px] font-semibold leading-[33px] tracking-[-0.01em] text-left m-4">
        Finance and Other
      </div>
      <div className="bg-white shadow-lg rounded-xl p-8">
        {loading ? (
          <Loader />
        ) : (
          <div className="relative overflow-x-auto m-1 p-2">
            <div className="mb-4">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="border border-gray-300 rounded-md p-2"
              >
                <option value="financeAndCar">Finance and Car</option>
                <option value="financeAndHouse">Finance and House</option>
                <option value="financeAndTravel">Finance and Travel</option>
                <option value="specialFinance">Special Finance</option>
              </select>
            </div>
            <table className="w-full text-sm text-left text-gray-800 min-h-30">
              <thead className="text-xs text-slate-500 bg-transparent">
                <tr className="border-b">
                  <th scope="col" className="px-6 py-3 text-xs">
                    FullName
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs">
                    UserName
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs">
                    Finance
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs">
                    Other
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs">
                    Special Finance
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody>{renderTableRows(selectedData)}</tbody>
            </table>
          </div>
        )}
      </div>
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl relative w-full max-w-3xl">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
              onClick={handleClosePopup}
            >
              <span className="text-2xl">&times;</span>
            </button>
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
              {popupTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto">
              {popupData.map((equb: any) => (
                <div
                  key={equb.id}
                  className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1"
                >
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {equb.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Category:</span>{" "}
                    {equb.equbCategory.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Number of Equbers:</span>{" "}
                    {equb.numberOfEqubers}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Current Round:</span>{" "}
                    {equb.currentRound}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={`font-semibold ${
                        equb.status === "completed"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {equb.status}
                    </span>
                  </p>
                  <div className="flex justify-end mt-4">
                    <Link to={`/dashboard/lotterydetail/${equb.id}`}>
                      <button className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-md hover:shadow-lg transition">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {categoryPopup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
              onClick={handleCloseCategoryPopup}
            >
              <span className="text-2xl">&times;</span>
            </button>
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
              {categoryPopup.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto">
              {categoryPopup.data.map((equb: any) => (
                <div
                  key={equb.id}
                  className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1"
                >
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {equb.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Category:</span>{" "}
                    {equb.equbCategory.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Number of Equbers:</span>{" "}
                    {equb.numberOfEqubers}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={`font-semibold ${
                        equb.status === "completed"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {equb.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Current Round:</span>{" "}
                    {equb.currentRound}
                  </p>
                  <div className="flex justify-end mt-4">
                    <Link to={`/dashboard/lotterydetail/${equb.id}`}>
                      <button className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-md hover:shadow-lg transition">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {detailPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition duration-200"
              onClick={handleCloseDetailPopup}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              User Details
            </h2>
            <div className="text-sm text-gray-700 space-y-3 max-h-[400px] overflow-y-auto">
              <p>
                <span className="font-medium">Full Name:</span>{" "}
                {detailPopup.fullName}
              </p>
              <p>
                <span className="font-medium">Username:</span>{" "}
                {detailPopup.username}
              </p>
              <p>
                <span className="font-medium">Email:</span> {detailPopup.email}
              </p>
              <p>
                <span className="font-medium">Phone Number:</span>{" "}
                {detailPopup.phoneNumber}
              </p>
              <p>
                <span className="font-medium">Created At:</span>{" "}
                {new Date(detailPopup.createdAt).toLocaleString()}
              </p>
              <div>
                <span className="font-medium">Joined Equbs:</span>
                <ul className="list-disc list-inside ml-4 mt-2">
                  {detailPopup.joinedEqubs.map((equb: any) => (
                    <li key={equb.id}>
                      <span className="font-medium">Name:</span> {equb.name},
                      <span className="font-medium">Category:</span>{" "}
                      {equb.equbCategory.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withMainComponent(FinanceAndOther);
