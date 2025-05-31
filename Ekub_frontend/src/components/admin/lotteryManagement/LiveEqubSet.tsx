import React, { useEffect, useState } from "react";
import {
  clearSuccessMessage,
  LotteryDate,
  updateSetLottery,
} from "../../../store/features/admin/equb/equbSlice";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import ConnectionErrorPage from "../../../utils/ErrorPage";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface LiveEqubProps {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const LiveEqubSet: React.FC<LiveEqubProps> = ({ setOpen }) => {
  const dispatch = useAppDispatch();
  const { equb, isLoading, successMessage, error } = useAppSelector(
    (state) => state.equbs
  );
  const [updateLottery, setUpdateLottery] = useState<LotteryDate>({
    id: "",
    nextRoundDate: "",
    nextRoundTime: "",
    currentRoundWinners: 0,
    notifyAllMembers: false,
    nextRoundLotteryType: "finance",
  });

  //   console.log(`updateLottery`, updateLottery);
  useEffect(() => {
    if (equb) {
      // const currentDate = equb.nextRoundDate
      //   ? new Date(equb.nextRoundDate)
      //   : new Date();
      // const formattedDate = currentDate.toISOString().split("T")[0];
      // // const formattedTim = currentDate.toISOString().split('T')[1];

      // const currentTime = equb.nextRoundTime
      //   ? new Date(equb.nextRoundTime)
      //   : new Date();

      // const formattedTime = currentTime.toLocaleTimeString("en-US", {
      //   hour12: false,
      //   hour: "2-digit",
      //   minute: "2-digit",
      // });
      // Format the nextRoundDate
      // Format the nextRoundDate
      const currentDate = equb.nextRoundDate
        ? new Date(equb.nextRoundDate)
        : new Date();

      // Adjust for the local time zone
      currentDate.setMinutes(
        currentDate.getMinutes() - currentDate.getTimezoneOffset()
      );

      const formattedDate = currentDate.toISOString().split("T")[0];

      // Format the nextRoundTime
      const currentTime = equb.nextRoundTime
        ? new Date(`1970-01-01T${equb.nextRoundTime}`)
        : new Date(); // Default to the current time if not set

      const formattedTime = currentTime
        .toTimeString()
        .split(" ")[0]
        .slice(0, 5);

      // console.log("formattedTime", formattedDate);
      setUpdateLottery({
        ...updateLottery,
        id: equb.id,
        nextRoundDate: formattedDate,
        nextRoundTime: formattedTime,
        currentRoundWinners: equb.currentRoundWinners || 1,
        nextRoundLotteryType: equb.nextRoundLotteryType,
      });
    }
  }, [equb]);
  // useEffect(() => {
  //   console.log(updateLottery.id);
  // }, [updateLottery]);

  const handleSubmit = () => {
    // console.log("Submitting:", updateLottery);
    if (updateLottery) {
      dispatch(
        updateSetLottery({
          equbData: updateLottery,
          setOpen,
        })
      );
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;

      if (name === "nextRoundLotteryType") {
        setUpdateLottery((prevLottery) => ({
          ...prevLottery,
          nextRoundLotteryType: checked ? "request" : "finance",
        }));
      } else {
        setUpdateLottery((prevLottery) => ({
          ...prevLottery,
          [name]: checked,
        }));
      }
    } else {
      setUpdateLottery((prevLottery) => ({
        ...prevLottery,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setUpdateLottery((prevLottery) => ({
      ...prevLottery,
      nextRoundDate: date ? date.toISOString().split("T")[0] : "",
    }));
  };

  const handleTimeChange = (time: Date | null) => {
    // console.log("time", time);
    setUpdateLottery((prevLottery) => ({
      ...prevLottery,
      nextRoundTime: time ? time.toTimeString().split(" ")[0].slice(0, 5) : "",
    }));
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  if (error) {
    return <ConnectionErrorPage error={error} />;
  }

  // const aDayStartsFromNow = new Date();
  // aDayStartsFromNow.setDate(aDayStartsFromNow.getDate() + 1);
  // const DateValidation = aDayStartsFromNow.toISOString().split("T")[0];

  // const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   e.preventDefault();
  // };
  const now = new Date();
  const minTime = () => {
    const nowWithOffset = new Date();
    nowWithOffset.setMinutes(nowWithOffset.getMinutes() + 5);
    return new Date(
      `1970-01-01T${nowWithOffset.toTimeString().split(" ")[0].slice(0, 5)}`
    );
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    // Prevent keyboard input
    e.preventDefault();
  };
  return (
    <div className="flex flex-col justify-center gap-2 pb-16 w-full">
      {successMessage && (
        <p className="text-green-500 items-center text-center">
          {successMessage}
        </p>
      )}
      <div className="flex gap-28 pl-10">
        <label htmlFor="nextRoundDate" className="text-[#48505E] w-36">
          Live Stream Date
        </label>
        <DatePicker
          className="border-[1px] p-1 pl-4 stroke-slate-500 rounded outline-none"
          selected={
            updateLottery.nextRoundDate
              ? new Date(updateLottery.nextRoundDate)
              : null
          }
          onChange={handleDateChange}
          minDate={now}
          placeholderText="Enter Date"
          dateFormat="yyyy-MM-dd"
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="flex gap-28 pl-10">
        <label
          htmlFor="nextRoundTime"
          className="text-[#48505E] size-[16px] w-36"
        >
          Specific Time
        </label>
        <DatePicker
          className="border-[1px] p-1 pl-4 stroke-slate-500 rounded w-36 outline-none"
          selected={
            updateLottery.nextRoundTime
              ? new Date(`1970-01-01T${updateLottery.nextRoundTime}`)
              : null
          }
          onChange={handleTimeChange}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={5}
          minTime={minTime()}
          maxTime={new Date("1970-01-01T23:59")}
          timeCaption="Time"
          dateFormat="HH:mm"
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="flex gap-28 pl-10">
        <label htmlFor="winners" className="text-[#48505E] size-[16px] w-36">
          No of winners
        </label>
        <input
          className="border-[1px] p-1 pl-4 stroke-slate-500 rounded w-36"
          type="number"
          name="currentRoundWinners"
          id="currentRoundWinners"
          placeholder="Enter Number"
          value={updateLottery.currentRoundWinners}
          onChange={handleInputChange}
        />
      </div>
      {/* Checkbox for toggling between "finance" and "request" */}
      {equb?.equbCategory?.name === "Special Finance" && (
        <div className="flex gap-28 pl-10 mb-5">
          <label
            htmlFor="nextRoundLotteryType"
            className="text-[#48505E] mr-20"
          >
            Request
          </label>
          <input
            type="checkbox"
            id="nextRoundLotteryType"
            name="nextRoundLotteryType"
            checked={updateLottery.nextRoundLotteryType === "request"}
            onChange={handleInputChange}
          />
        </div>
      )}

      <div className="flex gap-28 pl-10 mb-5">
        <label htmlFor="notifyAllMembers" className="text-[#48505E]">
          Notify All members
        </label>
        <input
          type="checkbox"
          id="notifyAllMembers"
          name="notifyAllMembers"
          checked={updateLottery.notifyAllMembers}
          onChange={handleInputChange}
        />
      </div>
      <div className="flex justify-center gap-5 ml-[130px]">
        {isLoading ? (
          <button
            className="bg-[#689a61] text-white p-2 rounded w-32"
            onClick={handleSubmit}
            disabled
          >
            Updating
          </button>
        ) : (
          <button
            className="bg-[#4B9B41] text-white p-2 rounded w-20"
            onClick={handleSubmit}
          >
            save
          </button>
        )}

        <button
          type="button"
          className={`bg-slate-600  text-white font-normal py-2 px-4 rounded-md focus:outline-none focus:shadow-outline `}
          onClick={() => {
            setOpen && setOpen(false);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LiveEqubSet;
