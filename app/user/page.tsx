"use client"
import { GetFloorplanData } from "@/components/grondplan";
import { Button } from "@/components/ui/button";
import { getAllFloorPlans } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [allPlans, setAllPlans] = useState<GetFloorplanData[]>();

  const fetchFloorPlan = async () => {
      try {
        const allFloorPlanApiData = await getAllFloorPlans();

        if (allFloorPlanApiData?.data?.length) {
          setAllPlans(allFloorPlanApiData?.data as GetFloorplanData[]);
        }
      } catch (error) {
        console.error("❌ Error fetching floor plan:", error);
      }
  };

  useEffect(() => {
    fetchFloorPlan();
  }, [])

  const handleViewPlan = async (id: number) => {
    // pass user id
    router.push(`/user/${id}`);
  };

  return (
    <main className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Grondplan names list</h2>
      {allPlans?.length ? 
      <table className="table-auto w-full">
        <thead>
          <tr className="text-left border-solid border">
            <th className="p-4">Sr no.</th>
            <th className="p-4">Name</th>
            <th className="p-4">Action</th>
          </tr>
        </thead>
        <tbody>
            {allPlans?.map((el: GetFloorplanData, index: number) => (
              <tr key={el?.id || index} className="text-left border-solid border">
                <td className="p-3">{index + 1}</td>
                <td className="pl-3">grondplan-{el?.naam}</td>
                <td className="pl-3">
                  <Button onClick={() => handleViewPlan(el?.id)}>View</Button>
                </td>
              </tr>
            ))}

        </tbody>
      </table> : <h3 className="text-center font-bold">No plans available</h3>}
    </main>
  );
}
