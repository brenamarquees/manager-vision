"use client"

import { Bar, Line, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

interface ChartProps {
  data: any[]
  categories?: string[]
  index: string
  colors?: string[]
  valueFormatter?: (value: number) => string
  height?: number
}

export function BarChart({
  data,
  categories = [],
  index,
  colors = [],
  valueFormatter = (value) => `${value}`,
  height = 400,
}: ChartProps) {
  const labels = data.map((item) => item[index])

  const datasets = categories.map((category, i) => ({
    label: category.charAt(0).toUpperCase() + category.slice(1),
    data: data.map((item) => item[category]),
    backgroundColor: colors[i] || `hsl(${i * 50}, 70%, 50%)`,
    borderColor: colors[i] || `hsl(${i * 50}, 70%, 50%)`,
    borderWidth: 1,
  }))

  const chartData = {
    labels,
    datasets,
  }

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || ""
            const value = context.parsed.y
            return `${label}: ${valueFormatter(value)}`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => valueFormatter(value as number),
        },
      },
    },
  }

  return <Bar data={chartData} options={options} height={height} />
}

export function LineChart({
  data,
  categories = [],
  index,
  colors = [],
  valueFormatter = (value) => `${value}`,
  height = 400,
}: ChartProps) {
  const labels = data.map((item) => item[index])

  const datasets = categories.map((category, i) => ({
    label: category.charAt(0).toUpperCase() + category.slice(1),
    data: data.map((item) => item[category]),
    borderColor: colors[i] || `hsl(${i * 50}, 70%, 50%)`,
    backgroundColor: colors[i] ? `${colors[i]}33` : `hsla(${i * 50}, 70%, 50%, 0.2)`,
    tension: 0.3,
  }))

  const chartData = {
    labels,
    datasets,
  }

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || ""
            const value = context.parsed.y
            return `${label}: ${valueFormatter(value)}`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => valueFormatter(value as number),
        },
      },
    },
  }

  return <Line data={chartData} options={options} height={height} />
}

export function PieChart({ data, index, valueFormatter = (value) => `${value}`, height = 400 }: ChartProps) {
  const chartData = {
    labels: data.map((item) => item[index]),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: data.map((_, i) => `hsl(${i * 50}, 70%, 50%)`),
        borderColor: data.map((_, i) => `hsl(${i * 50}, 70%, 50%)`),
        borderWidth: 1,
      },
    ],
  }

  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ""
            const value = context.parsed
            return `${label}: ${valueFormatter(value)}`
          },
        },
      },
    },
  }

  return <Pie data={chartData} options={options} height={height} />
}

