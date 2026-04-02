import { useMemo } from "react";
import { Link } from "react-router";
import { ArrowLeft, TrendingUp, DollarSign, Award } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAttendance } from "../store/AttendanceContext";
import { MetricCard } from "../components/MetricCard";

export function Reports() {
  const { attendances } = useAttendance();

  const chartData = useMemo(() => {
    const salesData = attendances
      .filter((item) => item.status === "Venda concretizada" && item.value)
      .reduce(
        (acc, item) => {
          acc[item.salesperson] =
            (acc[item.salesperson] || 0) + (item.value || 0);
          return acc;
        },
        {} as Record<string, number>,
      );

    return Object.entries(salesData)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [attendances]);

  const totalSales = chartData.reduce((acc, curr) => acc + curr.total, 0);
  const topSeller = chartData.length > 0 ? chartData[0] : null;

  const colors = ["#171717", "#404040", "#737373", "#a3a3a3", "#d4d4d4"];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              to="/"
              className="p-1.5 -ml-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Voltar"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-2xl font-serif text-neutral-900 font-medium tracking-tight">
              Relatório de Vendas
            </h1>
          </div>
          <p className="text-sm text-neutral-500">
            Desempenho da equipe de vendas no período.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total em Vendas"
          value={new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(totalSales)}
          icon={<DollarSign size={20} />}
        />
        <MetricCard
          title="Top Vendedor"
          value={topSeller ? topSeller.name : "N/A"}
          subtitle={
            topSeller
              ? new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(topSeller.total)
              : undefined
          }
          icon={<Award size={20} />}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <MetricCard
          title="Ticket Médio"
          value={
            chartData.length > 0
              ? new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(
                  totalSales /
                    attendances.filter((i) => i.status === "Venda concretizada")
                      .length,
                )
              : "R$ 0,00"
          }
          icon={<TrendingUp size={20} />}
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-6 flex items-center gap-2">
          Vendas por Vendedor
        </h3>

        {chartData.length > 0 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e5e5"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#737373", fontSize: 13 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#737373", fontSize: 13 }}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 0,
                    }).format(value)
                  }
                  width={90}
                />
                <Tooltip
                  cursor={{ fill: "#f5f5f5" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    border: "1px solid #e5e5e5",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: any) => [
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(value) || 0),
                    "Vendas",
                  ]}
                  labelStyle={{
                    color: "#171717",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-neutral-500">
            <DollarSign size={32} className="text-neutral-300 mb-3" />
            <p>Nenhuma venda registrada ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
