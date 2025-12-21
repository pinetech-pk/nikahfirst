import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Valid lookup table names
const VALID_TABLES = [
  "origin",
  "ethnicity",
  "caste",
  "country",
  "stateProvince",
  "city",
  "sect",
  "maslak",
  "height",
  "educationLevel",
  "educationField",
  "incomeRange",
  "language",
] as const;

type LookupTable = (typeof VALID_TABLES)[number];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get("table") as LookupTable;
    const parentId = searchParams.get("parentId"); // For dependent dropdowns (e.g., cities by state)

    if (!table || !VALID_TABLES.includes(table)) {
      return NextResponse.json(
        { error: "Invalid table name" },
        { status: 400 }
      );
    }

    let data;

    switch (table) {
      case "origin":
        data = await prisma.origin.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            label: true,
            level1Label: true,
            level1LabelPlural: true,
            level2Label: true,
            level2LabelPlural: true,
            level2Enabled: true,
          },
        });
        // Map label to name for frontend consistency, include terminology
        data = data.map((item) => ({
          id: item.id,
          name: item.label,
          level1Label: item.level1Label,
          level1LabelPlural: item.level1LabelPlural,
          level2Label: item.level2Label,
          level2LabelPlural: item.level2LabelPlural,
          level2Enabled: item.level2Enabled,
        }));
        break;

      case "ethnicity":
        data = await prisma.ethnicity.findMany({
          where: {
            isActive: true,
            ...(parentId ? { originId: parentId } : {}),
          },
          orderBy: { sortOrder: "asc" },
          select: { id: true, label: true, originId: true },
        });
        data = data.map((item) => ({ id: item.id, name: item.label, originId: item.originId }));
        break;

      case "caste":
        data = await prisma.caste.findMany({
          where: {
            isActive: true,
            ...(parentId ? { ethnicityId: parentId } : {}),
          },
          orderBy: { sortOrder: "asc" },
          select: { id: true, label: true, ethnicityId: true },
        });
        data = data.map((item) => ({ id: item.id, name: item.label, ethnicityId: item.ethnicityId }));
        break;

      case "country":
        data = await prisma.country.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, code: true },
        });
        break;

      case "stateProvince":
        data = await prisma.stateProvince.findMany({
          where: {
            isActive: true,
            ...(parentId ? { countryId: parentId } : {}),
          },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, countryId: true },
        });
        break;

      case "city":
        data = await prisma.city.findMany({
          where: {
            isActive: true,
            ...(parentId ? { stateProvinceId: parentId } : {}),
          },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, stateProvinceId: true },
        });
        break;

      case "sect":
        data = await prisma.sect.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, label: true },
        });
        data = data.map((item) => ({ id: item.id, name: item.label }));
        break;

      case "maslak":
        data = await prisma.maslak.findMany({
          where: {
            isActive: true,
            ...(parentId ? { sectId: parentId } : {}),
          },
          orderBy: { sortOrder: "asc" },
          select: { id: true, label: true, sectId: true },
        });
        data = data.map((item) => ({ id: item.id, name: item.label, sectId: item.sectId }));
        break;

      case "height":
        data = await prisma.height.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, labelImperial: true, labelMetric: true, centimeters: true },
        });
        // Create a display string combining imperial and metric
        data = data.map((item) => ({
          id: item.id,
          display: `${item.labelImperial} (${item.labelMetric})`,
        }));
        break;

      case "educationLevel":
        data = await prisma.educationLevel.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, label: true },
        });
        data = data.map((item) => ({ id: item.id, name: item.label }));
        break;

      case "educationField":
        data = await prisma.educationField.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, label: true },
        });
        data = data.map((item) => ({ id: item.id, name: item.label }));
        break;

      case "incomeRange":
        data = await prisma.incomeRange.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, label: true, currency: true },
        });
        data = data.map((item) => ({
          id: item.id,
          display: item.label,
        }));
        break;

      case "language":
        data = await prisma.language.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, label: true },
        });
        data = data.map((item) => ({ id: item.id, name: item.label }));
        break;

      default:
        return NextResponse.json(
          { error: "Table not implemented" },
          { status: 400 }
        );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Lookup API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lookup data" },
      { status: 500 }
    );
  }
}
