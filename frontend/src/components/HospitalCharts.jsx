import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function HospitalCharts({ counts }) {
  const activityData = [
    {
      name: "Patients",
      value: counts.patients,
    },
    {
      name: "Doctors",
      value: counts.doctors,
    },
    {
      name: "Staff",
      value: counts.staff,
    },
    {
      name: "Appointments",
      value: counts.appointments,
    },
    {
      name: "Admissions",
      value: counts.admissions,
    },
  ];

  const moduleData = [
    {
      name: "Departments",
      value: counts.departments,
    },
    {
      name: "Pharmacy",
      value: counts.pharmacy,
    },
    {
      name: "Laboratory",
      value: counts.laboratory,
    },
    {
      name: "Inventory",
      value: counts.inventory,
    },
  ];

  const pieData = [
    {
      name: "Patients",
      value: counts.patients,
    },
    {
      name: "Doctors",
      value: counts.doctors,
    },
    {
      name: "Staff",
      value: counts.staff,
    },
  ];

  const colors = ["#2563eb", "#7c3aed", "#16a34a"];

  return (
    <section className="hospital-charts">

      <div className="chart-card">

        <div className="chart-header">
          <div>
            <h3>Hospital Activity</h3>
            <p>Overview of hospital records</p>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={activityData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
              />

              <XAxis dataKey="name" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="value"
                name="Total"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>


      <div className="chart-card">

        <div className="chart-header">
          <div>
            <h3>Hospital Modules</h3>
            <p>Records across hospital modules</p>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={moduleData}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
              />

              <XAxis dataKey="name" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Bar
                dataKey="value"
                name="Records"
                fill="#16a34a"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>


      <div className="chart-card">

        <div className="chart-header">
          <div>
            <h3>Hospital Distribution</h3>
            <p>Patients, doctors and staff</p>
          </div>
        </div>

        <div className="chart-container pie-container">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>

              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >

                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index]}
                  />
                ))}

              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>


      <div className="chart-card">

        <div className="chart-header">
          <div>
            <h3>Hospital Overview</h3>
            <p>Patients, appointments and admissions</p>
          </div>
        </div>

        <div className="chart-container">

          <ResponsiveContainer width="100%" height={320}>

            <LineChart data={[
              {
                name: "Patients",
                value: counts.patients,
              },
              {
                name: "Appointments",
                value: counts.appointments,
              },
              {
                name: "Admissions",
                value: counts.admissions,
              },
            ]}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
              />

              <XAxis dataKey="name" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="value"
                name="Count"
                stroke="#7c3aed"
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: "#7c3aed",
                }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>

    </section>
  );
}

export default HospitalCharts;
