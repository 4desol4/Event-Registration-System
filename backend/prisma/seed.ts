import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // --- Sample event ---
  const event = await prisma.event.create({
    data: {
      name: "RCCG New Dawn Parish — Youth Sunday 2026",
      date: new Date("2026-06-21T09:00:00Z"),
      status: "live",
    },
  });

  // --- Sample form with a realistic field set ---
  const form = await prisma.form.create({
    data: {
      eventId: event.id,
      title: "Youth Sunday 2026 Registration",
      description:
        "Register your attendance for Youth Sunday — AI & Digital Skills theme.",
      status: "draft",
    },
  });

  const fields: {
    label: string;
    type: "text" | "phone" | "email" | "select";
    required: boolean;
    order: number;
    options?: string[];
    validation?: { pattern: string; errorMessage: string };
  }[] = [
    { label: "Full Name", type: "text", required: true, order: 0 },
    {
      label: "Phone Number",
      type: "phone",
      required: true,
      order: 1,
      validation: {
        pattern: "^[0-9]{11}$",
        errorMessage: "Enter a valid 11-digit phone number",
      },
    },
    {
      label: "Email Address",
      type: "email",
      required: false,
      order: 2,
      validation: {
        pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        errorMessage: "Enter a valid email address",
      },
    },
    {
      label: "Gender",
      type: "select",
      required: true,
      order: 3,
      options: ["Male", "Female"],
    },
    {
      label: "Age Bracket",
      type: "select",
      required: true,
      order: 4,
      options: ["Under 18", "18-25", "26-35", "36+"],
    },
  ];

  for (const f of fields) {
    await prisma.formField.create({
      data: { ...f, formId: form.id },
    });
  }

  // --- First Super Admin account ---
  // IMPORTANT: change this password immediately after first login in production.
  const passwordHash = await bcrypt.hash("ChangeMe123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@moe-ict.ng" },
    update: {},
    create: {
      name: "ICT Unit Super Admin",
      email: "admin@moe-ict.ng",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  // --- Sample Admin and Staff accounts for development/testing ---
  const adminHash = await bcrypt.hash("AdminPass123!", 10);
  await prisma.user.upsert({
    where: { email: "manager@moe-ict.ng" },
    update: {},
    create: {
      name: "Event Manager",
      email: "manager@moe-ict.ng",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const staffHash = await bcrypt.hash("StaffPass123!", 10);
  await prisma.user.upsert({
    where: { email: "staff1@moe-ict.ng" },
    update: {},
    create: {
      name: "Jane Staff",
      email: "staff1@moe-ict.ng",
      passwordHash: staffHash,
      role: "STAFF",
    },
  });

  console.log("Seed complete.");
  console.log(`Event ID:  ${event.id}`);
  console.log(`Form ID:   ${form.id}`);
  console.log(
    `Super Admin login: admin@moe-ict.ng / ChangeMe123!  (change this password immediately)`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
