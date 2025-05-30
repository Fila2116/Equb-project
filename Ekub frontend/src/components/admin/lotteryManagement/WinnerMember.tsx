import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { useEffect, useRef, useState } from "react";
import {
  clearSuccessMessage,
  fetchAllWinners,
} from "../../../store/features/admin/equber/equberSlice";
import Logo from "../../../assets/Logo.png";
import {
  Button,
  Modal,
  Fade,
  Box,
  Typography,
} from "@mui/material";
import Pagination from "../../layout/Pagination";
import ConnectionErrorPage from "../../../utils/ErrorPage";
import { formatCurrencyWithSymbolAfter } from "../../../utils/currencyFormatter";
import Loader from "../../../utils/Loader";
import { TiTick } from "react-icons/ti";
import { MdClose } from "react-icons/md";
import dayjs from "dayjs";
import React from "react";
import { useReactToPrint } from "react-to-print";

interface WinnerMemberProps {
  searchQuery: string;
  sortBy: string;
  lotteryNumber: string;
  startDate: Date | null;
  endDate: Date | null;
  openPrint: boolean;
}

function WinnerMember({ searchQuery, sortBy,openPrint, lotteryNumber, startDate, endDate }: WinnerMemberProps) {
  const dispatch = useAppDispatch();
  const { Winners, totalPages, isLoading, error, successMessage } =
    useAppSelector((state) => state.equbers);
  const {
    equbProfile
    , equb
  } = useAppSelector((state) => state.equbs);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const handleClose = () => window.location.reload();
   const [open1, setOpen1] = React.useState(openPrint);
   const style = {
     position: "absolute",
     top: "50%",
     left: "50%",
     right: "25%",
     transform: "translate(-50%, -50%)",
     width: 800,
     bgcolor: "background.paper",
     border: "2px solid gray",
     boxShadow: 10,
     borderRadius: 2,
     p: 4,
     overflow: "scroll",
     height: "95%",
     display: "block",
   };
   React.useEffect(() => {
     setOpen1(openPrint);
   }, [openPrint]);
  //Print Loterry detail
   const componentRef = useRef<HTMLTableElement>(null);
   const LotteryPrint = useReactToPrint({
     content: () => componentRef.current,
     documentTitle: "Lottery Management Of Hagerigna Cloud Equb Company",
   });
   const LotteryPrintAction = () => {
     LotteryPrint();
   };
   const cellStyle: React.CSSProperties = {
       border: "1px solid #000",
       padding: "6px",
       fontSize: "12px",
     };
  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    if (id) {
      dispatch(
        fetchAllWinners({
          id,
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          sortBy,
           lotteryNumber: lotteryNumber,
                    startDate: startDate
                      ? dayjs(startDate).format("YYYY-MM-DD")
                      : undefined,
                    endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : undefined,

        })
      );
    }
  }, [id, dispatch, currentPage, itemsPerPage, searchQuery, sortBy, lotteryNumber, startDate, endDate]);

  // console.log("Winners", Winners);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    if (!id) return;
    dispatch(
      fetchAllWinners({
        id,
        page: currentPage,
        limit: newItemsPerPage,
        search: searchQuery,
        sortBy,
      }) as any
    );
  };
  const totalPaid = Winners.reduce((total, equber) => {
    return total + (equber?.totalPaid || 0);
  }, 0);
  // Filter the members based on searchQuery
  // const filteredEqubers = Winners.filter((Winner) =>
  //   Winner.users[0].user?.fullName
  //     .toLowerCase()
  //     .includes(searchQuery.toLowerCase())
  // );

  // const shouldShowFiltered = searchQuery.trim().length > 0;
  // const displayEqubers = shouldShowFiltered ? filteredEqubers : Winners;
  if (error) {
    return <ConnectionErrorPage error={error} />;
  }

  // console.log("displayEqubers", displayEqubers);
  return (
    <div className="p-4 my-2 rounded-sm mx-4">
      {successMessage && (
        <p className="text-green-500 items-center text-center">
          {successMessage}
        </p>
      )}
         <div className="flex items-center w-full justify-start mb-2">
                {/* export  */}
                <div className="pull-left actionbut">
      
      
                  <Modal
                    open={open1}
                    onClose={handleClose}
                    closeAfterTransition
                    aria-labelledby="transition-modal-title"
                    aria-describedby="transition-modal-description"
                    BackdropProps={{ timeout: 500 }}
                  >
                    <Fade in={open1}>
                      <Box sx={style}>
                        <Typography
                          id="transition-modal-title"
                          variant="h6"
                          component="h2"
                        >
                          <Button
                            size="small"
                            variant="contained"
                            onClick={LotteryPrintAction}
                          >
                            Print
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={handleClose}
                            sx={{ ml: 2 }} // Adds spacing between buttons
                          >
                            Cancel
                          </Button>
                        </Typography>
      
                        <div ref={componentRef} >
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "20px",
                            padding: "16px 0",
                            borderBottom: "1px solid #eee",
                            marginBottom: "24px"
                          }}>
                            <img src={Logo} alt="Equber Logo" style={{ height: 80 }} />
                            <div>
                              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>Equber Lottery Statement</h1>
                              <p style={{ margin: "4px 0", fontSize: "14px", color: "#555" }}>
                                <strong>Equb:</strong> {equb?.name}
                              </p>
                              <p style={{ margin: "4px 0", fontSize: "14px", color: "#555" }}>
                                <strong>Equb Type:</strong> {equb?.equbType?.name}
                              </p>
                            </div>
                          </div>
      
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3, 1fr)",
                              gap: "16px",
                              fontSize: "14px",
                              color: "#333",
                              lineHeight: "1.6",
                              marginTop: "16px",
                            }}
                          >
                            {/* <div><strong>User:</strong> Lidya Getachew</div> */}
                            <div><strong>Start Date:</strong> {dayjs(startDate).format("MMM DD, YYYY")}</div>
                            <div><strong>End Date:</strong> {dayjs(endDate).format("MMM DD, YYYY")}</div>
                            <div><strong>Round:</strong> {equbProfile?.currentRound}</div>
                            <div><strong>Equb Amount:</strong> {equbProfile?.equbAmount}</div>
                            <div><strong>Total Members:</strong> {equbProfile?.totalMembers}</div>
                          </div>
      
                          {/* Table */}
                          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
                            <thead>
                              <tr>
                                {["Full Name", "Stake", "Total Paid","Claim Amount" ,"Date", "Financial %", "KYC %", "Admins %", "Total %"].map(header => (
                                  <th key={header} style={{ border: "1px solid #000", padding: "6px", background: "#f1f1f1" }}>{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {Winners && Winners.length > 0 ? (
                                Winners.map((e) => (
                                  <tr key={e.id}>
                                    <td style={cellStyle}>
                                      {e.isGruop
                                        ? `${e.lotteryNumber} (${e.users.length} members)`
                                        : `${e.users[0].user?.fullName} ${e.lotteryNumber}`}
                                    </td>
                                    <td style={cellStyle}>{e.users[0].stake.toFixed(2)}%</td>
                                    <td style={cellStyle}>{formatCurrencyWithSymbolAfter(e.totalPaid, "ETB", "am-ET")}</td>
                                     <td style={cellStyle}>{formatCurrencyWithSymbolAfter(e.users[0].claimAmount, "ETB", "am-ET")}</td>
                                    <td style={cellStyle}>{
                                      e.createdAt
                                        ? dayjs(e.createdAt).format("MMM DD YYYY")
                                        : "-"
                                    }</td>
                                    <td style={cellStyle}>{e.financePoint}%</td>
                                    <td style={cellStyle}>{e.kycPoint}%</td>
                                    <td style={cellStyle}>{e.adminPoint}%</td>
                                    <td style={cellStyle}>{e.totalEligibilityPoint}%</td>
      
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={8}
                                    className="text-center text-gray-500 py-4"
                                  >
                                    No members found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
      
                          {/* Summary Totals */}
                          <div style={{ marginTop: 30 }}>
                            <h3>Total Paid: {formatCurrencyWithSymbolAfter(totalPaid, "ETB", "am-ET")}</h3>
                          </div>
                        </div>
      
      
                      </Box>
                    </Fade>
                  </Modal>
                </div>
              </div>
      <div className="bg-white shadow-lg rounded-xl p-8 mt-6">
        <div className="relative overflow-x-auto m-1 p-2 h-96">
          <div className="mb-6">
            {/* <h2 className="font-semibold text-base">All Members</h2> */}
          </div>
          <table className="w-full text-sm text-left text-gray-800 min-h-30">
            <thead className="text-xs text-[#B5B7C0] bg-transparent">
              <tr className="border-b">
                <th scope="col" className="px-6 py-3 text-xs">
                  Full Name
                </th>
                <th scope="col" className="px-6 py-3 text-xs">
                  Round
                </th>
                <th scope="col" className="px-6 py-3 text-xs">
                  Total Paid
                </th>
                <th scope="col" className="px-6 py-3 text-xs">
                  Financial %
                </th>
                <th scope="col" className="px-6 py-3 text-xs">
                  KYC %
                </th>
                <th scope="col" className="px-6 py-3 text-xs">
                  Admins %
                </th>
                <th scope="col" className="px-6 py-3 text-xs">
                  Total
                </th>
                {/* <th scope="col" className="px-6 py-3 text-xs">
                  Payable Amount
                </th> */}
                <th scope="col" className="px-6 py-3 text-xs">
                  Marked Paid
                </th>
                <th scope="col" className="px-6 py-3 text-xs">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-gray-600 text-lg font-semibold"
                  >
                    <Loader />
                  </td>
                </tr>
              ) : Winners.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No Winners Found.
                  </td>
                </tr>
              ) : (
                Winners.map((equber) =>
                  equber.hasWonEqub ? (
                    <tr
                      key={equber.id}
                      className="bg-white border-b border-gray-200"
                    >
                      <td
                        scope="row"
                        className="px-6 py-4 whitespace-nowrap text-xs text-gray-900  font-medium"
                      >
                        {equber.isGruop
                          ? `${equber.lotteryNumber} (${equber.users.length} members )`
                          : `${equber.users[0].user?.fullName} ${equber.lotteryNumber}`}
                      </td>
                      <td className="px-4 py-2 border-b font-medium">
                        {equber.winRound}
                      </td>
                      <td className="px-4 py-2 border-b font-medium">
                        {formatCurrencyWithSymbolAfter(
                          equber.totalPaid!,
                          "ETB",
                          "am-ET"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                        {equber.financePoint} %
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                        {equber.kycPoint} %
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                        {equber.adminPoint} %
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                        {equber.totalEligibilityPoint}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                        {formatCurrencyWithSymbolAfter(
                          equber.calculatedPaidAmount,
                          "ETB",
                          "am-ET"
                        )}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                        {equber.users[0].hasTakenEqub ? (
                          <TiTick className="text-green-500 text-xl" />
                        ) : (
                          <MdClose className="text-red-500 text-xl" />
                        )}
                      </td>
                      <td className="text-center relative">
                        <Link to={`/dashboard/winnerrequest/${equber.id}`}>
                          <button className="px-4 py-2 rounded hover:underline text-primary font-medium">
                            Open
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ) : null
                )
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
      </div>
    </div>
  );
}

export default WinnerMember;
