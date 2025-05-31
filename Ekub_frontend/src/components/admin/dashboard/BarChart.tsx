import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { fetchReports } from "../../../store/features/admin/report/reportSlice";
import { exportToExcel } from "../../../utils/exportToExcel";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { useEffect } from "react";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const getRandomData = (length: number, max: number) => {
  return Array.from({ length }, () => Math.floor(Math.random() * max));
};

export const BarChart = () => {
  const dispatch = useAppDispatch();
  const reportData = useAppSelector((state: any) => state.reports.data);

  const dummyData = {
    labels: [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ],
    datasets: [
      {
        label: "Last 6 days",
        data: getRandomData(12, 100),
        backgroundColor: "rgba(20, 157, 82, 1)",
      },
      {
        label: "Last Week",
        data: getRandomData(12, 100),
        backgroundColor: "rgba(201, 203, 207, 0.5)",
      },
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchReports());
    };
    fetchData();
  }, [dispatch]);

  const fetchDataAndDownload = async () => {
    await dispatch(fetchReports());

    if (reportData) {
      exportToExcel(reportData);
    }
  };

  return (
    <div className="p-2">
      <div className="flex flex-col gap-20">
        <div className="font-poppins flex justify-end items-start">
          {/* <div>
            <div className="text-sm font-normal">Revenue</div>
            <div className="text-xl text-black font-medium tracking-widest">
              ETB 256,250
            </div>
            <div className="text-xs text-green-600">↑ 2.1% vs last week</div>
            <div className="text-xs text-secondary mt-4">
              Platform profit from 1-12 Dec, 2024
            </div>
          </div> */}
          <button
            className="rounded shadow-md px-2 py-1 text-sm bg-white w-32 text-primary focus:outline-none"
            onClick={fetchDataAndDownload}
          >
            View Report
          </button>
        </div>
        <div>
          <Bar
            data={dummyData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              aspectRatio: 1,
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                },
                y: {
                  ticks: {
                    display: false,
                  },
                  grid: {
                    display: false,
                  },
                },
              },
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
          />
        </div>
        <div className="flex justify-around mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div>Last 6 days</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div>Last Week</div>
          </div>
        </div>
      </div>
    </div>
  );
};
