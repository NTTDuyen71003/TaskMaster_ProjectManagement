import { baseURL } from "@/lib/base-url";
import { Button } from "../ui/button";

const GoogleOauthButton = (props: { label: string }) => {
  const { label } = props;
  const handleClick = () => {
    window.location.href = `${baseURL}/auth/google`;
  };
  const GoogleIcon = () => <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />;
  return (
    <Button
      onClick={handleClick}
      variant="outline"
      type="button"
      className="flex items-center gap-2 border-gray-300 h-10 rounded-lg">
      <GoogleIcon />Google</Button>
  );
};

export default GoogleOauthButton;
