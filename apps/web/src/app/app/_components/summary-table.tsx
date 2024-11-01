"use client";

import { generateDatesFromMonthBeginning } from "@/utils/generate-dates-from-month";
import dayjs from "dayjs";
import { CheckInDay } from "./check-in-day";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useAuthStore from "@/stores/auth-store";

const summaryDates = generateDatesFromMonthBeginning();

const minimumSummaryDatesSize = dayjs().daysInMonth();
const amountOfDaysToFill = minimumSummaryDatesSize - summaryDates.length;

interface CheckIn {
  id: number;
  id_user: number;
  createdAt: string;
  updatedAt: string;
}

async function getSummary(token: string): Promise<CheckIn[]> {
  const { data } = await axios.get("http://localhost:3001/checkin", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data.data;
}

export function SummaryTable() {
  const { getToken } = useAuthStore();
  const token = getToken();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["get-summary"],
    queryFn: () => getSummary(token!),
  });

  if (isLoading) return null;
  if (isError) return null;

  return (
    <div className="w-full flex">
      <div className="grid grid-rows-7 grid-flow-col gap-2 ">
        {summaryDates.map((date) => {
          const dayIsChecked = data!.some((checkin) => {
            return dayjs(checkin.createdAt).isSame(dayjs(date), "day");
          });

          return (
            <CheckInDay
              key={date.toString()}
              date={date}
              isChecked={dayIsChecked}
            />
          );
        })}

        {amountOfDaysToFill > 0 &&
          Array.from({ length: amountOfDaysToFill }).map((_, i) => {
            return (
              <div
                key={i}
                className="w-14 h-14 bg-zinc-400 border-2 border-zinc-400 opacity-40 cursor-not-allowed rounded-lg"
              />
            );
          })}
      </div>
    </div>
  );
}
