import withMainComponent from "../../layout/withMainComponent";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
} from "recharts";
import { GoDotFill } from "react-icons/go";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  clearSuccessMessage,
  Equber,
  fetchChartData,
  fetchEquber,
  updateEquber,
  UserEquber,
} from "../../../store/features/admin/equber/equberSlice";
import ConnectionErrorPage from "../../../utils/ErrorPage";
import { FiArrowLeft } from "react-icons/fi";
import { fetchEqub } from "../../../store/features/admin/equb/equbSlice";
import Loader from "../../../utils/Loader";
import { formatCurrencyWithSymbolAfter } from "../../../utils/currencyFormatter";
import { toast } from "sonner";

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    // const currentlyPaid = payload[0]?.payload.totalPaid;
    const expected = payload[0]?.payload.expectedAmount;
    const cumulativePaid = payload[0]?.payload.cumulativePaid;
    const difference = Math.abs(expected - cumulativePaid);

    return (
      <div className="bg-white p-2 border border-gray-300 shadow-lg">
        <p>{`Difference: ${formatCurrencyWithSymbolAfter(
          difference,
          "ETB",
          "am-ET"
        )}`}</p>
        <p>{`Expected: ${formatCurrencyWithSymbolAfter(
          expected,
          "ETB",
          "am-ET"
        )}`}</p>
        <p>{`Cumulative Paid: ${formatCurrencyWithSymbolAfter(
          cumulativePaid,
          "ETB",
          "am-ET"
        )}`}</p>
      </div>
    );
  }
  return null;
};

