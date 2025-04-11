import { Link } from "react-router-dom";

const Logo = (props: { url?: string }) => {
  const { url = "/" } = props;
  return (
    <div className="flex items-center justify-center sm:justify-start">
      <Link to={url}>
        <div className="flex h-6 w-6 items-center justify-center rounded-md text-primary-foreground overflow-hidden">
          <img
            src="/taskmaster.png"
            alt="Logo"
            className="h-full w-full object-cover"
          />
        </div>
      </Link>
    </div>
  );
};

export default Logo;
