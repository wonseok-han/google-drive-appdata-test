"use client";

const Login = () => {
  const handleLogin = async () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <div>
      <button
        className="bg-gray-300 p-2 rounded-lg font-semibold"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  );
};

export default Login;
