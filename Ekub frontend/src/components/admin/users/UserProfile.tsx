import {
  fetchUser,
  updateUserApproval,
} from "../../../store/features/admin/user/usersSlice";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import withMainComponent from "../../layout/withMainComponent";
import dayjs from "dayjs";
import ConnectionErrorPage from "../../../utils/ErrorPage";
import { imageUrl } from "../../../utils/imageUrl";
import Loader from "../../../utils/Loader";
import { fetchUserReport } from "../../../store/features/admin/report/reportSlice";
import generateExcelReport from "../../../utils/generateExcelReport";

function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, user, error } = useAppSelector((state) => state.users);
  const { userReport } = useAppSelector((state) => state.reports);
  const [checked, setChecked] = useState(false);
  const handlechecked = () => {
    setChecked(!checked);
  };

  // console.log("userReport", userReport);
  const handleDownload = () => {
    generateExcelReport(userReport);
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchUserReport(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    // console.log(id);
    if (id) {
      dispatch(fetchUser(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (user) setChecked(user.isVerified);
  }, [user]);
  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   // Add logic to update the user
  // };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    // setIsSubmitting(true);
    // setSubmitError(null);
    // setSuccessMessage(null);
    try {
      const decision = checked ? "yes" : "no";
      await dispatch(updateUserApproval({ id, decision })).unwrap();
      // setIsSubmitting(false);
      // setSuccessMessage('User updated successfully.');
      navigate(-1);
    } catch (error: any) {
      // setIsSubmitting(false);
      // setSubmitError('Failed to update user.');
      console.error("Failed to update user:", error);
    }
  };

  if (error) {
    return <ConnectionErrorPage error={error} />;
  }

  const FilterdJoinedEqubs = user?.joinedEqubs!.filter(
    (equb) => equb.status === "started"
  );

  // console.log("user", user);
  // console.log("user user?.equbs?.length", user?.joinedEqubs?.length);
  return (
    <div>
      <div className="flex justify-between mb-10 ml-[40px]">
        <div>
          <h1>Customer Managment</h1>
        </div>
        {/* <div className="flex justify-between gap-5">
          <div className="flex border-5 ">
            <MdOutlineEdit />
            <p>Edit</p>
          </div>
          <div className="">Block User</div>
        </div> */}
      </div>
      <div className="border-b border-gray-400 pb-2 ml-[40px] mr-[40px]">
        <p className="text-black-700 opacity-70">Overiew</p>
      </div>
      <div className="flex p-10 justify-between">
        <div className="flex flex-col">
          <div className="personal_info flex gap-1 flex-col mb-7">
            <div className="mb-2">
              <h1 className="font-medium opacity-70 text-black-500">
                Personal Information
              </h1>
            </div>
            {isLoading && (
              <div className="flex items-center justify-center h-full w-full absolute top-0 left-0 z-50 bg-white bg-opacity-50">
                <Loader />
              </div>
            )}

            <div className="flex ">
              <label htmlFor="" className="text-black-200 opacity-50 mr-32">
                Equper Name
              </label>

              <p className="opacity-70">{user?.fullName}</p>
            </div>
            {/* <div className="flex gap-10 max-w-100 justify-between">
              <label htmlFor="" className="text-black-200 opacity-50">
                User ID
              </label>
              <input
                className="bg-transparent border-none text-black-200 opacity-80"
                type="text"
                placeholder="Kebede abebe"
              />
            </div> */}
            <div className="flex gap-10 max-w-100 justify-between">
              <label htmlFor="" className="text-black-200 opacity-50">
                Phone Number
              </label>
              <p className="opacity-70">{user?.phoneNumber}</p>
              {/* <input
                className="bg-transparent border-none"
                type="text"
                placeholder="Kebede abebe"
              /> */}
            </div>
            <div className="flex gap-10 max-w-100 justify-between">
              <label htmlFor="" className="text-black-200 opacity-50">
                Joined Date
              </label>

              <p className="opacity-70">
                {dayjs(user?.createdAt).format("MMM DD YYYY")}
              </p>
            </div>
            {/* <div className="flex gap-10 max-w-100 justify-between">
              <label htmlFor="" className="text-black-200 opacity-50">
                Address
              </label>
              <input
                className="bg-transparent border-none"
                type="text"
                placeholder="Kebede abebe"
              />
            </div> */}
          </div>
          {/* <div className="Adress flex gap-1 flex-col mb-7">
            {" "}
            <div className="mb-2">
              <h1 className="font-medium opacity-70 text-black-500">Adress</h1>
            </div>
            <div className="flex  gap-10 max-w-100 justify-between  ">
              <label htmlFor="" className="text-black-200 opacity-50">
                Woreda
              </label>
              <input
                className="bg-transparent border-none text-black-200 opacity-80"
                type="text"
                placeholder="Lideta"
              />
            </div>
            <div className="flex gap-10 max-w-100 justify-between">
              <label htmlFor="" className="text-black-200 opacity-50">
                House Number
              </label>
              <input
                className="bg-transparent border-none text-black-200 opacity-80"
                type="text"
                placeholder="Bole beshale"
              />
            </div>
          </div> */}
          {/* <div> */}
          {/* <div className="mb-2">
              <h1 className="font-medium opacity-70 text-black-500">
                Financial information
              </h1>
            </div>
            <div className="flex gap-10 max-w-100 justify-between ">
              <label htmlFor="" className="text-black-200 opacity-50">
                Account Name
              </label>
              {user?.bankAccounts?.map((bankAccount) => {
                return (
                  <div key={bankAccount.id}>
                    <p className="opacity-70">{bankAccount.accountName}</p>

                    <div />
                  </div>
                );
              })}

              {/* <input
                className="bg-transparent border-none text-black-200 opacity-80"
                type="text"
                placeholder="Driver"
              /> */}
          {/* </div> */}
          {/* <div className="flex gap-10 max-w-100 justify-between">
              <label htmlFor="" className="text-black-200 opacity-50">
                Account Number
              </label>
              {user?.bankAccounts?.map((bankAccount) => {
                return (
                  <div key={bankAccount.id}>
                    <p className="opacity-70">{bankAccount.accountNumber}</p>
                    <div />
                  </div>
                );
              })}
            </div> */}
          {/* </div> */}
        </div>
        <div className="flex flex-col gap-4 max-w-100 align-middle">
          <div>
            {/* <img
              className="h-24"
              src="https://imgs.search.brave.com/qxcXkASEnnnF5r10_Zsw49mc9a83lhtKAVG9sFVuWSg/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/dmVjdG9yc3RvY2su/Y29tL2kvcHJldmll/dy0xeC84Ni8zMy9w/cm9maWxlLXBpY3R1/cmUtd2l0aC1hLW11/c3RhY2hlLXBsYWNl/aG9sZGVyLXZlY3Rv/ci0zODk3ODYzMy5q/cGc"
              alt=""
            /> */}
            {user?.avatar && (
              <img
                src={imageUrl("avatar", user?.avatar)}
                alt={user.firstName}
                className="w-16 h-16 object-cover rounded-md "
              />
            )}
          </div>
          <div className="flex  gap-8 ">
            <label className="opacity-50" htmlFor="">
              Total Joined Equbs
            </label>
            {user?.joinedEqubs?.length || 0}
          </div>
          <div className="flex gap-10  ">
            <label className="opacity-50" htmlFor="">
              Active Equbs
            </label>
            <p>{FilterdJoinedEqubs?.length}</p>
          </div>
          <form action="">
            <div className="flex gap-10 mb-20">
              <div className="flex">
                <label className="opacity-50" htmlFor="">
                  Is Verified
                </label>
              </div>

              <label className="inline-flex items-center cursor-pointer">
                {checked ? (
                  <input
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                    checked
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
                  onClick={handlechecked}
                  className="relative w-7 h-4 bg-gray-200 rounded-full peer peer-focus:ring-2 dark:bg-white-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-green-700 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-white-600 peer-checked:bg-gray-400"
                ></div>
                {/* <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Checked toggle</span> */}
              </label>
            </div>
            <div className="flex gap-10 items-center justify-center">
              <div>
                <button
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:from-green-500 hover:to-green-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Excel Report
                </button>
              </div>

              <Link to="/dashboard/users">
                <button className="bg-[#4B5563] p-2 w-20 rounded-lg text-white ">
                  Cancel
                </button>
              </Link>
              <button
                className="bg-primary p-2 w-30 rounded-lg text-white"
                onClick={handleSubmit}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default withMainComponent(UserProfile);
