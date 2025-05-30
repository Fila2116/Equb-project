import prisma from "../../app/config/db.config";

export async function createEqubCategories() {
  try {
    await prisma.equbCategory.createMany({
      data: [
        {
          order: 2,
          name: "Special Finance",
          description: "Special Finance Equb",
          needsRequest: true,
          hasReason: true,
          isSaving: false,
        },
        {
          name: "Finance",
          order: 1,
          description: "Finance only Equb",
          needsRequest: false,
          hasReason: false,
          isSaving: false,
        },

        {
          name: "Travel",
          order: 3,
          description: "Travel",
          needsRequest: false,
          hasReason: false,
          isSaving: false,
        },
        {
          name: "Car",
          order: 4,
          description: "Car",
          needsRequest: false,
          hasReason: false,
          isSaving: false,
        },
        {
          name: "House",
          order: 5,
          description: "House",
          needsRequest: false,
          hasReason: false,
          isSaving: false,
        },
      ],
      skipDuplicates: true,
    });
  } catch (error) {
    console.log("Error seeding equb categories");
    console.log(error);
  }
}

createEqubCategories().then(() => {
  console.log("Equb category seed finished successfully.");
});
