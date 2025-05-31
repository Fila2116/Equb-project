import { createBranches } from "./branch/create.seeder";
import { createEqubCategories } from "./equb-category/create.seeder";
import { createEqubTypes } from "./equb-type/create.seeder";
import { createRoles } from "./role/create.seeder";
import { createStaffs } from "./staff/create.seeder";

async function seed() {
  await createBranches();
  await createRoles();
  await createStaffs();
  await createEqubCategories();
  await createEqubTypes();
}

seed().then(() => {
  console.log("Staff seed finished successfully.");
});