function MemberProfile() {
  const { equber, isLoading, EquberPaymentHistory, successMessage, error } =
    useAppSelector((state) => state.equbers);
  // const { equbProfile } = useAppSelector((state) => state.equbs);

  const dispatch = useAppDispatch();
  const [checkedExclude, setChechkedExclude] = useState(false);
  const [checkedInclude, setChechkedInclude] = useState(false);
  const [checkedUnlisted, setChechkedUnlisted] = useState(false);
  const [updatedEquber, setUpdatedEquber] = useState<Equber>({
    id: "",
    lotteryNumber: "",
    hasWonEqub: false,
    isNotified: false,
    equbId: "",
    isGruop: false,
    dividedBy: 1,
    filledPercent: 0,
    totalPaid: 0,
    paidRound: 0,
    financePoint: 0,
    kycPoint: 0,
    adminPoint: 0,
    totalEligibilityPoint: 0,
    included: false,
    excluded: false,
    show: true,
    winRound: null,
    state: "",
    createdAt: "",
    updatedAt: "",
    users: [
      {
        id: "",
        userId: "",
        guaranteeId: null,
        stake: 0,
        hasTakenEqub: false,
        hasClaimed: false,
        claimAmount: 0,
        equberId: "",
        equberRequestId: null,
        totalPaid: 0,
        paidRound: 0,
        paymentScore: 0,
        paymentScoreCalculatedRound: 0,
        state: "",
        createdAt: "",
        updatedAt: "",
        user: {
          id: "",
          username: "",
          email: null,
          fullName: "",
          firstName: "",
          lastName: "",
          phoneNumber: "",
          password: "",
          avatar: null,
          googleId: null,
          isVerified: false,
          decline_reason: null,
          passwordResetToken: null,
          passwordResetExpiresIn: null,
          state: "",
          kycId: null,
          profileCompletion: 0,
          createdAt: "",
          updatedAt: "",
          equberUsers: [],
        },
      },
    ],
  });
  const [selectedUser, setselectUser] = useState<UserEquber | null>(null);
  const navigate = useNavigate();

  // console.log("fetch ChartData", EquberPaymentHistory);
  // console.log("Numeber of Equber or Round", equbProfile?.totalMembers);
  //getting id from url
  const { id } = useParams<{ id: string }>();

  // console.log("checkedUnlisted", checkedUnlisted);
  // console.log("checkedInclude", checkedInclude);
  // console.log("checkedExclude", checkedExclude);

  // Fetch equber data on load
  useEffect(() => {
    if (id) {
      dispatch(fetchEquber(id));
      dispatch(fetchChartData(id));
      dispatch(fetchEqub(id));
    }
  }, [id, dispatch, selectedUser]);

  //  Update local state when equber data is fetched
  useEffect(() => {
    if (equber) {
      setUpdatedEquber(equber);
      setChechkedInclude(equber.included);
      setChechkedExclude(equber.excluded);
      setChechkedUnlisted(equber.show);
    }
  }, [equber]);

  //handling inputs

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUpdatedEquber((prevEquber) => ({
      ...prevEquber,
      [name]: value,
    }));
  };

  // const handleCheckboxChange = (setter) => () => {
  //   setter((prev) => !prev);
  // };

  // console.log(`equber`, equber);

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = event.target.value;
    // const currentUser = equber?.users?.find((user) => user.id === userId);
    const currentUser: any = equber?.users?.find((user) => user.id === userId);
    // if (currentUser){ setselectUser(currentUser )}else{}
    currentUser ? setselectUser(currentUser) : setselectUser(null);
    // console.log("currentUser", currentUser);
  };
  // console.log(`selectedUser`, selectedUser?.user.fullName);

  const handlecheckedExclude = () => {
    setChechkedExclude((prevExclude) => {
      const newExclude = !prevExclude;
      setChechkedInclude(!newExclude);
      return newExclude;
    });
  };

  const handlecheckedInclude = () => {
    setChechkedInclude((prevInclude) => {
      const newInclude = !prevInclude;
      setChechkedExclude(!newInclude);
      return newInclude;
    });
  };

  const handlecheckedUnlist = () => {
    setChechkedUnlisted((checkedUnlisted) => !checkedUnlisted);
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [dispatch, successMessage]);

  const handleSubmit = () => {
    if (!equber) {
      console.error("Equber is null");
      return;
    }
    // console.log("handle submit equber", equber);

    const updatedEquberData = {
      ...updatedEquber,
      excluded: checkedExclude,
      included: checkedInclude,
      show: checkedUnlisted,
    };

    // Dispatch the update action
    dispatch(updateEquber({ equberData: updatedEquberData, id: equber.id }));
    toast.success("User updated successfully.");
  };

  // useEffect(() => {});

  if (error) {
    return <ConnectionErrorPage error={error} />;
  }

  // Transforming API response into chart-friendly format
  const transformedData = EquberPaymentHistory.map((payment, index, array) => {
    const cumulativePaid = array
      .slice(0, index + 1)
      .reduce((sum, item) => sum + item.totalPaid, 0);

    return {
      round: `Round ${payment.round}`,
      totalPaid: payment.totalPaid,
      expectedAmount: payment.expectedAmount,
      cumulativePaid: cumulativePaid,
    };
  });
  return (
    <div className="flex flex-col m-8">
      <div className="flex flex-col mb-10 ">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-green-500 hover:text-green-600 transition-colors duration-300 space-x-2 mb-3 rounded-lg p-2 w-20 shadow-md hover:shadow-lg"
        >
          <FiArrowLeft className="text-2xl" />
          <span className="font-semibold">Back</span>
        </button>
        <h1 className="font-bold size-[24px] w-full">
          {selectedUser?.user.fullName ||
            equber?.users[0]?.user?.fullName ||
            ""}
        </h1>
        <p className="text-[#7E7E7E] size-[16px] w-[17rem]">
          Lottery Number: {equber?.lotteryNumber}
        </p>
      </div>

      <div className="bg-white flex flex-col gap-4 rounded-3xl p-8 mb-10">
        <div className="flex gap-8">
          <h1 className="font-bold">Transaction</h1>
          <div className="flex w-17 gap-1">
            <GoDotFill className="align-middle mt-1 text-[#188641] text-xl" />
            <p>Paid</p>
          </div>
          <div className="flex w-17 gap-1">
            <GoDotFill className="align-middle mt-1 text-[#A8C5DA] text-xl" />
            <p>Expected To Paid</p>
          </div>
          {equber?.users && equber.users.length > 1 && (
            <select
              name="user"
              className="ml-auto w-[86px] h-[32px] p-1.5 border border-[#F0F2F4] rounded-t-lg bg-white text-sm shadow-md outline-none opacity-100 transition-opacity duration-300 "
              onChange={handleSelect}
            >
              {equber &&
                equber.isGruop &&
                equber.users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user?.user?.fullName || ""}
                  </option>
                ))}
            </select>
          )}
        </div>
        <div>
          {EquberPaymentHistory.length > 0 ? (
            <div className="p-6 bg-white shadow-lg rounded-lg">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={transformedData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                >
                  <CartesianGrid stroke="#e0e0e0" vertical={false} />
                  <XAxis
                    dataKey="round"
                    tick={{ fill: "#888", fontSize: 12 }}
                    axisLine={{ stroke: "#ddd" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#888", fontSize: 12 }}
                    axisLine={{ stroke: "#ddd" }}
                    tickLine={false}
                  />
                  <Tooltip content={CustomTooltip} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={36}
                    iconType="circle"
                  />
                  <Bar dataKey="totalPaid" fill="#188641" barSize={30} />
                  <Bar dataKey="expectedAmount" fill="#A8C5DA" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80">
              <svg
                className="w-16 h-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6M12 6h.01M12 20.02v.01M20 12.02a8 8 0 11-16 0 8 8 0 0116 0z"
                ></path>
              </svg>
              <p className="text-gray-500 text-xl font-semibold">
                No payment history available.
              </p>
              <p className="text-gray-400">
                Once payments are made, they will be displayed here.
              </p>
            </div>
          )}
        </div>
      </div>

      {equber && (
        <div className="flex flex-col gap-y-3">
          <div>
            <h1>Customer Rating</h1>
          </div>

          <div className="flex flex-wrap justify-between md:space-x-4 mb-10">
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <p>Finance</p>
              <input
                className="rounded-md p-1 text-gray-400 bg-white outline-none w-full md:w-auto"
                type="text"
                placeholder="Enter 1-30 %"
                name="financePoint"
                value={equber.financePoint}
                onChange={handleInputChange}
                disabled
              />
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <p>Payment Score</p>
              <input
                className="rounded-md p-1 outline-none focus:ring-2 focus:ring-green-400 w-full md:w-auto"
                type="number"
                placeholder="Enter 1-30 %"
                name="financePoint"
                value={equber.users[0].paymentScore}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <p>Know your Customer</p>
              <input
                className="rounded-md p-1 text-gray-400 bg-white outline-none w-full md:w-auto"
                type="text"
                placeholder="Enter 1-30 %"
                value={equber.kycPoint}
                onChange={handleInputChange}
                name="kycPoint"
                disabled
              />
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <p>Admin Decision</p>
              <input
                className="rounded-md p-1 outline-none focus:ring-2 focus:ring-green-400 w-full md:w-auto"
                type="text"
                name="adminPoint"
                value={updatedEquber.adminPoint}
                onChange={handleInputChange}
                placeholder="Enter 1-30 %"
              />
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <p>Sum</p>
              <input
                className="rounded-md p-1 outline-none focus:ring-2 focus:ring-green-400 w-full md:w-auto"
                type="text"
                name="totalEligibilityPoint"
                value={updatedEquber.totalEligibilityPoint}
                onChange={handleInputChange}
                placeholder="Enter 1-30 %"
              />
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center space-x-2">
              <Loader />
            </div>
          ) : (
            ""
          )}

          <div className="flex flex-wrap gap-10 mb-10">
            <div className="flex gap-2">
              <label className="inline-flex gap-2 items-center cursor-pointer">
                Exclude user
                {checkedExclude ? (
                  <input
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                    checked={checkedExclude}
                  />
                ) : (
                  <input
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                    disabled
                  />
                )}
                <div
                  onClick={handlecheckedExclude}
                  className="relative w-7 h-4 bg-gray-200 rounded-full peer peer-focus:ring-2 dark:bg-white-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-green-700 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-white-600 peer-checked:bg-gray-400"
                ></div>
              </label>
            </div>
            <div className="flex gap-2">
              <h1>Include user in list</h1>
              <label className="inline-flex items-center cursor-pointer">
                {checkedUnlisted ? (
                  <input
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                    checked={checkedUnlisted}
                  />
                ) : (
                  <input
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                    disabled
                  />
                )}
                <div
                  onClick={handlecheckedUnlist}
                  className="relative w-7 h-4 bg-gray-200 rounded-full peer peer-focus:ring-2 dark:bg-white-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-green-700 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-white-600 peer-checked:bg-gray-400"
                ></div>
              </label>
            </div>
            <div className="flex gap-2">
              <h1>Include user 100%</h1>
              <label className="inline-flex items-center cursor-pointer">
                {checkedInclude ? (
                  <input
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                    checked={checkedInclude}
                  />
                ) : (
                  <input
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                    disabled
                  />
                )}
                <div
                  onClick={handlecheckedInclude}
                  className="relative w-7 h-4 bg-gray-200 rounded-full peer peer-focus:ring-2 dark:bg-white-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-green-700 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-white-600 peer-checked:bg-gray-400"
                ></div>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-14">
            <button
              className="bg-[#4B5563] p-2 text-white rounded-lg w-20"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              className="bg-[#149D52] p-2 text-white rounded-lg w-30"
              onClick={handleSubmit}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default withMainComponent(MemberProfile);
