// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useState, useEffect, useRef } from "react";
// import {
//   createUser,
//   clearSuccessMessage,
// } from "../../../store/features/admin/user/usersSlice";
// import { fetchUserTypes } from "../../../../store/features/admin/user/userTypeSlice";
// import { fetchUserCategories } from "../../../../store/features/admin/user/userCategoriesSlice";
// import { useAppDispatch, useAppSelector } from "../../../../store/store";
// import ConnectionErrorPage from "../../../../utils/ErrorPage";
// import { formatCurrencyWithSymbolAfter } from "../../../../utils/currencyFormatter";

// // import { fetchBranches } from "../../../../store/features/admin/branch/branchSlice";

// interface CreateUserProps {
//   setOpen: React.Dispatch<React.SetStateAction<boolean>>;
// }
// const CreateUser: React.FC<CreateUserProps> = ({ setOpen }) => {
//   const dispatch = useAppDispatch();
//   const { isLoading, successMessage, error } = useAppSelector(
//     (state) => state.users
//   );
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [userData, setUserData] = useState({
//     firstName: "",
//     lastName: "",
//     phoneNumber: "",
//     password: "",
//     fileName: "",
//     nextRoundDate: "",
//     notifyAllMembers: false,
//     numberOfUserers: 100,
//     userAmount: 1000,
//     isEditing: false,
//     // branchId: "",
//     startDate: "",
//     endDate: "",
//     goal: "",
//     other: "",
//   });
//   const userTypes = useAppSelector((state) => state.userTypes.userTypes);
//   const userCategories = useAppSelector(
//     (state) => state.userCategories.userCategories
//   );
//   const popupRef = useRef<HTMLDivElement>(null);
//   // const branches = useAppSelector((state) => state.branches.branches);

//   // console.log(`selectedCategory`, userCategories);
//   // console.log(`userData`, userData);

//   useEffect(() => {
//     const handleOutsideClick = (e: MouseEvent) => {
//       if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleOutsideClick);

//     return () => document.removeEventListener("mousedown", handleOutsideClick);
//   }, [setOpen]);

//   useEffect(() => {
//     dispatch(fetchUserTypes({ page: 1, limit: 10 }) as any);
//     dispatch(fetchUserCategories({ page: 1, limit: 10 }) as any);
//     // dispatch(fetchBranches({ page: 1, limit: 10 }) as any);
//   }, [dispatch]);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       dispatch(clearSuccessMessage());
//     }, 3000);

//     return () => clearTimeout(timer);
//   }, [successMessage, dispatch]);

//   const handleChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ) => {
//     const { name, value, type } = e.target;
//     if (name === "userCategoryId") {
//       // Update userCategoryId and selectedCategory based on selected ID
//       const selectedCategoryData = userCategories.find(
//         (category) => category.id === value
//       );

//       setUserData((prevData) => ({
//         ...prevData,
//         userCategoryId: value,
//       }));

//       // Set the category name for conditionally rendering fields
//       setSelectedCategory(
//         selectedCategoryData ? selectedCategoryData.name : ""
//       );
//     }

//     if (name === "serviceCharge") {
//       // Handle only valid decimal input
//       if (/^\d*\.?\d*$/.test(value)) {
//         setUserData((prevData) => ({
//           ...prevData,
//           serviceCharge: value, // Keep the service charge as a string for now
//         }));
//       }
//     } else if (type === "number") {
//       setUserData((prevData) => ({
//         ...prevData,
//         [name]: parseInt(value),
//       }));
//     } else {
//       setUserData((prevData) => ({
//         ...prevData,
//         [name]: value,
//       }));
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     const userType = userTypes.find(
//       (userType) => userType.id === userData.userTypeId
//     );
//     const userCategory = userCategories.find(
//       (userCategory) => userCategory.id === userData.userCategoryId
//     );
//     // const branch = branches.find((brnch) => brnch.id === userData.branchId);

//     if (userType && userCategory) {
//       dispatch(
//         createUser({
//           userData: {
//             ...userData,
//             serviceCharge: parseFloat(userData.serviceCharge),
//             userType,
//             userCategory,
//             // branch,
//           },
//           setOpen,
//         })
//       );
//       setUserData({
//         name: "",
//         description: "",
//         userTypeId: "",
//         userCategoryId: "",
//         groupLimit: 1,
//         serviceCharge: "3.5",
//         currentRoundWinners: 0,
//         nextRoundTime: "",
//         nextRoundDate: "",
//         notifyAllMembers: false,
//         numberOfUserers: 100,
//         userAmount: 1000,
//         isEditing: false,
//         // branchId: "",
//         startDate: "",
//         endDate: "",
//         goal: "",
//         other: "",
//       });
//       setOpen(false);
//     }
//   };

//   if (error) return <ConnectionErrorPage error={error} />;
//   // console.log("selectedCategory", selectedCategory);

//   const aDayStartsFromNow = new Date();
//   const DateValidation = aDayStartsFromNow.toISOString().split("T")[0];

//   return (
//     <div ref={popupRef}>
//       <form onSubmit={handleSubmit}>
//         <div className="flex gap-8 my-2">
//           <div className="mb-4 w-1/2">
//             <label
//               className="block text-gray-700 text-sm font-bold mb-2"
//               htmlFor="name"
//             >
//               Name:
//             </label>
//             <input
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//               id="name"
//               type="text"
//               name="name"
//               placeholder="Add Your User Name"
//               value={userData.name}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <div className="mb-6 w-full md:w-1/2">
//             <label
//               className="block text-gray-700 text-sm font-semibold mb-2"
//               htmlFor="userCategoryId"
//             >
//               User Category:
//             </label>
//             <div className="relative">
//               <select
//                 className="block appearance-none w-full bg-white border border-gray-300 rounded-lg shadow-sm py-2 px-4 text-gray-700 leading-tight focus:outline-none "
//                 id="userCategoryId"
//                 name="userCategoryId"
//                 value={userData.userCategoryId}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="" disabled>
//                   Select User Category
//                 </option>
//                 {userCategories.map((userCategory) => (
//                   <option key={userCategory.id} value={userCategory.id}>
//                     {userCategory.name}
//                   </option>
//                 ))}
//               </select>
//               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600">
//                 <svg
//                   className="w-4 h-4"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M7 10l5 5 5-5"
//                   />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           {selectedCategory === "Finance and Other" && (
//             <div className="mb-4 w-1/2">
//               <label
//                 className="block text-gray-700 text-sm font-bold mb-2"
//                 htmlFor="name"
//               >
//                 Other
//               </label>
//               <input
//                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 id="other"
//                 type="text"
//                 name="other"
//                 placeholder="Add Your other"
//                 value={userData.other}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//           )}

//           {/* <div className="mb-4 w-1/2">
//             <label
//               className="block text-gray-700 text-sm font-bold mb-2"
//               htmlFor="branchId"
//             >
//               Choose branch:
//             </label>
//             <select
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//               id="branchId"
//               name="branchId"
//               value={userData.branchId}
//               onChange={handleChange}
//               required
//             >
//               <option value="">Select branch</option>
//               {branches.map((branch) => (
//                 <option key={branch.id} value={branch.id}>
//                   {branch.name}
//                 </option>
//               ))}
//             </select>
//           </div> */}
//         </div>

//         <div className="flex flex-col md:flex-row gap-8 my-4">
//           <div className="mb-4 w-full md:w-1/2">
//             <label
//               className="block text-gray-700 text-sm font-semibold mb-2"
//               htmlFor="userTypeId"
//             >
//               User Type:
//             </label>
//             <div className="relative">
//               <select
//                 className="block appearance-none w-full bg-white border border-gray-300 rounded-lg shadow-sm py-2 px-4 text-gray-700 leading-tight focus:outline-none "
//                 id="userTypeId"
//                 name="userTypeId"
//                 value={userData.userTypeId}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="" disabled>
//                   Select User Type
//                 </option>
//                 {userTypes.map((userType) => (
//                   <option key={userType.id} value={userType.id}>
//                     {userType.name}
//                   </option>
//                 ))}
//               </select>
//               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600">
//                 <svg
//                   className="w-4 h-4"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M7 10l5 5 5-5"
//                   />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div className="mb-4 w-full md:w-1/2">
//             <label
//               className="block text-gray-700 text-sm font-semibold mb-2"
//               htmlFor="startDate"
//             >
//               Start Date:
//             </label>
//             <input
//               className="block appearance-none w-full bg-white border border-gray-300 rounded-lg shadow-sm py-2 px-4 text-gray-700 leading-tight focus:outline-none  focus:border-transparent"
//               id="startDate"
//               type="date"
//               min={DateValidation}
//               name="startDate"
//               value={userData.startDate}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           {selectedCategory === "Travel" && (
//             <div className="mb-4">
//               <label
//                 className="block text-gray-700 text-sm font-semibold mb-2"
//                 htmlFor="endDate"
//               >
//                 End Date:
//               </label>
//               <input
//                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 id="endDate"
//                 type="date"
//                 name="endDate"
//                 value={userData.endDate}
//                 min={DateValidation}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//           )}
//         </div>

//         <div className="flex gap-8 my-2">
//           <div className="mb-4 w-1/2">
//             <label
//               className="block text-gray-700 text-sm font-bold mb-2"
//               htmlFor="numberOfUserers"
//             >
//               Number of Userers:
//             </label>
//             <input
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//               id="numberOfUserers"
//               type="number"
//               name="numberOfUserers"
//               value={userData.numberOfUserers}
//               onChange={handleChange}
//               min={1}
//               required
//             />
//           </div>
//           <div className="mb-4 w-1/2">
//             <label
//               className="block text-gray-700 text-sm font-bold mb-2"
//               htmlFor="numberOfUserers"
//             >
//               Service Charge
//             </label>
//             <input
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//               id="serviceCharge"
//               type="text"
//               name="serviceCharge"
//               value={userData.serviceCharge}
//               onChange={handleChange}
//               required
//             />
//           </div>
//         </div>
//         <div className="flex gap-8 my-2">
//           {(selectedCategory === "Finance" ||
//             selectedCategory === "Special Finance") && (
//             <div className="mb-4 w-1/2">
//               <label
//                 className="block text-gray-700 text-sm font-bold mb-2"
//                 htmlFor="groupLimit"
//               >
//                 Group Limit:
//               </label>
//               <input
//                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 id="groupLimit"
//                 type="number"
//                 name="groupLimit"
//                 value={userData.groupLimit}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//           )}
//           {selectedCategory === "Travel" && (
//             <div className="mb-4 w-full">
//               <label
//                 className="block text-gray-700 text-sm font-bold mb-2"
//                 htmlFor="goal"
//               >
//                 Goal:
//               </label>
//               <input
//                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 id="goal"
//                 type="text"
//                 name="goal"
//                 placeholder="Add your Travel goal in Number"
//                 value={userData.goal}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//           )}
//           <div className="mb-4 w-1/2">
//             <label
//               className="block text-gray-700 text-sm font-bold mb-2"
//               htmlFor="numberOfUserers"
//             >
//               Single User amount:
//             </label>
//             <input
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//               id="userAmount"
//               type="number"
//               name="userAmount"
//               value={userData.userAmount}
//               onChange={handleChange}
//               required
//             />
//           </div>
//         </div>
//         <div className="mb-4">
//           {userData.numberOfUserers > 0 && userData.userAmount > 0}
//           <h6 className="font-semibold text-base">
//             Lottery Amount :
//             <span className="text-primary font-bold">
//               {/* {(
//                 userData.userAmount * userData.numberOfUserers
//               ).toLocaleString()} */}
//               {formatCurrencyWithSymbolAfter(
//                 userData.userAmount * userData.numberOfUserers,
//                 "ETB",
//                 "am-ET"
//               )}
//             </span>
//           </h6>
//         </div>
//         <div className="mb-4">
//           <label
//             className="block text-gray-700 text-sm font-bold mb-2"
//             htmlFor="description"
//           >
//             Description:{" "}
//             <span className="text-xs text-gray-400 italic font-thin">
//               (Optional)
//             </span>
//           </label>
//           <textarea
//             className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//             id="description"
//             name="description"
//             value={userData.description}
//             onChange={handleChange}
//           ></textarea>
//         </div>

//         {successMessage && (
//           <div className="text-green-500">{successMessage}</div>
//         )}
//         <div className="flex items-center gap-4 mt-12 mb-6">
//           <button
//             type="submit"
//             className={`bg-primary hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline ${
//               isLoading && "opacity-50 cursor-not-allowed"
//             }`}
//             disabled={isLoading}
//           >
//             {isLoading ? "Creating..." : "Create new User"}
//           </button>
//           <button
//             type="button"
//             className={`bg-slate-600  text-white font-normal py-2 px-4 rounded-md focus:outline-none focus:shadow-outline ${
//               isLoading && "opacity-50 cursor-not-allowed"
//             }`}
//             onClick={() => {
//               setOpen(false);
//             }}
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default CreateUser;
