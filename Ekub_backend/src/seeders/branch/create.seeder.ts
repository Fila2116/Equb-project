import prisma from "../../app/config/db.config";

export async function createBranches() {
  try {
    await prisma.branch.createMany({
      data: [
        {
          name: "Main Branch",
          city: "Addis Abeba",
          isMain: true,
        },
      ],
    });
  } catch (error) {
    console.log("Error seeding branches");
    console.log(error);
  }
}

createBranches().then(() => {
  console.log("Branch seed finished successfully.");
});
