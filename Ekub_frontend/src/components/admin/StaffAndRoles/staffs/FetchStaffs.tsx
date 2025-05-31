/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { Dropdown, Menu } from "antd";
import Logo from "../../../../assets/Logo.png";
import {
  Button,
} from "@mui/material";
import { DownOutlined } from "@ant-design/icons";
import exportPDF, { PdfConfig } from "../../../../utils/importPdf";
import React, { useEffect, useState } from "react";
import {
  Staff,
  fetchStaffs,
  toggleEditMode,
  clearSuccessMessage,
  deleteStaff,
} from "../../../../store/features/admin/staff/staffSlice";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { MdAdd, MdDelete } from "react-icons/md";
import Popup from "../../../layout/Popup";
import CreateStaff from "./CreateStaff";
import Pagination from "../../../layout/Pagination";
// import { fetchRoles } from "../../../../store/features/admin/roles/rolesSlice";
import EditStaffPopup from "./EditStaffPopup";
import { FaRegEdit } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { imageUrl } from "../../../../utils/imageUrl";
import ConnectionErrorPage from "../../../../utils/ErrorPage";
import Loader from "../../../../utils/Loader";
import { CSVLink } from "react-csv";
import api from "../../../../utils/axios";
type Transformed = {
  fullName: string | undefined;
  email: string | undefined;
  phoneNumber: string | undefined;
  role: string;
  state: string | undefined;
};
const FetchStaffs: React.FC = () => {
  type CompanyProfile = {
    id: string;
    country: string;
    city: string;
    address: string;
    email: string;
    tel: string;
    createdAzt: string;
    updatedAt: string;
  };

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useAppDispatch();
  const { staffs, totalPages, isLoading, error, successMessage } =
    useAppSelector((state) => state.staffs);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [deletePopup, setDeletePopup] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [stafLists, setListStaffs] = useState([] as any);
  const [transformed, setTransformed] = React.useState<Transformed[]>([]);

  useEffect(() => {
    dispatch(
      fetchStaffs({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
      })
    );
  }, [dispatch, currentPage, itemsPerPage, searchQuery]);

  useEffect(() => {

    const fetchStaffs = async () => {
      try {
        const response = await api.get(`/staff/getStaffsWithOutPagination`, {
          params: searchQuery,
        });
        setListStaffs(response.data.data.staffs);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStaffs();
  }, [showPopup, successMessage]);


  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const response = await api.get("/companyProfile/getCompanyProfileforHeader");
        setCompanyProfile(response.data.data.companyProfile);
      } catch (error: any) {
      }
    };

    fetchCompanyProfile();
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  const handleEdit = (staff: Staff) => {
    setEditStaff(staff);
    dispatch(toggleEditMode(staff.id));
  };

  const handleClosePopup = () => {
    if (editStaff) {
      dispatch(toggleEditMode(editStaff.id));
    }
    setEditStaff(null);
  };

  const handleAddStaffClose = () => {
    setShowPopup(false);
  };

  // handle delete
  const handleDelete = (id: string) => {
    setStaffToDelete(id);
    setDeletePopup(true);
  };

  const confirmDeleteStaff = async () => {
    if (staffToDelete) {
      await dispatch(deleteStaff(staffToDelete));
      setDeletePopup(false);
      setStaffToDelete(null);
      dispatch(
        fetchStaffs({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
        })
      );
    }
  };

  // handle items per page
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    dispatch(fetchStaffs({ page: currentPage, limit: newItemsPerPage }) as any);
  };

  const filteredstaffs = staffs.filter((staff) =>
    staff?.firstName?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (error) {
    return <ConnectionErrorPage error={error} />;
  }



  // Export configurations for PDF and Excel
  // Transform the equbs into a flat exportable format
  React.useEffect(() => {
    if (!stafLists) return;
    // Transform the equbs into a flat exportable format
    const transformedStaff = stafLists.map((staff: any) => ({
      fullName: `${staff.firstName} ${staff.lastName}`,
      email: staff.email,
      phoneNumber: staff.phoneNumber,
      role: staff.role?.name,
      state: staff.state,
    }));

    setTransformed(transformedStaff);

  }, [stafLists]);



  const exportAll = () => {
    const visibleColumn = [
      { key: "fullName", name: "User" },
      { key: "email", name: "Email" },
      { key: "phoneNumber", name: "Phone Number" },
      { key: "role", name: "Role" },
      { key: "state", name: "Status" },
    ];

    const pdfConfig: PdfConfig = {
      orientation: "portrait",
      unit: "pt",
      size: "A4",
      fileName: "Staff Of Hagerigna CloudEqub",
      logoBase64: Logo,
      title: "Staff Of Hagerigna CloudEqub",
      companyInfo: {
        country: companyProfile?.country,
        city: companyProfile?.city,
        address:companyProfile?.address ,
        email: companyProfile?.email,
        tel: companyProfile?.tel,
      },
      items: transformed ?? [],
      visibleColumn: visibleColumn,
    };

    // Call the actual PDF export function
    exportPDF({ pdfConfig });
  };
  const execl = transformed;
  const Execlheaders = [
    {
      key: "fullName",
      label: "User",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
    },
    {
      key: "role",
      label: "Role",
    },
    {
      key: "state",
      label: "Status",
    },

  ];

  // Dropdown menu for export options
  const menu = (
    <Menu
      items={[
        {
          key: "1",
          label: <a onClick={exportAll}>PDF</a>,
        },
        {
          key: "2",
          label: (
            <CSVLink
              filename="Staff of Hagerigna CloudEqub"
              title="List of Staff"
              data={execl}
              headers={Execlheaders}
            >
              Excel
            </CSVLink>

          ),
        },

      ]}
    />
  );
  return (
    <div className="p-4 my-2 rounded-sm mx-4">
      <div className="flex items-center justify-end w-full gap-2 mb-2">
        {/* Add Staff Button */}
        <button
          onClick={() => setShowPopup(true)}
          className="flex items-center gap-2 bg-[#149D52] hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm"
        >
          <MdAdd /> Add Staff
        </button>
        {/* Export dropdown: PDF, Excel, Print */}
        <Dropdown
          overlay={menu}
          placement="bottom"
          arrow={{ pointAtCenter: true }}
        >
          <Button size="small" variant="contained"
            style={{ backgroundColor: "#149D52", color: "white" }}
          >
            <div
              className="flex items-center gap-2 bg-[#149D52] hover:bg-green-600 text-white font-bold rounded  normal-case">
              Export
            </div>
            <DownOutlined
              translate={undefined}
              style={{ marginLeft: "2px" }}
            />
          </Button>
        </Dropdown>

      </div>

      <div className="flex justify-between bg-white p-2">
        <div>
          <h3 className="text-2xl font-bold font-poppins size-[22px] w-32 mb-2">
            All Staffs
          </h3>
          <p className="text-[#16C098]">All Members</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 opacity-70" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="ml-2 p-1 pl-6 border border-gray-300 focus:outline-none rounded-lg"
            />
          </div>
        </div>
      </div>
      {successMessage && (
        <p className="text-green-500 text-center">{successMessage}</p>
      )}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg m-1 p-2 h-96 scrollbar">
        <table className="w-full text-sm text-left text-gray-800 min-h-30">
          <thead className="text-xs text-slate-500 bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
                Phone Number
              </th>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-xs border border-r">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center">
                  <Loader />
                </td>
              </tr>
            ) : filteredstaffs.length > 0 ? (
              filteredstaffs.map((staff) => (
                <tr
                  key={staff.id}
                  className="bg-white border-b border-gray-300 border-r"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-xs border border-r">
                    <div className="flex items-center gap-1 w-36">
                      {staff.avatar && typeof staff.avatar === "string" ? (
                        <img
                          src={imageUrl("avatar", staff.avatar)}
                          alt={staff.avatar}
                          className="w-8 h-8 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <img
                          className="w-8 h-8 rounded-full"
                          src="https://imgs.search.brave.com/6NxPLF_oNh9O5A-VfVuQ_NqPrV2DqRZ9pcRhi3Fn3jQ/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/dmVjdG9yc3RvY2su/Y29tL2kvcHJldmll/dy0xeC8zNy81My9w/ZXJzb24tZ3JheS1w/aG90by1wbGFjZWhv/bGRlci1tYW4tdmVj/dG9yLTI0MzgzNzUz/LmpwZw"
                          alt=""
                        />
                      )}
                      <p>
                        {" "}
                        {staff.firstName} {staff.lastName}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs border border-r">
                    {staff.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs border border-r">
                    {staff.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs border border-r">
                    {staff.role?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs border border-r">
                    {staff?.state}
                  </td>
                  <td className="text-center relative">
                    <button
                      onClick={() => handleEdit(staff)}
                      className="px-4 py-2 rounded hover:underline text-primary"
                    >
                      <FaRegEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(staff.id)}
                      className="px-4 py-2 rounded hover:underline text-red-600 mx-2 transition duration-300 ease-in-out transform hover:scale-110"
                    >
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center">
                  No staff members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        itemsPerPage={itemsPerPage}
      />
      <Popup title="Add Staff" open={showPopup} setOpen={handleAddStaffClose}>
        <CreateStaff setShowPopup={setShowPopup} />
      </Popup>
      {editStaff && (
        <EditStaffPopup staff={editStaff} onClose={handleClosePopup} />
      )}

      {deletePopup && (
        <Popup title="Delete Staff" open={deletePopup} setOpen={setDeletePopup}>
          <div className="flex flex-col gap-4">
            <h1 className="text-center text-xl">
              Are you sure you want to delete this staff member? All information
              related to this staff member will be deleted. Please be careful.
            </h1>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeletePopup(false)}
                className="bg-green-500 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteStaff}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </Popup>
      )}
    </div>
  );
};

export default FetchStaffs;
