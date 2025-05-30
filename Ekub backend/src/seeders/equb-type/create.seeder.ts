import prisma from "../../app/config/db.config";

export async function createEqubTypes() {
  try {
    await prisma.equbType.createMany({
      data: [
        {
          name: "Daily",
          description: "Daily Equb",
          interval: 1,
        },
        {
          name: "Weekly",
          description: "Weekly Equb",
          interval: 7,
        },
        {
          name: "Monthly",
          description: "Monthly Equb",
          interval: 30,
        },
      ],
    });
  } catch (error) {
    console.log("Error seeding equb types");
    console.log(error);
  }
}

createEqubTypes().then(() => {
  console.log("Equb type seed finished successfully.");
});
