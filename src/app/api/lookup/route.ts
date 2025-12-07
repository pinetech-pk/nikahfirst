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
          select: { id: true, name: true },
        });
        break;

      case "ethnicity":
        data = await prisma.ethnicity.findMany({
          where: {
            isActive: true,
            ...(parentId ? { originId: parentId } : {}),
          },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, originId: true },
        });
        break;

      case "caste":
        data = await prisma.caste.findMany({
          where: {
            isActive: true,
            ...(parentId ? { ethnicityId: parentId } : {}),
          },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, ethnicityId: true },
        });
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
          select: { id: true, name: true },
        });
        break;

      case "maslak":
        data = await prisma.maslak.findMany({
          where: {
            isActive: true,
            ...(parentId ? { sectId: parentId } : {}),
          },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, sectId: true },
        });
        break;

      case "height":
        data = await prisma.height.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, cm: true, feet: true, inches: true, display: true },
        });
        break;

      case "educationLevel":
        data = await prisma.educationLevel.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true },
        });
        break;

      case "educationField":
        data = await prisma.educationField.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true },
        });
        break;

      case "incomeRange":
        data = await prisma.incomeRange.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, minAmount: true, maxAmount: true, currency: true, display: true },
        });
        break;

      case "language":
        data = await prisma.language.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true },
        });
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
