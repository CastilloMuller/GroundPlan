"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getFloorPlanFromUrl, saveFloorPlan, updateFloorPlan } from '@/lib/utils';
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  type: 'Sectionaaldeur' | 'Loopdeur' | 'Raamkozijn';
  naam: string;
  breedte: number;
  afstandNaarLinks: number;
};

type Side = 'A' | 'B' | 'C' | 'D';

export type FloorplanData = {
  naam: string;
  breedte: number;
  lengte: number;
  breedteStaalstructuur: number;
  items: Record<Side, Item[]>;
};

export type GetFloorplanData = {
  naam: string;
  breedte: number;
  lengte: number;
  breedteStaalstructuur: number;
  items: Record<Side, Item[]>;
  id: number;
};

const defaultFloorplan: FloorplanData = {
  naam: 'Nieuwe Grondplan',
  breedte: 8000,
  lengte: 12000,
  breedteStaalstructuur: 200,
  items: {
    A: [],
    B: [],
    C: [],
    D: [],
  },
};

const itemDefaults = {
  Sectionaaldeur: { breedte: 3000, diepte: 300 },
  Loopdeur: { breedte: 1000, diepte: 250 },
  Raamkozijn: { breedte: 2000, diepte: 250 },
};

export default function Grondplan({ initialFloorplan = defaultFloorplan, userId }: { initialFloorplan?: FloorplanData, userId?: string }) {
  const router = useRouter();
  const [floorplan, setFloorplan] = useState<FloorplanData>(initialFloorplan);
  const [scale, setScale] = useState(1);
  const [selectedSide, setSelectedSide] = useState<Side>('A');
  const [newItemType, setNewItemType] = useState<'Sectionaaldeur' | 'Loopdeur' | 'Raamkozijn'>('Sectionaaldeur');
  const [newItemName, setNewItemName] = useState('');
  const [newItemWidth, setNewItemWidth] = useState(itemDefaults.Sectionaaldeur.breedte);
  const [newItemDistance, setNewItemDistance] = useState(0);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const padding = 3000;
  const svgWidth = floorplan?.breedte + padding * 2;
  const svgHeight = floorplan?.lengte + padding * 2;
  const userIdFromParam = userId ?? '';

  useEffect(() => {
    const containerWidth = window.innerWidth * 0.9;
    const containerHeight = window.innerHeight * 0.8;
    const scaleX = containerWidth / svgWidth;
    const scaleY = containerHeight / svgHeight;
    setScale(Math.min(scaleX, scaleY, 1));
  }, [floorplan?.breedte, floorplan?.lengte, svgWidth, svgHeight]);

  const scaledWidth = svgWidth * scale;
  const scaledHeight = svgHeight * scale;

  const drawItem = (item: Item, side: Side) => {
    const itemColor = item.type === 'Sectionaaldeur' ? 'blue' : item.type === 'Loopdeur' ? 'red' : 'green';
    const itemDepth = itemDefaults[item.type].diepte;
    let x, y, width, height;

    switch (side) {
      case 'C':
        x = padding;
        y = padding + item.afstandNaarLinks;
        width = itemDepth;
        height = item.breedte;
        break;
      case 'B':
        x = svgWidth - padding - itemDepth;
        y = padding + item.afstandNaarLinks;
        width = itemDepth;
        height = item.breedte;
        break;
      case 'A':
        x = padding + item.afstandNaarLinks;
        y = padding;
        width = item.breedte;
        height = itemDepth;
        break;
      case 'D':
        x = padding + item.afstandNaarLinks;
        y = svgHeight - padding - itemDepth;
        width = item.breedte;
        height = itemDepth;
        break;
    }

    return (
      <g key={`${side}-${item.id}`}>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="none"
          stroke={itemColor}
          strokeWidth="60"
        />
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={240}
          fill={itemColor}
        >
          {item.naam}
        </text>
      </g>
    );
  };

  const drawMeasurementLines = (side: Side) => {
    const items = floorplan?.items?.[side];
    if (items?.length === 0) return null;

    const measurementLines = items?.map((item, index) => {
      const itemColor = item?.type === 'Sectionaaldeur' ? 'blue' : item?.type === 'Loopdeur' ? 'red' : 'green';
      const offset = (index + 1) * 600;
      let lineX1, lineY1, lineX2, lineY2, textX, textY;
      let leftDistance, rightDistance;

      switch (side) {
        case 'A':
          lineX1 = padding;
          lineX2 = padding + floorplan?.breedte;
          lineY1 = lineY2 = padding - offset;
          textX = padding + floorplan?.breedte / 2;
          textY = lineY1 - 150;
          leftDistance = item?.afstandNaarLinks;
          rightDistance = floorplan?.breedte - item?.afstandNaarLinks - item?.breedte;
          break;
        case 'B':
          lineX1 = lineX2 = svgWidth - padding + offset;
          lineY1 = padding;
          lineY2 = padding + floorplan?.lengte;
          textX = lineX1 + 150;
          textY = padding + floorplan?.lengte / 2;
          leftDistance = item?.afstandNaarLinks;
          rightDistance = floorplan?.lengte - item?.afstandNaarLinks - item?.breedte;
          break;
        case 'C':
          lineX1 = lineX2 = padding - offset;
          lineY1 = padding;
          lineY2 = padding + floorplan?.lengte;
          textX = lineX1 - 150;
          textY = padding + floorplan?.lengte / 2;
          leftDistance = item?.afstandNaarLinks;
          rightDistance = floorplan?.lengte - item?.afstandNaarLinks - item?.breedte;
          break;
        case 'D':
          lineX1 = padding;
          lineX2 = padding + floorplan?.breedte;
          lineY1 = lineY2 = svgHeight - padding + offset;
          textX = padding + floorplan?.breedte / 2;
          textY = lineY1 + 300;
          leftDistance = item?.afstandNaarLinks;
          rightDistance = floorplan?.breedte - item?.afstandNaarLinks - item?.breedte;
          break;
      }

      return (
        <g key={`measurement-${side}-${item.id}`}>
          <line x1={lineX1} y1={lineY1} x2={lineX2} y2={lineY2} stroke={itemColor} strokeWidth="20" />
          <line x1={lineX1} y1={lineY1} x2={lineX1} y2={lineY1 + (side === 'A' || side === 'D' ? 300 : 0)} stroke={itemColor} strokeWidth="20" />
          <line x1={lineX2} y1={lineY2} x2={lineX2} y2={lineY2 + (side === 'A' || side === 'D' ? 300 : 0)} stroke={itemColor} strokeWidth="20" />

          {/* Add short vertical lines at item boundaries */}
          <line
            x1={side === 'A' || side === 'D' ? lineX1 + leftDistance : lineX1}
            y1={side === 'A' || side === 'D' ? lineY1 : lineY1 + leftDistance}
            x2={side === 'A' || side === 'D' ? lineX1 + leftDistance : lineX1 + (side === 'C' ? 300 : -300)}
            y2={side === 'A' || side === 'D' ? lineY1 + (side === 'A' ? 300 : -300) : lineY1 + leftDistance}
            stroke={itemColor}
            strokeWidth="20"
          />
          <line
            x1={side === 'A' || side === 'D' ? lineX1 + leftDistance + item?.breedte : lineX1}
            y1={side === 'A' || side === 'D' ? lineY1 : lineY1 + leftDistance + item?.breedte}
            x2={side === 'A' || side === 'D' ? lineX1 + leftDistance + item?.breedte : lineX1 + (side === 'C' ? 300 : -300)}
            y2={side === 'A' || side === 'D' ? lineY1 + (side === 'A' ? 300 : -300) : lineY1 + leftDistance + item?.breedte}
            stroke={itemColor}
            strokeWidth="20"
          />

          {/* Left distance */}
          <text
            x={side === 'A' || side === 'D' ? lineX1 + leftDistance / 2 : (side === 'C' ? lineX1 + 150 : lineX1 - 150)}
            y={side === 'A' || side === 'D' ? (side === 'A' ? lineY1 + 150 : lineY1 - 150) : lineY1 + leftDistance / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={240}
            fill={itemColor}
            transform={side === 'B' || side === 'C' ? `rotate(-90, ${side === 'C' ? lineX1 + 150 : lineX1 - 150}, ${lineY1 + leftDistance / 2})` : ''}
          >
            {leftDistance}
          </text>

          {/* Item width */}
          <text
            x={side === 'A' || side === 'D' ? lineX1 + leftDistance + item?.breedte / 2 : (side === 'C' ? lineX1 + 150 : lineX1 - 150)}
            y={side === 'A' || side === 'D' ? (side === 'A' ? lineY1 - 150 : lineY1 + 300) : lineY1 + leftDistance + item?.breedte / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={300}
            fill={itemColor}
            transform={side === 'B' || side === 'C' ? `rotate(-90, ${side === 'C' ? lineX1 + 150 : lineX1 - 150}, ${lineY1 + leftDistance + item?.breedte / 2})` : ''}
          >
            {item.breedte}
          </text>

          {/* Right distance */}
          <text
            x={side === 'A' || side === 'D' ? lineX2 - rightDistance / 2 : (side === 'C' ? lineX1 + 150 : lineX1 - 150)}
            y={side === 'A' || side === 'D' ? (side === 'A' ? lineY1 + 150 : lineY1 - 150) : lineY2 - rightDistance / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={240}
            fill={itemColor}
            transform={side === 'B' || side === 'C' ? `rotate(-90, ${side === 'C' ? lineX1 + 150 : lineX1 - 150}, ${lineY2 - rightDistance / 2})` : ''}
          >
            {rightDistance}
          </text>
        </g>
      );
    });

    return (
      <g key={`measurements-${side}`}>
        {measurementLines}
      </g>
    );
  };

  const handleAddItem = () => {
    const newItem: Item = {
      id: Date.now().toString(),
      type: newItemType,
      naam: newItemName,
      breedte: newItemWidth,
      afstandNaarLinks: newItemDistance,
    };

    const floorPlan = {...floorplan, items: {
      ...floorplan?.items, [selectedSide]: [...floorplan?.items?.[selectedSide], newItem]
    }};
    setFloorplan(floorPlan);

    // Reset form
    setNewItemName('');
    setNewItemWidth(itemDefaults[newItemType]?.breedte);
    setNewItemDistance(0);
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setNewItemType(item?.type);
    setNewItemName(item?.naam);
    setNewItemWidth(item?.breedte);
    setNewItemDistance(item?.afstandNaarLinks);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;

    const updatedItem: Item = {
      ...editingItem,
      type: newItemType,
      naam: newItemName,
      breedte: newItemWidth,
      afstandNaarLinks: newItemDistance,
    };

    const updatedFloorPlan = {...floorplan, items: {
      ...floorplan?.items, [selectedSide]: floorplan?.items?.[selectedSide]?.map(item =>
        item?.id === editingItem?.id ? updatedItem : item
      ),
    }};
    setFloorplan(updatedFloorPlan);

    setEditingItem(null);
    setNewItemName('');
    setNewItemWidth(itemDefaults[newItemType]?.breedte);
    setNewItemDistance(0);
  };

  const handleSaveData = () => {
    updateFloorPlan(userIdFromParam, floorplan, router);
  };

  useEffect(() => {
    const fetchFloorPlan = async () => {
      if (userIdFromParam) {
        try {
          const floorPlanApiData = await getFloorPlanFromUrl(userIdFromParam);

          if (floorPlanApiData) {
            setFloorplan(floorPlanApiData?.[0] as FloorplanData);
          }
        } catch (error) {
          console.error("❌ Error fetching floor plan:", error);
        }
      }
    };
  
    fetchFloorPlan();
  }, [userIdFromParam]);
  
  const handleDeleteItem = (itemId: string, side: Side) => {
    const floorPlan = {...floorplan, items: {
      ...floorplan?.items, [side]: floorplan?.items?.[side]?.filter(item => item?.id !== itemId)
    }};
    setFloorplan(floorPlan);
    updateFloorPlan(userIdFromParam, floorPlan, router);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 grid grid-cols-2 gap-4 p-4 bg-white rounded-lg shadow-md w-full max-w-2xl">
        <div>
          <Label htmlFor="naam" className="text-sm font-medium text-gray-700">Naam</Label>
          <Input
            id="naam"
            value={floorplan?.naam}
            onChange={(e) => {
              const updatedFloorPlan = { ...floorplan, naam: e?.target?.value };
              setFloorplan(updatedFloorPlan)
            }}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="breedte" className="text-sm font-medium text-gray-700">Breedte (mm)</Label>
          <Input
            id="breedte"
            type="number"
            value={floorplan?.breedte}
            onChange={(e) => {
              const updatedFloorPlan = { ...floorplan, breedte: Number(e?.target?.value) };
              setFloorplan(updatedFloorPlan);
            }}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="lengte" className="text-sm font-medium text-gray-700">Lengte (mm)</Label>
          <Input
            id="lengte"
            type="number"
            value={floorplan?.lengte}
            onChange={(e) => {
              const updatedFloorPlan = { ...floorplan, lengte: Number(e?.target?.value) };
              setFloorplan(updatedFloorPlan);
            }}
            className="mt-1"
            />
        </div>
        <div>
          <Label htmlFor="breedteStaalstructuur" className="text-sm font-medium text-gray-700">Breedte staalstructuur (mm)</Label>
          <Input
            id="breedteStaalstructuur"
            type="number"
            value={floorplan?.breedteStaalstructuur}
            onChange={(e) => {
              const updatedFloorPlan = { ...floorplan, breedteStaalstructuur: Number(e?.target?.value)};
              setFloorplan(updatedFloorPlan);
            }}
            className="mt-1"
          />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 p-4 bg-white rounded-lg shadow-md w-full max-w-2xl">
        <div>
          <Label htmlFor="side" className="text-sm font-medium text-gray-700">Zijde</Label>
          <Select value={selectedSide} onValueChange={(value: Side) => setSelectedSide(value)}>
            <SelectTrigger id="side">
              <SelectValue placeholder="Selecteer een zijde" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">A (Voor)</SelectItem>
              <SelectItem value="B">B (Links)</SelectItem>
              <SelectItem value="C">C (Rechts)</SelectItem>
              <SelectItem value="D">D (Achter)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="itemType" className="text-sm font-medium text-gray-700">Type item</Label>
          <Select value={newItemType} onValueChange={(value: 'Sectionaaldeur' | 'Loopdeur' | 'Raamkozijn') => setNewItemType(value)}>
            <SelectTrigger id="itemType">
              <SelectValue placeholder="Selecteer een type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sectionaaldeur">Sectionaaldeur</SelectItem>
              <SelectItem value="Loopdeur">Loopdeur</SelectItem>
              <SelectItem value="Raamkozijn">Raamkozijn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="itemName" className="text-sm font-medium text-gray-700">Naam item</Label>
          <Input
            id="itemName"
            value={newItemName}
            onChange={(e) => setNewItemName(e?.target?.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="itemWidth" className="text-sm font-medium text-gray-700">Breedte item (mm)</Label>
          <Input
            id="itemWidth"
            type="number"
            value={newItemWidth}
            onChange={(e) => setNewItemWidth(Number(e?.target?.value))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="itemDistance" className="text-sm font-medium text-gray-700">
            Afstand naar {selectedSide === 'A' ? 'rechts' : selectedSide === 'D' ? 'links' : 'boven'} (mm)
          </Label>
          <Input
            id="itemDistance"
            type="number"
            value={newItemDistance}
            onChange={(e) => setNewItemDistance(Number(e?.target?.value))}
            className="mt-1"
          />
        </div>
        <div className="col-span-2">
          <Button onClick={editingItem ? handleUpdateItem : handleAddItem} className="w-full mt-2">
            {editingItem ? 'Update item' : 'Voeg item toe'}
          </Button>
        </div>
        <div className="col-span-2">
          <Button onClick={handleSaveData} className="w-full mt-2">
            Save Data
          </Button>
        </div>
      </div>

      <Table className="mb-4 w-full max-w-2xl">
        <TableHeader>
          <TableRow>
            <TableHead>Naam</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Breedte</TableHead>
            <TableHead>Afstand</TableHead>
            <TableHead>Acties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {floorplan?.items &&
            (Object.keys(floorplan.items) as Side[])?.map((side) =>
              floorplan.items?.[side]?.map((item) => (
                <TableRow key={item?.id}>
                  <TableCell>{item?.naam}</TableCell>
                  <TableCell>{item?.type}</TableCell>
                  <TableCell>{item?.breedte}</TableCell>
                  <TableCell>{item?.afstandNaarLinks}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEditItem(item)} className="mr-2">
                      Bewerk
                    </Button>
                    <Button onClick={() => handleDeleteItem(item?.id, side)} variant="destructive">
                      Verwijder
                    </Button>
                  </TableCell>
                </TableRow>
              )
            )
          )}
        </TableBody>
      </Table>

      <svg
        width={scaledWidth}
        height={scaledHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="border border-gray-300 bg-white"
      >
        {/* Outer structure */}
        <rect
          x={padding}
          y={padding}
          width={floorplan?.breedte}
          height={floorplan?.lengte}
          fill="none"
          stroke="black"
          strokeWidth="60"
        />

        {/* Width and length labels with arrowed lines */}
        <g>
          {/* Width arrow and label */}
          <line
            x1={padding}
            y1={padding + floorplan?.lengte * 0.75}
            x2={padding + floorplan?.breedte}
            y2={padding + floorplan?.lengte * 0.75}
            stroke="black"
            strokeWidth="10"
            markerEnd="url(#arrowhead)"
          />
          <text
            x={padding + floorplan?.breedte / 2}
            y={padding + floorplan?.lengte * 0.75 - 150}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={360}
            fill="black"
          >
            {`${floorplan?.breedte} mm`}
          </text>
        </g>
        <g>
          {/* Length arrow and label */}
          <line
            x1={padding + floorplan?.breedte * 0.25}
            y1={padding}
            x2={padding + floorplan?.breedte * 0.25}
            y2={padding + floorplan?.lengte}
            stroke="black"
            strokeWidth="10"
            markerEnd="url(#arrowhead)"
          />
          <text
            x={padding + floorplan?.breedte * 0.25 - 150}
            y={padding + floorplan?.lengte / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={360}
            fill="black"
            transform={`rotate(-90, ${padding + floorplan?.breedte * 0.25 - 150}, ${padding + floorplan?.lengte / 2})`}
          >
            {`${floorplan?.lengte} mm`}
          </text>
        </g>

        {/* Naam label in the center */}
        <text
          x={padding + floorplan?.breedte / 2}
          y={padding + floorplan?.lengte / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={480}
          fill="black"
        >
          {floorplan?.naam}
        </text>

        {/* Arrowhead definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="0"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="black" />
          </marker>
        </defs>

        {/* Side labels */}
        <text
          x={padding + floorplan?.breedte / 2}
          y={padding + floorplan?.breedteStaalstructuur + 100}
          textAnchor="middle"
          dominantBaseline="hanging"
          fontSize={360}
          fill="black"
        >
          A
        </text>
        <text
          x={svgWidth - padding - floorplan?.breedteStaalstructuur - 100}
          y={padding + floorplan?.lengte / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={360}
          fill="black"
          transform={`rotate(0, ${svgWidth - padding - floorplan?.breedteStaalstructuur - 100}, ${padding + floorplan?.lengte / 2})`}
        >
          B
        </text>
        <text
          x={padding + floorplan?.breedteStaalstructuur + 100}
          y={padding + floorplan?.lengte / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={360}
          fill="black"
          transform={`rotate(0, ${padding + floorplan?.breedteStaalstructuur + 100}, ${padding + floorplan?.lengte / 2})`}
        >
          C
        </text>
        <text
          x={padding + floorplan?.breedte / 2}
          y={svgHeight - padding - floorplan?.breedteStaalstructuur - 100}
          textAnchor="middle"
          dominantBaseline="alphabetic"
          fontSize={360}
          fill="black"
        >
          D
        </text>

        {/* Draw items */}
        {Object.entries(floorplan?.items ?? {}).map(([side, items]) =>
          items?.map(item => drawItem(item, side as Side))
        )}

        {/* Draw measurement lines */}
        {(['A', 'B', 'C', 'D'] as Side[]).map(side => drawMeasurementLines(side))}
      </svg>
    </div>
  );
}

