import prisma from "../../app/config/db.config";

export async function createRoles() {
  try {
    await prisma.role.createMany({
      data: [
        {
          type: "super_admin",
          name: "Super Admin",
          description: "Super Admin",
          permissions: ["all"],
        },
        {
          type: "admin",
          name: "Admin",
          description: "Admin",
          permissions: ["user"],
        },
      ],
    });
  } catch (error) {
    console.log("Error seeding roles");
    console.log(error);
  }
}

createRoles().then(() => {
  console.log("Role seed finished successfully.");
});
