import { FloorplanData } from "@/components/grondplan";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { BASE_URL, GET_ALL_FLOOR_PLANS, GET_FLOOR_PLAN_BY_ID, SAVE_FLOOR_PLAN } from "./apis";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function saveFloorPlan(userId: string, floorPlan: FloorplanData) {
  try {
    const savePlanUrl = `${BASE_URL}${SAVE_FLOOR_PLAN}`;

    const response = await axios.post(savePlanUrl, floorPlan, {
      headers: { "Content-Type": "application/json" },
    });

    if (response?.data?.status === "success") {
      return response?.data;
    } else {
      console.error("❌ API Error:", response?.data);
      return null;
    }
  } catch (error) {
    console.error("❌ Error saving floor plan:", error);
    return null;
  }
}

export async function getFloorPlanFromUrl(userId: string) {
  try {
    const getPlanUrl = `${BASE_URL}${GET_FLOOR_PLAN_BY_ID}?id=${userId}`;
    const res = await axios.get(getPlanUrl, {
      headers: { "Content-Type": "application/json" },
    });

    if (res?.data?.status === "success") {
      return res?.data?.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching floor plan:", error);
    return null;
  }
}

export async function getAllFloorPlans() {
  try {
    const getPlanUrl = `${BASE_URL}${GET_ALL_FLOOR_PLANS}`;
    const res = await axios.get(getPlanUrl, {
      headers: { "Content-Type": "application/json" },
    });

    if (res?.data?.status === "success") {
      return res?.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("❌ Error saving floor plan:", error);
    return null;
  }
}

export async function updateFloorPlan(userId: string, updatedFloorPlan: any, router: AppRouterInstance) {
  const updatedPlan = await saveFloorPlan(userId, updatedFloorPlan);
  if (updatedPlan) {
    router.push(`/user/${updatedPlan?.last_insert_id}`);
  }
}
