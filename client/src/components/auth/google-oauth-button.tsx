import { baseURL } from "@/lib/base-url";
import { Button } from "../ui/button";

const GoogleOauthButton = (props: { label: string }) => {
  const { label } = props;
  const handleClick = () => {
    window.location.href = `${baseURL}/auth/google`;
  };
  return (
    <Button
      onClick={handleClick}
      variant="outline"
      type="button"
      className="w-full"
    >
      <img
    src="../images/google.png"
    alt="Google logo"
    className="w-5 h-5"
  />
      {label} with Google
    </Button>
  );
};

export default GoogleOauthButton;
