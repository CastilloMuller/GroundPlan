import { FloorplanData } from "@/components/grondplan";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function saveFloorPlan(userId: string, floorPlan: FloorplanData) {
  if (!userId) {
    console.error("User ID is required to store floor plan data.");
    return;
  }
  localStorage.setItem(userId, JSON.stringify(floorPlan));
}

export function getFloorPlanFromUrl(userId: string) {
  if (userId) {
    const storedData = localStorage.getItem(userId);
    return storedData ? JSON.parse(storedData) : null;
  }

  return null;
}

export function updateFloorPlan(userId: string, updatedFloorPlan: any) {
  let currentFloorPlan = getFloorPlanFromUrl(userId);

  if (currentFloorPlan) {
    // Save the updated object back to localStorage
    saveFloorPlan(userId, updatedFloorPlan);
  } else {
    console.warn("No floor plan found for this user.");
  }
}
