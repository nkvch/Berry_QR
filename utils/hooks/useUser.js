import { useContext } from "react";
import Context from "../../state/context";

const useUser = () => {
  const { user } = useContext(Context);

  console.log(user);

  const { id, role: { roleName: role }, firstName, lastName } = user;

  return { id, role, firstName, lastName };
};

export default useUser;
