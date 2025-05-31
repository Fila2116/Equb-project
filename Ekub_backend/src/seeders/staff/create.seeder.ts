import prisma from "../../app/config/db.config";

import { Role } from "@prisma/client";
import { hashedString } from "../../app/utils/hashedText";
export async function createStaffs() {
  try {
    const hashedPassword = await hashedString("123456");
    const superAdminRole = (await prisma.role.findUnique({
      where: { name: "Super Admin" },
    })) as unknown as Role;
    const adminRole = (await prisma.role.findUnique({
      where: { name: "Admin" },
    })) as unknown as Role;
    const branch = await prisma.branch.findFirst({ where: { isMain: true } });
    await prisma.staff.createMany({
      data: [
        {
          firstName: "Super",
          lastName: "Admin",
          fullName: "Super Admin",
          email: "super@equb.com",
          phoneNumber: "+251983985116",
          password: hashedPassword,
          roleId: superAdminRole.id,
          isActive: true,
          branchId: branch?.id!,
        },
        {
          firstName: "Equb",
          lastName: "Admin",
          fullName: "Equb Admin",
          email: "admin@equb.com",
          phoneNumber: "+251929336352",
          password: hashedPassword,
          roleId: adminRole.id,
          isActive: true,
          branchId: branch?.id!,
        },
      ],
      skipDuplicates: true,
    });
  } catch (error) {
    console.log("Error seeding staffs");
    console.log(error);
  }
}

createStaffs().then(() => {
  console.log("Staff seed finished successfully.");
});
