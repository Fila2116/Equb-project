import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const currentDate = new Date();
const currentYear = currentDate.getFullYear();

interface PiechartProps {
  active: number | undefined;
  registering: number | undefined;
  closed: number | undefined;
}
export function Piechart({ active, registering, closed }: PiechartProps) {
  // console.log("running", running);
  // console.log("closed", closed);
  // console.log("registering", registering);

  const [activeTab, setActiveTab] = useState<
    "AllEqubs" | "Registering" | "users"
  >("AllEqubs");
  // const [selectedAgent, setSelectedAgent] = useState('Bole Agent');

  const dummyData = {
    AllEqubs: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
    },
    Registering: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      data: [5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115],
    },
    users: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      data: [2, 12, 22, 32, 42, 52, 62, 72, 82, 92, 102, 112],
    },
    status: {
      labels: ["Active", "Registering", "Closed"],
      data: [active, registering, closed],
    },
  };

  // console.log("un used stats", stats);
  const [doughnutData] = useState({
    labels: dummyData.status.labels,
    datasets: [
      {
        data: dummyData.status.data,
        backgroundColor: [
          "rgba(20, 157, 82, 1)",
          "rgba(75, 155, 65, 0.5)",
          "rgba(75, 155, 65, 0.4)",
        ],
        borderColor: [
          "rgba(20, 157, 82, 1)",
          "rgba(75, 155, 65, 0.5)",
          "rgba(75, 155, 65, 0.4)",
        ],
        borderWidth: 0.5,
      },
    ],
  });
  return (
    <div className="p-4">
      <div className="font-poppins flex flex-col gap-2">
        <div className="text-xs flex justify-between items-center">
          <div
            className={`cursor-pointer ${
              activeTab === "AllEqubs" ? "font-semibold" : "text-secondary"
            }`}
            onClick={() => setActiveTab("AllEqubs")}
          >
            All Equbs
          </div>
          {/* <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="shadow-md bg-white text-primary w-32 rounded px-2 py-1 text-sm focus:outline-none"
          >
            <option value="Bole Agent">Bole Agent</option>
            <option value="Piasa Agent">Piasa Agent</option>
            <option value="Kera Agent">Kera Agent</option>
          </select> */}
        </div>
        <div className="text-xs mb-2">From 1-6 Dec, {currentYear}</div>
        <div className="flex">
          <div>
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                cutout: "75%",
                radius: "70%",
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
            <div className="flex justify-around mt-2">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <div className="text-sm">Active</div>
                </div>
                <div className="text-sm">{active} %</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary bg-opacity-50 rounded-full"></div>
                  <div className="text-sm">Registering</div>
                </div>
                <div className="text-sm">{registering} %</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary bg-opacity-50 rounded-full"></div>
                  <div className="text-sm">Closed</div>
                </div>
                <div className="text-sm">{closed} %</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
