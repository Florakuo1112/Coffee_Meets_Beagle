import ViewMyPet from "./ViewMyPet";
import CreateMyPet from "./CreateMyPet";
import { useState } from "react";

function Pets() {
  const [isCreatePet, setIsCreatePet] = useState(false);
  return (
    <div className="mx-auto w-full space-y-8 px-0 py-4 sm:px-4">
      {!isCreatePet && <ViewMyPet setIsCreatePet={setIsCreatePet} />}
      {isCreatePet && <CreateMyPet setIsCreatePet={setIsCreatePet} />}
    </div>
  );
}

export default Pets;
