import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Attendance, INITIAL_DATA } from "./mockData";

interface AttendanceContextType {
  attendances: Attendance[];
  addAttendance: (attendance: Attendance) => void;
  updateAttendance: (id: string, updatedData: Partial<Attendance>) => void;
  deleteAttendance: (id: string) => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined,
);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [attendances, setAttendances] = useState<Attendance[]>(() => {
    const saved = localStorage.getItem("@aura:attendances");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem("@aura:attendances", JSON.stringify(attendances));
  }, [attendances]);

  const addAttendance = (attendance: Attendance) => {
    setAttendances((prev) => [attendance, ...prev]);
  };

  const updateAttendance = (id: string, updatedData: Partial<Attendance>) => {
    setAttendances((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item)),
    );
  };

  const deleteAttendance = (id: string) => {
    setAttendances((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <AttendanceContext.Provider
      value={{ attendances, addAttendance, updateAttendance, deleteAttendance }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context)
    throw new Error(
      "useAttendance deve ser usado dentro de um AttendanceProvider",
    );
  return context;
}
